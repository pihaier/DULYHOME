import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// OpenAI 클라이언트 초기화 (GPT-5-mini 사용)
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

// Supabase 클라이언트 초기화
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 번역 필드 매핑 정의 (FIELDS_USAGE 문서 기반으로 정확하게 매핑)
const TRANSLATION_MAPPINGS = {
  // 제품조사 서비스
  market_research_requests: {
    ko_to_zh: [
      { source: 'product_name', target: 'product_name_chinese' },
      { source: 'requirements', target: 'requirements_chinese' },
      { source: 'logo_details', target: 'logo_details_chinese' },
      { source: 'box_details', target: 'box_details_chinese' }
    ],
    zh_to_ko: [
      { source: 'industry_cn', target: 'industry_kr' },
      { source: 'company_status_cn', target: 'company_status' },
      { source: 'business_scope_cn', target: 'business_scope_kr' },
      { source: 'other_matters_cn', target: 'other_matters_kr' },
      { source: 'export_port_cn', target: 'export_port' }
    ]
  },
  
  // 검품감사 서비스
  inspection_applications: {
    ko_to_zh: [
      { source: 'product_name', target: 'product_name_translated' },
      { source: 'special_requirements', target: 'special_requirements_translated' }
    ]
    // 중국어 → 한국어 번역 필드 없음 (중국 직원이 중국어 입력하는 필드가 없음)
  },
  
  // 공장컨택 서비스
  factory_contact_requests: {
    ko_to_zh: [
      { source: 'product_name', target: 'product_name_chinese' },
      { source: 'product_description', target: 'product_description_chinese' },
      { source: 'special_requirements', target: 'special_requirements_chinese' }
    ]
    // 이 테이블 자체에는 중국어 → 한국어 번역 필드 없음
  },
  
  // 확인요청 (공장컨택 관련)
  confirmation_requests: {
    zh_to_ko: [
      { source: 'title_chinese', target: 'title_korean' },
      { source: 'description_chinese', target: 'description_korean' },
      { source: 'options_chinese', target: 'options_korean' }
    ],
    ko_to_zh: [
      // 고객 응답 중국어 번역
      { source: 'customer_response_original', target: 'customer_response_translated' },
      { source: 'customer_comment', target: 'customer_comment_translated' }
    ]
  },
  
  // 견적서 (공장컨택 관련)
  factory_contact_quotations: {
    zh_to_ko: [
      { source: 'supplier_name_chinese', target: 'supplier_name' },
      { source: 'delivery_terms_chinese', target: 'delivery_terms' },
      { source: 'payment_terms_chinese', target: 'payment_terms' },
      { source: 'notes_chinese', target: 'notes' }
    ]
  }
};

// 메인 핸들러
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { table, record, event } = await req.json();
    
    console.log(`\n=== 자동 번역 시작: ${table} (${event}) ===`);
    console.log('레코드 ID:', record.id);
    
    // 해당 테이블의 번역 매핑 가져오기
    const mappings = TRANSLATION_MAPPINGS[table];
    if (!mappings) {
      console.log('번역 매핑이 없는 테이블:', table);
      return new Response(
        JSON.stringify({ success: true, message: 'No translation mappings for this table' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 번역할 필드 수집
    const fieldsToTranslate = [];
    
    // 한국어 → 중국어 번역 필드 체크
    if (mappings.ko_to_zh) {
      for (const mapping of mappings.ko_to_zh) {
        if (record[mapping.source] && !record[mapping.target]) {
          fieldsToTranslate.push({
            ...mapping,
            value: record[mapping.source],
            direction: 'ko_to_zh'
          });
        }
      }
    }
    
    // 중국어 → 한국어 번역 필드 체크
    if (mappings.zh_to_ko) {
      for (const mapping of mappings.zh_to_ko) {
        if (record[mapping.source] && !record[mapping.target]) {
          fieldsToTranslate.push({
            ...mapping,
            value: record[mapping.source],
            direction: 'zh_to_ko'
          });
        }
      }
    }
    
    if (fieldsToTranslate.length === 0) {
      console.log('번역할 필드가 없습니다');
      return new Response(
        JSON.stringify({ success: true, message: 'No fields to translate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`번역할 필드 수: ${fieldsToTranslate.length}`);
    
    // GPT-5-mini로 일괄 번역 수행
    const translationPrompt = fieldsToTranslate.map((field, idx) => {
      const sourceLang = field.direction === 'ko_to_zh' ? '한국어' : '중국어';
      const targetLang = field.direction === 'ko_to_zh' ? '중국어' : '한국어';
      return `[번역 ${idx + 1}] ${sourceLang}에서 ${targetLang}로:\n"${field.value}"`;
    }).join('\n\n');
    
    const systemPrompt = `당신은 한중/중한 전문 번역가입니다.
무역 및 비즈니스 문서를 정확하고 자연스럽게 번역합니다.
각 번역은 [번역 N] 형식으로 시작하여 구분해주세요.

번역 규칙:
1. 전문 용어는 업계 표준 용어 사용
2. 숫자, 단위, 제품 코드는 그대로 유지
3. 회사명/브랜드명은 원문 병기 가능
4. 자연스러운 비즈니스 톤 유지`;

    console.log('GPT-5-mini 번역 요청 중...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: translationPrompt }
      ],
      max_completion_tokens: 2000
    });
    
    const translatedText = completion.choices[0].message.content;
    console.log('번역 완료');
    
    // 번역 결과 파싱
    const updates: any = {};
    const translationPattern = /\[번역\s*(\d+)\][^\[]*?([^\[]+?)(?=\[번역|$)/gs;
    const matches = [...translatedText.matchAll(translationPattern)];
    
    for (let i = 0; i < fieldsToTranslate.length; i++) {
      const field = fieldsToTranslate[i];
      const match = matches.find(m => parseInt(m[1]) === i + 1);
      
      if (match) {
        const translatedValue = match[2].trim().replace(/^["']|["']$/g, '');
        updates[field.target] = translatedValue;
        console.log(`✓ ${field.source} → ${field.target}`);
      }
    }
    
    // 번역 결과가 있으면 DB 업데이트
    if (Object.keys(updates).length > 0) {
      console.log(`DB 업데이트 중... (${Object.keys(updates).length}개 필드)`);
      
      const { error: updateError } = await supabase
        .from(table)
        .update(updates)
        .eq('id', record.id);
      
      if (updateError) {
        console.error('DB 업데이트 오류:', updateError);
        throw updateError;
      }
      
      console.log('✅ DB 업데이트 완료');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        translatedFields: Object.keys(updates).length,
        updates,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0,
          reasoning_tokens: completion.usage?.completion_tokens_details?.reasoning_tokens || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('자동 번역 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: '번역 중 오류가 발생했습니다',
        details: error?.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});