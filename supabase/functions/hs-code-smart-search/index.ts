// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @ts-ignore
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

declare const Deno: any

// ============= 타입 정의 =============
interface Prediction4Digit {
  code: string
  reason: string
  confidence: number
}

interface SearchResult {
  hs_code: string
  name_ko?: string
  name_en?: string
  category_name?: string
  start_date?: string | null
  end_date?: string | null
  hs_description?: string | null
  quantity_unit?: string | null
  hs_code_10?: string | null
}

interface FinalSelection {
  hsCode: string
  reason: string
  confidence: number
  relevanceScore?: number  // 1-10 관련성 점수
}

// ============= 유틸리티 함수 =============
function getTodayYYYYMMDD(): string {
  const now = new Date()
  const y = now.getUTCFullYear().toString()
  const m = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  const d = now.getUTCDate().toString().padStart(2, '0')
  return `${y}${m}${d}`
}

function normalizeYYYYMMDD(s?: string | null): string | null {
  if (!s) return null
  const onlyDigits = s.replace(/\D+/g, '')
  if (onlyDigits.length >= 8) return onlyDigits.slice(0, 8)
  return null
}

function isWithinValidity(start?: string | null, end?: string | null, today?: string): boolean {
  const t = today ?? getTodayYYYYMMDD()
  const s = normalizeYYYYMMDD(start)
  const e = normalizeYYYYMMDD(end)
  if (s && t < s) return false
  if (e && t > e) return false
  return true
}

function getHs10(code: string | undefined | null): string {
  if (!code) return ''.padStart(10, '0')
  const trimmed = code.toString().slice(0, 10)
  return trimmed.padEnd(10, '0')
}

// ============= CORS 헤더 =============
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============= 메인 핸들러 =============
Deno.serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 파싱
    const contentType = req.headers.get('content-type')
    let requestData: any
    
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
    
    const { query, debug = false } = requestData
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          status: 400 
        }
      )
    }

    console.log(`🔍 HS Code Search: "${query}"`)

    // 서비스 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing')
    }
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // ============= Step 0: 정확한 품목명 매칭 확인 =============
    console.log(`\n[Step 0] Checking for exact name match...`)
    
    const { data: exactMatches } = await supabase
      .from('hs_codes')
      .select('hs_code, name_ko, name_en, category_name')
      .or(`name_ko.eq.${query},name_en.eq.${query}`)
      .limit(10)
    
    if (exactMatches && exactMatches.length > 0) {
      console.log(`✅ Found ${exactMatches.length} exact matches`)
      
      // 정확히 1개만 매칭되면 바로 반환
      if (exactMatches.length === 1) {
        const match = exactMatches[0]
        console.log(`✅ Single exact match found: ${match.hs_code}`)
        return new Response(
          JSON.stringify({
            status: 'success',
            hsCode: match.hs_code,
            description: match.name_ko || match.name_en || match.category_name,
            score: 1.0,
            method: 'exact-match',
            debug: debug ? {
              exactMatch: true,
              matchedField: match.name_ko === query ? 'name_ko' : 'name_en'
            } : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      }
      
      // 여러 개 매칭되면 GPT로 선택
      console.log(`⚠️ Multiple exact matches found, using GPT to select best match`)
      
      const selectionPrompt = `제품: "${query}"

다음 중 정확히 일치하는 항목들입니다. 가장 적합한 것을 선택하세요:
${exactMatches.map((m, i) => `${i+1}. ${m.hs_code}: ${m.name_ko || m.name_en}`).join('\n')}

JSON 응답:
{
  "hsCode": "선택한 코드",
  "reason": "선택 이유",
  "confidence": 0.9-1.0
}`

      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "HS 코드 선택 전문가. JSON만 응답." },
          { role: "user", content: selectionPrompt }
        ],
        max_completion_tokens: 200,
        reasoning_effort: "minimal"
      })

      const selection = JSON.parse(response.choices[0]?.message?.content || '{}')
      
      if (selection.hsCode) {
        return new Response(
          JSON.stringify({
            status: 'success',
            hsCode: selection.hsCode,
            description: selection.reason,
            score: selection.confidence || 0.95,
            method: 'exact-match-selected',
            debug: debug ? {
              multipleExactMatches: exactMatches.length,
              selected: selection
            } : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      }
    } else {
      console.log(`⚠️ No exact matches found, proceeding with prediction`)
    }

    // ============= Step 1: 4자리 HS 코드 예측 =============
    console.log(`\n[Step 1] Predicting 4-digit HS codes...`)
    
    const predict4DigitPrompt = `제품: "${query}"

이 제품의 HS 코드 4자리를 예측하세요.
가능성 높은 순서대로 최대 3개까지 제시하세요.

JSON 응답:
{
  "predictions": [
    {"code": "4자리", "reason": "간단한 설명", "confidence": 0.0-1.0}
  ]
}`

    let predictions: Prediction4Digit[] = []
    
    try {
      const predictionResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "HS 코드 4자리 예측 전문가. JSON만 응답." },
          { role: "user", content: predict4DigitPrompt }
        ],
        max_completion_tokens: 250,
        reasoning_effort: "minimal"
      })
      
      const responseContent = predictionResponse.choices[0]?.message?.content || '{}'
      console.log('GPT raw response:', responseContent)
      
      const predData = JSON.parse(responseContent)
      predictions = predData.predictions || []
      
      console.log(`\n📌 ========== 4자리 예측 결과 ==========`)
      console.log(`✅ 예측 개수: ${predictions.length}개`)
      predictions.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.code} - ${p.reason} (신뢰도: ${(p.confidence * 100).toFixed(1)}%)`)
      })
      console.log(`========================================\n`)
    } catch (error) {
      console.error('4-digit prediction error:', error)
    }
    
    // 예측이 없으면 일반적인 폴백 시도
    if (predictions.length === 0) {
      console.log('⚠️ No predictions from GPT, trying general fallback...')
      
      // 일반적인 제품 카테고리 추측
      const fallbackPrompt = `"${query}"가 속할 수 있는 일반적인 HS 코드 2자리를 추측하세요.
      
