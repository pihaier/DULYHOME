import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
      const text = await req.text()
      try {
        requestData = JSON.parse(text)
      } catch {
        requestData = { query: text }
      }
    }
    
    const { query, categoryCode, hs6digit } = requestData
    
    // Check for either categoryCode or hs6digit
    if (!query || (!categoryCode && !hs6digit)) {
      return new Response(
        JSON.stringify({ error: 'Query and either categoryCode or hs6digit are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          status: 400 
        }
      )
    }

    const searchCode = hs6digit || categoryCode
    console.log(`DB search for: ${query} in code: ${searchCode}`)

    // Initialize clients with error checking
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. 일반 쿼리로 데이터 가져오기 (spec 컬럼들 직접 선택)
    const { data: hsCodeResults, error } = await supabase
      .from('hs_codes')
      .select(`
        hs_code, 
        name_ko, 
        name_en, 
        category_name,
        spec_name,
        required_spec_name,
        reference_spec_name,
        spec_description,
        spec_details
      `)
      .like('hs_code', `${searchCode}%`)
      .limit(100)
    
    if (error) {
      console.error('Database query error:', error)
      throw error
    }
    
    if (hsCodeResults && hsCodeResults.length > 0) {
      // 6자리로 그룹화
      const grouped = new Map()
      
      hsCodeResults.forEach(result => {
        const prefix = result.hs_code.substring(0, 6)
        
        // "기타"인 경우 category_name 추가
        let displayName = result.name_ko
        if (result.name_ko === '기타' && result.category_name) {
          displayName = `기타 ${result.category_name}`
        }
        
        // spec 정보 구성 (있는 경우에만)
        const specs = (result.spec_name || result.required_spec_name || result.reference_spec_name) ? {
          spec_name: result.spec_name || null,
          required_spec_name: result.required_spec_name || null,
          reference_spec_name: result.reference_spec_name || null,
          spec_description: result.spec_description || null,
          spec_details: result.spec_details || null
        } : null
        
        const detailCode = {
          hs_code: result.hs_code,
          name_ko: displayName,
          name_en: result.name_en,
          specs: specs
        }
        
        if (!grouped.has(prefix)) {
          grouped.set(prefix, {
            code_prefix: prefix,
            description_korean: displayName,
            description_english: result.name_en,
            total_codes: 1,
            has_specifications: !!specs,
            detail_codes: [detailCode]
          })
        } else {
          const group = grouped.get(prefix)
          group.total_codes++
          group.detail_codes.push(detailCode)
          // specs가 있으면 표시
          if (specs && !group.has_specifications) {
            group.has_specifications = true
          }
          // 첫 번째 non-"기타" 설명 사용
          if (result.name_ko !== '기타' && group.description_korean.startsWith('기타')) {
            group.description_korean = displayName
            group.description_english = result.name_en
          }
        }
      })
      
      const finalResults = Array.from(grouped.values()).map(group => ({
        hs_code: group.code_prefix,
        description_korean: group.description_korean,
        description_english: group.description_english,
        total_codes: group.total_codes,
        has_specifications: group.has_specifications || false,
        detail_codes: group.detail_codes.slice(0, 10) // 상위 10개
      }))
      
      console.log(`Found ${finalResults.length} grouped results for code ${searchCode}`)
      
      return new Response(
        JSON.stringify({
          query,
          categoryCode: categoryCode || searchCode,
          results: finalResults,
          total_groups: finalResults.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }

    // 결과가 없을 때
    return new Response(
      JSON.stringify({
        query,
        categoryCode: categoryCode || searchCode,
        results: [],
        total_groups: 0,
        message: '해당 카테고리에 대한 HS코드를 찾을 수 없습니다.'
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