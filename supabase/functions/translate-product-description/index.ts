import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { description, productName } = await req.json()
    
    // 로그 최소화로 성능 개선
    
    if (!description) {
      return new Response(
        JSON.stringify({ error: '번역할 설명이 필요합니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // HTML 태그 제거하고 텍스트만 추출
    const cleanDescription = description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // script 태그 제거
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // style 태그 제거
      .replace(/\{[^}]*\}/g, '') // 모든 JSON 데이터 제거
      .replace(/<[^>]*>/g, ' ') // 나머지 HTML 태그 제거
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()

    // 텍스트가 너무 짧으면 번역하지 않음
    if (cleanDescription.length < 10) {
      return new Response(
        JSON.stringify({ 
          success: true,
          translatedDescription: description,
          translatedText: cleanDescription 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // translate-message와 동일한 방식으로 복원
    const systemMessage = `You are a professional translator for e-commerce product descriptions. 
Translate Chinese text to Korean while maintaining business context.

Rules:
1. Translate to natural Korean
2. Keep technical terms consistent
3. Preserve numbers, dates, codes
4. Keep brand names in original form`

    const userMessage = `Translate the following Chinese message to Korean:
"${cleanDescription.substring(0, 3000)}"

Provide only the translated text without any explanation.`
    
    let completion;
    try {
      // GPT-5-mini로 번역 요청 - translate-message와 동일
      completion = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_completion_tokens: 2000,
      })
      
    } catch (apiError) {
      throw apiError
    }

    const translatedText = completion.choices[0]?.message?.content?.trim() || cleanDescription

    // 번역 성공 응답
    const responseData = { 
      success: true,
      translatedDescription: description, // 일단 원본 HTML 유지
      translatedText: translatedText // 순수 텍스트 번역
    }
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
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