예시:
- 전자제품/가전: 84, 85
- 의류/섬유: 61, 62, 63
- 식품: 01-24
- 화장품: 33
- 플라스틱: 39

JSON 응답:
{
  "chapter": "2자리 숫자",
  "reason": "추측 이유"
}`

      try {
        const fallbackResponse = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "HS 코드 챕터 추측 전문가. JSON만 응답." },
            { role: "user", content: fallbackPrompt }
          ],
          max_completion_tokens: 100,
          reasoning_effort: "minimal"
        })
        
        const fallbackData = JSON.parse(fallbackResponse.choices[0]?.message?.content || '{}')
        
        if (fallbackData.chapter) {
          // 2자리 챕터로 직접 검색
          const chapter2Digit = fallbackData.chapter.toString().padStart(2, '0')
          predictions = [{
            code: chapter2Digit + '00',
            reason: fallbackData.reason || '일반 카테고리 추측',
            confidence: 0.3
          }]
          console.log(`✅ Fallback chapter: ${chapter2Digit}`)
        } else {
          // 그래도 실패하면 에러 반환
          return new Response(
            JSON.stringify({
              status: 'no_results',
              message: `"${query}"에 대한 HS 코드를 예측할 수 없습니다.`,
              suggestion: '더 구체적인 제품명을 입력하거나 수동으로 HS 코드를 선택하세요.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
          )
        }
      } catch (error) {
        console.error('Fallback prediction error:', error)
        return new Response(
          JSON.stringify({
            status: 'no_results',
            message: `"${query}"에 대한 HS 코드를 예측할 수 없습니다.`,
            suggestion: '다른 제품명을 시도하거나 수동으로 HS 코드를 입력하세요.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      }
    }

    // ============= Step 2: 예측된 4자리로 DB 검색 =============
    console.log(`\n[Step 2] Searching DB with predicted 4-digit codes...`)
    
    const today = getTodayYYYYMMDD()
    let allCandidates: SearchResult[] = []
    
    for (const pred of predictions) {
      // 점(.)을 제거하고 4자리로 만들기
      const cleanCode = pred.code.replace(/\D/g, '').padStart(4, '0').substring(0, 4);
      console.log(`  Searching for ${cleanCode} (from ${pred.code})...`)
      
      const { data: results, error } = await supabase
        .from('hs_codes')
        .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
        .like('hs_code', `${cleanCode}%`)
        .limit(100)
      
      if (error) {
        console.error(`Search error for ${pred.code}:`, error)
        continue
      }
      
      if (results && results.length > 0) {
        // 유효기간 필터링
        const validResults = results.filter(r => 
          isWithinValidity(r.start_date, r.end_date, today)
        )
        
        console.log(`    Found ${validResults.length} valid items for ${cleanCode}`)
        allCandidates.push(...validResults)
      }
    }
    
    console.log(`\n📦 ========== DB 검색 결과 ==========`)
    console.log(`✅ 총 후보 개수: ${allCandidates.length}개`)
    if (allCandidates.length > 0) {
      console.log(`📋 상위 5개 후보:`)
      allCandidates.slice(0, 5).forEach((c, i) => {
        console.log(`  ${i+1}. ${c.hs_code}: ${c.name_ko || c.name_en || c.category_name}`)
      })
    } else {
      console.log(`⚠️ 4자리 검색 결과 없음 - 폴백 필요`)
    }
    console.log(`=====================================\n`)
    
    // ============= Step 2.5: 4자리 결과가 없으면 2자리로 재검색 =============
    if (allCandidates.length === 0 && predictions.length > 0) {
      console.log(`⚠️ No results with 4-digit codes, trying 2-digit (chapter) search...`)
      
      // 첫 번째 예측의 앞 2자리로 검색
      const firstPrediction = predictions[0]
      const chapter2Digit = firstPrediction.code.replace(/\D/g, '').padStart(4, '0').substring(0, 2)
      
      console.log(`  Searching for chapter ${chapter2Digit}...`)
      
      const { data: chapterResults } = await supabase
        .from('hs_codes')
        .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
        .like('hs_code', `${chapter2Digit}%`)
        .limit(200)
      
      if (chapterResults && chapterResults.length > 0) {
        const validChapterResults = chapterResults.filter(r => 
          isWithinValidity(r.start_date, r.end_date, today)
        )
        
        console.log(`✅ Found ${validChapterResults.length} items in chapter ${chapter2Digit}`)
        
        // 대표 품목들을 추출 (중복 제거)
        const uniqueItems = new Map<string, SearchResult>()
        for (const item of validChapterResults) {
          const key = item.name_ko || item.category_name || item.name_en || ''
          if (key && !uniqueItems.has(key)) {
            uniqueItems.set(key, item)
          }
        }
        
        const representativeItems = Array.from(uniqueItems.values()).slice(0, 50)
        
        // GPT에게 2자리 검색 결과 중에서 선택하게 함
        const chapter2SelectPrompt = `원본 제품: "${query}"

