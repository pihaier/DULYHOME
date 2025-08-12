import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Deno.serve를 직접 사용하여 JWT 검증 우회
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Set proper content-type for request parsing
    const contentType = req.headers.get('content-type')
    let requestData
    
    if (contentType && contentType.includes('application/json')) {
      requestData = await req.json()
    } else {
      // Try to parse as JSON anyway
      const text = await req.text()
      try {
        requestData = JSON.parse(text)
      } catch {
        requestData = { query: text }
      }
    }
    
    const { query } = requestData
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          status: 400 
        }
      )
    }

    console.log(`Processing query: ${query}`)

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured')
      throw new Error('OpenAI API key is not configured')
    }
    
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Step 1: GPT로 가능한 4자리 HS코드 카테고리 5개 추측
    const categoryCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `한국 수입 무역 HS코드 전문가입니다.
제품명을 분석하여 가능한 4자리 HS코드 카테고리를 추측합니다.

주요 HS코드 카테고리:
- 01-05: 동물 및 동물성 생산품
- 06-14: 식물성 생산품
- 15: 동식물성 유지
- 16-24: 조제 식료품
- 25-27: 광물성 생산품
- 28-38: 화학공업 생산품
- 39-40: 플라스틱, 고무
- 41-43: 가죽
- 44-46: 목재
- 47-49: 종이
- 50-63: 섬유
- 64-67: 신발, 모자
- 68-70: 석재, 유리
- 71: 귀금속
- 72-83: 철강, 금속
- 84-85: 기계, 전기기기
- 86-89: 운송기기
- 90-92: 정밀기기
- 93: 무기
- 94-96: 잡품

중요 예시:
- "커피머신" → ["8419", "8516", "8509", "8473", "8479"] (기계류)
- "커피" → ["0901", "2101", "2106"] (커피 원료/제품)
- "노트북" → ["8471", "8473", "8504", "8523", "8528"] (컴퓨터/전자)
- "슬리퍼" → ["6404", "6405", "6402", "6403", "6401"] (신발류)`
        },
        {
          role: "user",
          content: `제품: "${query}"

이 제품의 가능한 4자리 HS코드를 JSON 형식으로 추측하세요.
가장 가능성 높은 순서대로 5개를 제시하세요.

{
  "categories": [
    {"code": "4자리", "reason": "선택 이유"},
    ...
  ]
}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
    
    const prediction = JSON.parse(categoryCompletion.choices[0].message.content || '{}')
    console.log('GPT predicted categories:', prediction)

    // Step 2: 예측된 카테고리를 DB에서 검증하고 실제 데이터 가져오기
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const validCategories = []
    
    // 각 예측된 카테고리에 대해 DB 검증
    for (const category of prediction.categories || []) {
      const { data, error } = await supabase
        .from('hs_codes')
        .select('hs_code, name_ko, name_en')
        .like('hs_code', `${category.code}%`)
        .limit(10)
      
      if (data && data.length > 0) {
        // 해당 카테고리에 실제 데이터가 있으면 추가
        const categoryName = data[0].name_ko || data[0].name_en
        validCategories.push({
          code: category.code,
          name: categoryName,
          description: category.reason || categoryName,
          usage: '일반용',
          difference: category.reason || `${categoryName} 관련 제품`,
          count: data.length,
          sample_codes: data.slice(0, 3).map(d => d.hs_code.substring(0, 6))
        })
      }
    }
    
    // 만약 검증된 카테고리가 5개 미만이면 키워드 검색으로 보충
    if (validCategories.length < 5) {
      const keywords = query.split(' ')
      
      for (const keyword of keywords) {
        if (validCategories.length >= 5) break
        
        const { data, error } = await supabase
          .from('hs_codes')
          .select('hs_code, name_ko, name_en')
          .ilike('name_ko', `%${keyword}%`)
          .limit(50)
        
        if (data) {
          // 4자리로 그룹화
          const grouped = new Map()
          data.forEach(item => {
            const category = item.hs_code.substring(0, 4)
            if (!grouped.has(category)) {
              grouped.set(category, {
                code: category,
                name: item.name_ko,
                items: [item]
              })
            } else {
              grouped.get(category).items.push(item)
            }
          })
          
          // 빈도순 정렬
          const sortedGroups = Array.from(grouped.values())
            .sort((a, b) => b.items.length - a.items.length)
          
          for (const group of sortedGroups) {
            if (validCategories.length >= 5) break
            if (!validCategories.find(c => c.code === group.code)) {
              validCategories.push({
                code: group.code,
                name: group.name,
                description: group.name,
                usage: group.items.length > 5 ? '일반용' : '특수용',
                difference: `${group.name} 관련 제품`,
                count: group.items.length,
                sample_codes: group.items.slice(0, 3).map(i => i.hs_code.substring(0, 6))
              })
            }
          }
        }
      }
    }
    
    // Step 3: GPT로 각 카테고리의 차이점 설명 추가
    if (validCategories.length > 0) {
      try {
        const descriptionCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `HS코드 전문가입니다. 각 코드의 차이점을 간단명료하게 설명합니다.`
            },
            {
              role: "user",
              content: `제품 "${query}"에 대한 HS코드 카테고리들입니다. 각각의 특징을 한 줄로 설명하세요:
${validCategories.map((c, i) => `${i+1}. ${c.code}: ${c.name}`).join('\n')}

각 카테고리별로 용도나 특징의 차이를 설명하세요.`
            }
          ],
          temperature: 0.5
        })
        
        const differences = descriptionCompletion.choices[0].message.content?.split('\n') || []
        
        // 차이점 업데이트
        validCategories.forEach((category, index) => {
          const diffLine = differences.find(line => line.includes(category.code))
          if (diffLine) {
            const diffText = diffLine.split(':').slice(1).join(':').trim()
            category.difference = diffText || category.difference
          }
        })
      } catch (err) {
        console.error('GPT description error:', err)
        // 에러 무시하고 계속
      }
    }
    
    // 최종 결과 반환 (최대 5개)
    const finalCategories = validCategories.slice(0, 5)
    
    console.log('Final categories:', finalCategories)
    
    return new Response(
      JSON.stringify({
        query,
        categories: finalCategories,
        message: finalCategories.length > 0 
          ? '실제 HS코드 검색 결과입니다. 해당하는 카테고리를 선택해주세요.'
          : '검색 결과가 없습니다. 다른 검색어를 시도해보세요.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        status: 500 
      }
    )
  }
})