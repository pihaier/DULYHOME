import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.20.1/mod.ts'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // 이미 번역된 메시지는 스킵
    if (record.translated_message) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 주문 정보 가져오기 (컨텍스트용) - 여러 테이블에서 시도
    let orderData = null;
    
    // Try market_research_requests first
    const { data: marketResearch } = await supabase
      .from('market_research_requests')
      .select('*')
      .eq('reservation_number', record.reservation_number)
      .single();
    
    if (marketResearch) {
      orderData = marketResearch;
    } else {
      // Try inspection_applications
      const { data: inspection } = await supabase
        .from('inspection_applications')
        .select('*')
        .eq('reservation_number', record.reservation_number)
        .single();
      
      if (inspection) {
        orderData = inspection;
      } else {
        // Try sampling_orders
        const { data: sampling } = await supabase
          .from('sampling_orders')
          .select('*')
          .eq('reservation_number', record.reservation_number)
          .single();
        
        if (sampling) {
          orderData = sampling;
        } else {
          // Try bulk_orders
          const { data: bulk } = await supabase
            .from('bulk_orders')
            .select('*')
            .eq('reservation_number', record.reservation_number)
            .single();
          
          orderData = bulk;
        }
      }
    }
    
    // 주문 정보 압축 (시스템 메시지용)
    let compressedOrderInfo = ''
    if (orderData) {
      // GPT-4로 주문 정보 압축
      const compressionResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
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
        temperature: 0.3,
        max_tokens: 200,
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

    // GPT-4 번역 요청
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 1000,
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
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})