예측한 4자리 코드 ${predictions.map(p => p.code).join(', ')}에 해당하는 품목이 없어서,
챕터 ${chapter2Digit}의 전체 품목을 보여드립니다.

다음 중에서 "${query}"와 가장 유사한 품목을 선택하세요:

${representativeItems.map((item, i) => 
  `${i+1}. ${item.hs_code}: ${item.name_ko || item.category_name || item.name_en}`
).slice(0, 30).join('\n')}

JSON 응답:
{
  "hsCode": "10자리 코드",
  "reason": "선택 이유",
  "confidence": 0.0-1.0,
  "method": "chapter-fallback"
}`

        try {
          const chapterSelectResponse = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
              { role: "system", content: "HS 코드 선택 전문가. 제품명과 가장 유사한 것을 선택. JSON만 응답." },
              { role: "user", content: chapter2SelectPrompt }
            ],
            max_completion_tokens: 200,
            reasoning_effort: "minimal"
          })
          
          const chapterSelection = JSON.parse(chapterSelectResponse.choices[0]?.message?.content || '{}')
          
          if (chapterSelection.hsCode) {
            const selected = representativeItems.find(item => 
              item.hs_code === chapterSelection.hsCode
            )
            
            return new Response(
              JSON.stringify({
                status: 'success',
                hsCode: getHs10(chapterSelection.hsCode),
                description: chapterSelection.reason,
                score: chapterSelection.confidence,
                method: 'chapter-fallback',
                card: selected ? {
                  hs_code: getHs10(selected.hs_code),
                  name_ko: selected.name_ko ?? null,
                  name_en: selected.name_en ?? null,
                  quantity_unit: selected.quantity_unit ?? null,
                  reason_line: `4자리 예측 실패 → ${chapter2Digit}장 검색 → GPT 선택`
                } : null,
                debug: debug ? {
                  originalPredictions: predictions,
                  chapter2Digit,
                  totalChapterItems: validChapterResults.length,
                  method: 'chapter-fallback'
                } : undefined
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
            )
          }
        } catch (error) {
          console.error('Chapter selection error:', error)
        }
        
        // 2자리 선택도 실패하면 전체 결과를 후보로 사용
        allCandidates = validChapterResults
      }
    }
    
    // 여전히 후보가 없으면 에러 반환
    if (allCandidates.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'no_match',
          message: '적합한 HS 코드를 찾을 수 없습니다.',
          query,
          triedPredictions: predictions,
          suggestedAction: 'HS 코드를 직접 입력하거나 다른 제품명을 시도하세요.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }

    // ============= Step 3: GPT로 최종 선택 및 관련성 평가 =============
    console.log(`\n[Step 3] Final selection with GPT and relevance scoring...`)
    
    // 후보가 너무 많으면 상위 30개만 사용
    const candidatesForSelection = allCandidates.slice(0, 30)
    
    console.log(`📋 최종 선택 후보 ${candidatesForSelection.length}개:`)
    candidatesForSelection.slice(0, 5).forEach((c, i) => {
      console.log(`  ${i+1}. ${c.hs_code}: ${c.name_ko || c.name_en || c.category_name}`)
    })
    
    const finalSelectionPrompt = `원본 검색어: "${query}"

