import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json()
    
    // 이미 번역된 메시지는 스킵
    if (record.translated_message) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // service_type에 따라 해당 테이블에서만 주문 정보 가져오기
    let orderData = null;
    
    if (record.service_type) {
      // service_type과 테이블 매핑
      const tableMap = {
        'market-research': 'market_research_requests',
        'factory-contact': 'factory_contact_requests', 
        'inspection': 'inspection_applications',
        'sampling': 'sampling_orders',
        'bulk-purchase': 'bulk_orders',
        'purchase-agency': 'purchase_agency_orders',
        'shipping-agency': 'shipping_agency_orders'
      };
      
      const tableName = tableMap[record.service_type];
      
      if (tableName) {
        const { data } = await supabase
          .from(tableName)
          .select('*')
          .eq('reservation_number', record.reservation_number)
          .single();
        
        orderData = data;
      }
    }
    
    // 주문 정보 압축 (시스템 메시지용)
    let compressedOrderInfo = ''
    if (orderData) {
      // GPT-5-mini로 주문 정보 압축
      const compressionResponse = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: '주문 정보를 한국어로 간단히 요약하세요. 핵심 정보만 1-2줄로 압축하세요.'
          },
          {
            role: 'user',
            content: `서비스: ${orderData.service_type}\n회사: ${orderData.company_name}\n제품: ${orderData.product_name || ''}\n상태: ${orderData.status}`
          }
        ],
        max_completion_tokens: 200,
      })
      
      compressedOrderInfo = compressionResponse.choices[0]?.message?.content?.trim() || ''
    }

    // 최근 메시지 5개 가져오기
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('reservation_number', record.reservation_number)
      .neq('id', record.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // 시스템 메시지 구성 (압축된 정보 포함)
    const systemMessage = `You are a professional translator for a Korea-China trade ERP system. 
You must translate messages between Korean and Chinese while maintaining business context.

[주문 정보 요약]
${compressedOrderInfo}

[최근 대화 내역 (최대 5개)]
${recentMessages?.reverse().map(msg => 
  `${msg.sender_name}: ${msg.original_message}`
).join('\n') || '대화 시작'}

[번역 규칙]
1. 비즈니스 정중한 톤 유지
2. 기술 용어는 일관되게 번역
3. 숫자, 날짜, 코드는 그대로 유지
4. 제품명/회사명은 원문을 괄호 안에 병기
5. 검품/감사 관련 전문용어는 업계 표준 사용`

    const targetLang = record.original_language === 'ko' ? 'zh' : 'ko'
    const userMessage = `Translate the following ${record.original_language === 'ko' ? 'Korean' : 'Chinese'} message to ${targetLang === 'ko' ? 'Korean' : 'Chinese'}:
"${record.original_message}"

Provide only the translated text without any explanation.`

    // GPT-5-mini 번역 요청
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      max_completion_tokens: 1000,
    })

    const translatedText = completion.choices[0]?.message?.content?.trim() || record.original_message

    // 번역 결과 업데이트
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({
        translated_message: translatedText,
        translated_language: targetLang,
      })
      .eq('id', record.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, translated: translatedText }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})