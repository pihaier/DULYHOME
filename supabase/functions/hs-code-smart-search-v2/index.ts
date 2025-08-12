// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @ts-ignore
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

declare const Deno: any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, debug = false } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }, status: 400 }
      )
    }

    console.log(`🔍 Searching for: "${query}"`)

    // Initialize services
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! })

    // Step 1: Ask GPT what to search for
    console.log("Step 1: Asking GPT for search terms...")
    
    const searchPrompt = `"${query}"를 HS 코드 DB에서 찾으려면 뭘로 검색해야 할까?
간단한 검색어 몇 개만 JSON 배열로 알려줘.`

    const searchResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "검색어 제안. JSON 배열만 응답." },
        { role: "user", content: searchPrompt }
      ],
      max_completion_tokens: 100,
      reasoning_effort: "minimal"
    })

    const searchTerms = JSON.parse(searchResponse.choices[0]?.message?.content || '[]')
    console.log("GPT suggested:", searchTerms)

    // Step 2: Search DB with those terms
    console.log("Step 2: Searching database...")
    
    const allResults = []
    
    for (const term of searchTerms) {
      const { data } = await supabase
        .from('hs_codes')
        .select('hs_code, name_ko, name_en, category_name')
        .or(`name_ko.ilike.%${term}%,name_en.ilike.%${term}%,category_name.ilike.%${term}%`)
        .limit(50)
      
      if (data) {
        allResults.push(...data)
      }
    }

    // Remove duplicates
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.hs_code, item])).values()
    )

    console.log(`Found ${uniqueResults.length} results`)

    // Step 3: Ask GPT to judge
    console.log("Step 3: Asking GPT to judge results...")
    
    if (uniqueResults.length === 0) {
      // No results, ask for better search terms
      const retryPrompt = `"${query}"를 찾으려고 ${searchTerms.join(', ')}로 검색했는데 없어.
다른 검색어 제안해줘. JSON 배열로.`

      const retryResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "검색어 제안. JSON 배열만." },
          { role: "user", content: retryPrompt }
        ],
        max_completion_tokens: 100,
        reasoning_effort: "minimal"
      })

      const retryTerms = JSON.parse(retryResponse.choices[0]?.message?.content || '[]')
      
      return new Response(
        JSON.stringify({
          status: 'no_results',
          message: '검색 결과가 없습니다.',
          triedTerms: searchTerms,
          suggestedTerms: retryTerms
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }

    // Show results to GPT and ask for judgment
    const resultList = uniqueResults.map((r, i) => 
      `${i+1}. ${r.hs_code} - ${r.name_ko || r.name_en || r.category_name}`
    ).join('\n')

    const judgePrompt = `검색 결과:
${resultList}

위 목록을 읽고 "${query}"에 해당하는 것이 있는지 판단해.

JSON: {"found": true/false, "hsCode": "코드" or null, "reason": "이유"}`

    const judgeResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "HS 코드 판단. JSON만 응답." },
        { role: "user", content: judgePrompt }
      ],
      max_completion_tokens: 150,
      reasoning_effort: "minimal"
    })

    const judgment = JSON.parse(judgeResponse.choices[0]?.message?.content || '{}')
    console.log("GPT judgment:", judgment)

    if (judgment.found && judgment.hsCode) {
      const selected = uniqueResults.find(r => r.hs_code === judgment.hsCode)
      return new Response(
        JSON.stringify({
          status: 'success',
          hsCode: judgment.hsCode,
          description: selected?.name_ko || selected?.name_en || judgment.reason,
          reason: judgment.reason,
          debug: debug ? {
            searchTerms,
            resultsCount: uniqueResults.length,
            judgment
          } : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }

    // Not found - ask for better search terms
    const improvePrompt = `"${query}"를 찾으려고 했는데 이 결과들은 관련이 없대:
${resultList.slice(0, 10)}

"${query}"를 찾으려면 어떤 검색어를 써야 할까?
JSON 배열로 답해.`

    const improveResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "검색어 개선. JSON 배열만." },
        { role: "user", content: improvePrompt }
      ],
      max_completion_tokens: 100,
      reasoning_effort: "minimal"
    })

    const betterTerms = JSON.parse(improveResponse.choices[0]?.message?.content || '[]')

    return new Response(
      JSON.stringify({
        status: 'no_match',
        message: '적합한 HS 코드를 찾지 못했습니다.',
        searchedTerms: searchTerms,
        suggestedTerms: betterTerms,
        resultsShown: uniqueResults.slice(0, 5).map(r => ({
          code: r.hs_code,
          name: r.name_ko || r.name_en || r.category_name
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }, status: 500 }
    )
  }
})