다음 HS 코드 후보 중에서 "${query}"에 가장 적합한 것을 선택하세요:

${candidatesForSelection.map((c, i) => 
  `${i+1}. ${c.hs_code}: ${c.name_ko || c.name_en || c.category_name}`
).join('\n')}

중요: 
1. 원본 검색어 "${query}"와 가장 정확히 일치하는 것을 선택
2. 물품특성(기능, 용도, 성분)을 고려하여 관련성 점수 매기기 (1-10점)
   - 10점: 완벽히 일치
   - 8-9점: 매우 관련성 높음
   - 5-7점: 관련성 있지만 정확하지 않음
   - 1-4점: 관련성 낮음

JSON 응답:
{
  "hsCode": "10자리 코드",
  "reason": "선택 이유",
  "confidence": 0.0-1.0,
  "relevanceScore": 1-10 (정수)
}`

    try {
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "HS 코드 최종 선택 전문가. 제품명과 정확히 일치하는 것을 선택. JSON만 응답." },
          { role: "user", content: finalSelectionPrompt }
        ],
        max_completion_tokens: 200,
        reasoning_effort: "minimal"
      })
      
      const finalSelection: FinalSelection = JSON.parse(
        finalResponse.choices[0]?.message?.content || '{}'
      )
      
      console.log(`\n🎯 ========== 최종 선택 결과 ==========`)
      console.log(`✅ 선택된 HS코드: ${finalSelection.hsCode}`)
      console.log(`📝 선택 이유: ${finalSelection.reason}`)
      console.log(`💯 신뢰도: ${(finalSelection.confidence * 100).toFixed(1)}%`)
      console.log(`📊 관련성 점수: ${finalSelection.relevanceScore || 0}점`)
      console.log(`🔍 평가: ${(finalSelection.relevanceScore || 0) <= 7 ? '⚠️ 낮음 - 2자리 폴백 필요' : '✅ 적합 - 통과'}`)
      console.log(`=====================================\n`)
      
      // 관련성 점수 체크 (7점 이하 또는 점수가 없으면 2자리 폴백)
      const scoreToCheck = finalSelection.relevanceScore || 0
      if (scoreToCheck <= 7) {
        console.log(`⚠️ Low relevance score: ${scoreToCheck}. Falling back to 2-digit chapter search...`)
        
        // 첫 번째 예측의 앞 2자리로 검색
        if (predictions.length > 0) {
          const firstPrediction = predictions[0]
          const chapter2Digit = firstPrediction.code.replace(/\D/g, '').padStart(4, '0').substring(0, 2)
          
          console.log(`  Searching for chapter ${chapter2Digit} due to low relevance...`)
          
          const { data: chapterResults } = await supabase
            .from('hs_codes')
            .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
            .like('hs_code', `${chapter2Digit}%`)
            .limit(200)
          
          if (chapterResults && chapterResults.length > 0) {
            const validChapterResults = chapterResults.filter(r => 
              isWithinValidity(r.start_date, r.end_date, today)
            )
            
            console.log(`✅ Found ${validChapterResults.length} items in chapter ${chapter2Digit} for re-evaluation`)
            
            // 대표 품목들을 추출 (중복 제거)
            const uniqueItems = new Map<string, SearchResult>()
            for (const item of validChapterResults) {
              const key = item.name_ko || item.category_name || item.name_en || ''
              if (key && !uniqueItems.has(key)) {
                uniqueItems.set(key, item)
              }
            }
            
            const representativeItems = Array.from(uniqueItems.values()).slice(0, 50)
            
            // GPT에게 다시 평가하게 함
            const reEvaluationPrompt = `원본 제품: "${query}"

처음 선택한 항목의 관련성이 낮아(${finalSelection.relevanceScore}점) 챕터 ${chapter2Digit}의 전체 품목을 다시 평가합니다.

다음 중에서 "${query}"와 가장 유사한 품목을 선택하고 관련성 점수를 매기세요:

${representativeItems.map((item, i) => 
  `${i+1}. ${item.hs_code}: ${item.name_ko || item.category_name || item.name_en}`
).slice(0, 30).join('\n')}

물품특성(기능, 용도, 성분)을 고려하여 관련성 점수 매기기 (1-10점):
- 10점: 완벽히 일치
- 8-9점: 매우 관련성 높음  
- 5-7점: 관련성 있지만 정확하지 않음
- 1-4점: 관련성 낮음

JSON 응답:
{
  "hsCode": "10자리 코드",
  "reason": "선택 이유",
  "confidence": 0.0-1.0,
  "relevanceScore": 1-10,
  "method": "chapter-reevaluation"
}`

            try {
              const reEvalResponse = await openai.chat.completions.create({
                model: "gpt-5-mini",
                messages: [
                  { role: "system", content: "HS 코드 선택 전문가. 제품명과 가장 유사한 것을 선택하고 관련성 점수 매기기. JSON만 응답." },
                  { role: "user", content: reEvaluationPrompt }
                ],
                max_completion_tokens: 200,
                reasoning_effort: "minimal"
              })
              
              const reEvalSelection = JSON.parse(reEvalResponse.choices[0]?.message?.content || '{}')
              
              console.log(`\n🔄 ========== 재평가 결과 ==========`)
              console.log(`✅ 재선택된 HS코드: ${reEvalSelection.hsCode}`)
              console.log(`📝 재선택 이유: ${reEvalSelection.reason}`)
              console.log(`💯 재평가 신뢰도: ${(reEvalSelection.confidence * 100).toFixed(1)}%`)
              console.log(`📊 재평가 관련성 점수: ${reEvalSelection.relevanceScore || 0}점 (이전: ${finalSelection.relevanceScore}점)`)
              console.log(`🎯 결과: ${reEvalSelection.relevanceScore >= 8 ? '✅ 8점 이상 - 재평가 통과!' : '❌ 8점 미만 - 재평가 실패'}`)
              console.log(`=====================================\n`)
              
              if (reEvalSelection.hsCode && reEvalSelection.relevanceScore >= 8) {
                const selected = representativeItems.find(item => 
                  item.hs_code === reEvalSelection.hsCode
                )
                
                return new Response(
                  JSON.stringify({
                    status: 'success',
                    hsCode: getHs10(reEvalSelection.hsCode),
                    description: reEvalSelection.reason,
                    score: reEvalSelection.confidence,
                    relevanceScore: reEvalSelection.relevanceScore,
                    method: 'chapter-reevaluation',
                    card: selected ? {
                      hs_code: getHs10(selected.hs_code),
                      name_ko: selected.name_ko ?? null,
                      name_en: selected.name_en ?? null,
                      quantity_unit: selected.quantity_unit ?? null,
                      reason_line: `관련성 점수 ${finalSelection.relevanceScore}점 → ${chapter2Digit}장 재평가 → ${reEvalSelection.relevanceScore}점`
                    } : null,
                    debug: debug ? {
                      originalPredictions: predictions,
                      firstSelectionScore: finalSelection.relevanceScore,
                      chapter2Digit,
                      reEvaluationScore: reEvalSelection.relevanceScore,
                      method: 'chapter-reevaluation'
                    } : undefined
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
                )
              }
            } catch (error) {
              console.error('Re-evaluation error:', error)
            }
          }
        }
      }
      
      // 신뢰도 체크 및 반환 (관련성 점수가 8점 이상이거나 재평가 실패 시)
      // 단, 관련성 점수가 낮으면 위에서 이미 재평가 시도함
      if (finalSelection.hsCode && (finalSelection.confidence >= 0.7 || scoreToCheck > 7)) {
        // 선택된 항목의 상세 정보 찾기
        const selected = candidatesForSelection.find(c => 
          c.hs_code === finalSelection.hsCode || 
          c.hs_code_10 === finalSelection.hsCode
        )
        
        return new Response(
          JSON.stringify({
            status: 'success',
            hsCode: getHs10(finalSelection.hsCode),
            description: finalSelection.reason,
            score: finalSelection.confidence,
            relevanceScore: finalSelection.relevanceScore,
            method: '4digit-prediction',
            card: selected ? {
              hs_code: getHs10(selected.hs_code),
              name_ko: selected.name_ko ?? null,
              name_en: selected.name_en ?? null,
              quantity_unit: selected.quantity_unit ?? null,
              reason_line: `4자리 예측 + DB 검색 + GPT 선택 (관련성: ${finalSelection.relevanceScore || 0}점)`
            } : null,
            debug: debug ? {
              predictions,
              totalCandidates: allCandidates.length,
              finalSelection
            } : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      } else if (finalSelection.hsCode) {
        // 신뢰도가 낮은 경우
        return new Response(
          JSON.stringify({
            status: 'low_confidence',
            message: '정확한 분류를 위해 추가 정보가 필요합니다.',
            candidates: [{
              hs_code: finalSelection.hsCode,
              reason: finalSelection.reason,
              confidence: finalSelection.confidence
            }],
            suggestedQuestion: '이 제품의 주요 용도나 재질을 더 자세히 설명해주세요.',
            debug: debug ? {
              predictions,
              totalCandidates: allCandidates.length,
              finalSelection
            } : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      } else {
        throw new Error('No selection made by GPT')
      }
    } catch (error) {
      console.error('Final selection error:', error)
      
      // GPT 선택 실패시 첫 번째 후보 반환
      if (candidatesForSelection.length > 0) {
        const fallback = candidatesForSelection[0]
        return new Response(
          JSON.stringify({
            status: 'low_confidence',
            message: '자동 선택이 어려워 가장 유사한 항목을 제시합니다.',
            candidates: [{
              hs_code: fallback.hs_code,
              name: fallback.name_ko || fallback.name_en,
              confidence: 0.5
            }],
            debug: debug ? {
              error: 'GPT selection failed',
              fallbackUsed: true
            } : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      }
    }

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