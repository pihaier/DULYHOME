// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @ts-ignore
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

declare const Deno: any

// ============= 타입 정의 =============
interface ProductAttributes {
  materials?: string[]       // 재료/성분
  usage?: string[]           // 용도
  isElectric?: boolean       // 전기 제품 여부
  isFood?: boolean          // 식품 여부
  hasSugar?: boolean        // 당 첨가 여부
  isMedicine?: boolean      // 의약품 여부
  isToy?: boolean          // 장난감 여부
  textileType?: 'knitted' | 'woven' | 'non-woven' | null  // 섬유 종류
  keywords?: string[]       // 추가 키워드
  originalTerms?: string[]  // 원문 단어
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
  hit_count: number
  matched_fields: string[]
  hit_score?: number
}

interface FinalResult {
  hs_code: string
  name: string
  score: number
  reason: string
}

// ============= HS 섹션/챕터 상수 및 유틸 =============
function makeChapterRange(start: number, end: number): string[] {
  const chapters: string[] = []
  for (let i = start; i <= end; i++) {
    chapters.push(i.toString().padStart(2, '0'))
  }
  return chapters
}

const HS_SECTIONS: { id: string; name: string; chapters: string[] }[] = [
  { id: 'I', name: '동물/축산', chapters: makeChapterRange(1, 5) },
  { id: 'II', name: '식물', chapters: makeChapterRange(6, 14) },
  { id: 'III', name: '동식물성 유지', chapters: makeChapterRange(15, 15) },
  { id: 'IV', name: '조제식료·음료·담배', chapters: makeChapterRange(16, 24) },
  { id: 'V', name: '광물', chapters: makeChapterRange(25, 27) },
  { id: 'VI', name: '화학', chapters: makeChapterRange(28, 38) },
  { id: 'VII', name: '플라스틱·고무', chapters: makeChapterRange(39, 40) },
  { id: 'VIII', name: '가죽·모피', chapters: makeChapterRange(41, 43) },
  { id: 'IX', name: '목재·코르크', chapters: makeChapterRange(44, 46) },
  { id: 'X', name: '제지·인쇄물', chapters: makeChapterRange(47, 49) },
  { id: 'XI', name: '섬유·의류', chapters: makeChapterRange(50, 63) },
  { id: 'XII', name: '신발·모자 등', chapters: makeChapterRange(64, 67) },
  { id: 'XIII', name: '석재·세라믹·유리', chapters: makeChapterRange(68, 70) },
  { id: 'XIV', name: '귀석·귀금속', chapters: makeChapterRange(71, 71) },
  { id: 'XV', name: '철강·비철금속', chapters: makeChapterRange(72, 83) },
  { id: 'XVI', name: '기계·전기', chapters: makeChapterRange(84, 85) },
  { id: 'XVII', name: '차량·항공·선박', chapters: makeChapterRange(86, 89) },
  { id: 'XVIII', name: '계측·의료·시계·악기', chapters: makeChapterRange(90, 92) },
  { id: 'XIX', name: '무기', chapters: makeChapterRange(93, 93) },
  { id: 'XX', name: '가구·완구·기타', chapters: makeChapterRange(94, 96) },
  { id: 'XXI', name: '예술품', chapters: makeChapterRange(97, 97) },
]

const SECTION_ID_SET = new Set(HS_SECTIONS.map(s => s.id))
const VALID_CHAPTER_SET = new Set(HS_SECTIONS.flatMap(s => s.chapters))

function getAllowedChaptersFor(sectionIds: string[]): Set<string> {
  const result = new Set<string>()
  for (const sec of HS_SECTIONS) {
    if (sectionIds.includes(sec.id)) {
      for (const ch of sec.chapters) result.add(ch)
    }
  }
  return result
}

// 검색 가중치 및 공통 유틸
const FIELD_WEIGHTS: Record<string, number> = {
  name_ko: 3,
  name_en: 3,
  category_name: 2,
  hs_description: 1,
}

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

function getChapter(code: string | undefined | null): string | null {
  if (!code || code.length < 2) return null
  return code.substring(0, 2)
}

interface ExtractedAttributes {
  materials?: string[]
  usage?: string[]
  isElectric?: boolean
  isFood?: boolean
  hasSugar?: boolean
  isMedicine?: boolean
  isToy?: boolean
  textileType?: 'knitted' | 'woven' | 'non-woven' | null
  keywords?: string[]
}

function applyGirCuts(
  candidates: Array<{ hs_code: string; hit_score: number } & any>,
  attributes: ExtractedAttributes
): { filtered: typeof candidates; reasons: string[] } {
  const reasons: string[] = []
  let result = [...candidates]

  const chapterOf = (code: string) => code.substring(0, 2)

  if (attributes.isElectric === false) {
    const before = result.length
    result = result.filter(c => chapterOf(c.hs_code) !== '85')
    if (result.length < before) reasons.push('전기 아님→85장 배제')
  }

  if (attributes.isToy === false) {
    const before = result.length
    result = result.filter(c => chapterOf(c.hs_code) !== '95')
    if (result.length < before) reasons.push('장난감 아님→95장 배제')
  }

  if (attributes.isMedicine === false) {
    const before = result.length
    result = result.filter(c => chapterOf(c.hs_code) !== '30')
    if (result.length < before) reasons.push('의약 아님→30장 배제')
  }

  if (attributes.isFood === true && attributes.hasSugar === false) {
    const before = result.length
    result = result.filter(c => chapterOf(c.hs_code) !== '17')
    if (result.length < before) reasons.push('식품·무당→17장 배제')
  }

  // 의류 편성/직물 편향 가점
  if (attributes.textileType === 'knitted') {
    for (const c of result) if (chapterOf(c.hs_code) === '61') c.hit_score += 1
  } else if (attributes.textileType === 'woven') {
    for (const c of result) if (chapterOf(c.hs_code) === '62') c.hit_score += 1
  }

  return { filtered: result, reasons }
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
    
    const { query, debug = false, useCache = true } = requestData
    
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

    // ============= 0단계: 정확한 품목명 매칭 확인 =============
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
      
      // 여러 개 매칭되면 속성 기반으로 구분 필요
      console.log(`⚠️ Multiple exact matches found, proceeding with attribute analysis`)
    } else {
      console.log(`⚠️ No exact matches found, proceeding with attribute-based search`)
    }

    // ============= 0.5단계: 섹션/챕터 선별 (모델 지시 준수) =============
    console.log(`\n[Step 0.5] Selecting HS sections and chapters...`)

    const sectionListForPrompt = HS_SECTIONS
      .map(s => {
        const first = s.chapters[0]
        const last = s.chapters[s.chapters.length - 1]
        const range = first === last ? first : `${first}–${last}`
        return `${s.id} ${range} ${s.name}`
      })
      .join('\n')

    const sectionSelectPrompt = `이 목록에서 해당될 가능성 상위 섹션 1–3개와, 각 섹션 안의 챕터 2–4개를 골라라.\n\n제품: "${query}"\n\n이유 한 줄과 확인이 필요한 예/아니오 질문 1–2개만 붙여라.\n\n출력은 JSON(sections:[{id,reason}], chapters:[{no,reason}], questions:[…]) 외 금지.\n목록 밖 번호 금지(헛번호 만들면 실패). 섹션 ID는 로마숫자(I..XXI), 챕터는 2자리(01..97)만 허용.\n\n섹션 목록:\n${sectionListForPrompt}`

    let selectedSections: string[] = []
    let selectedChapters: string[] = []
    let sectionStageQuestions: string[] = []

    try {
      const sectionSelResp = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "주어진 섹션 목록만 사용. JSON만 응답." },
          { role: "user", content: sectionSelectPrompt }
        ],
        max_completion_tokens: 300,
        reasoning_effort: "minimal"
      })
      const rawSel = sectionSelResp.choices[0]?.message?.content ?? '{}'
      console.log('Section selection raw:', rawSel)
      const sel = JSON.parse(rawSel)

      const sectionsArr = Array.isArray(sel.sections) ? sel.sections : []
      const chaptersArr = Array.isArray(sel.chapters) ? sel.chapters : []

      selectedSections = sectionsArr
        .map((s: any) => String(s.id).toUpperCase())
        .filter((id: string) => SECTION_ID_SET.has(id))
        .slice(0, 3)

      const allowedBySection = selectedSections.length > 0
        ? getAllowedChaptersFor(selectedSections)
        : new Set<string>(HS_SECTIONS.flatMap(s => s.chapters))

      selectedChapters = chaptersArr
        .map((c: any) => String(c.no).padStart(2, '0'))
        .filter((no: string) => VALID_CHAPTER_SET.has(no) && allowedBySection.has(no))
        .slice(0, 4)

      sectionStageQuestions = Array.isArray(sel.questions) ? sel.questions.slice(0, 2) : []
    } catch (e) {
      console.warn('Section/chapter selection failed, proceeding without restriction', e)
    }

    const allowedChapters = selectedChapters.length > 0 ? new Set<string>(selectedChapters) : null

    // ============= 1단계: 속성 추출 + 검색 키워드 만들기 =============
    console.log(`\n[Step 1] Extract attributes & build search keywords...`)

    const attributeExtractPrompt = `상품 설명: "${query}"
아래 속성을 JSON으로만 추출:
{
  "materials": ["..."],
  "usage": ["..."],
  "isElectric": true/false/null,
  "isFood": true/false/null,
  "hasSugar": true/false/null,
  "isMedicine": true/false/null,
  "isToy": true/false/null,
  "textileType": "knitted"|"woven"|"non-woven"|null,
  "keywords": ["ko/en/zh 혼합 자유"]
}`

    let extracted: ExtractedAttributes = {}
    try {
      const attrResp = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "상품 속성 추출. JSON만 응답." },
          { role: "user", content: attributeExtractPrompt }
        ],
        max_completion_tokens: 250,
        reasoning_effort: "minimal"
      })
      extracted = JSON.parse(attrResp.choices[0]?.message?.content ?? '{}')
    } catch {}

    const searchKeywordPrompt = `"${query}"를 HS 코드 DB에서 찾으려면 어떤 검색어로 찾을까? JSON 배열로 6~10개. ko/en/zh 혼합 허용. 속성 참고: ${JSON.stringify(extracted)}`

    console.log(`📝 Search keyword prompt:`, searchKeywordPrompt)

    let searchKeywordResponse
    try {
      searchKeywordResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "검색 키워드 제안. JSON 배열만 응답."
          },
          {
            role: "user",
            content: searchKeywordPrompt
          }
        ],
        max_completion_tokens: 150,
        reasoning_effort: "minimal"
      })
    } catch (gptError: any) {
      console.error(`GPT-5-mini error:`, gptError)
      console.error(`Error details:`, gptError.message, gptError.response?.data)
      // GPT-5-mini 실패시 기본값 사용
      searchKeywordResponse = {
        choices: [{
          message: { content: JSON.stringify([query]) }
        }]
      } as any
    }

    const rawKeywords = searchKeywordResponse.choices[0]?.message?.content
    console.log(`GPT-5-mini suggested keywords:`, rawKeywords)
    
    let searchTerms: string[] = []
    try {
      searchTerms = JSON.parse(rawKeywords || '[]')
    } catch {
      searchTerms = [query]
    }
    
    console.log(`✅ Will search with:`, searchTerms)
    
    // 검색어가 없으면 원본 쿼리 사용
    if (!searchTerms || searchTerms.length === 0) {
      console.log(`⚠️ No keywords from GPT, using original query`)
      searchTerms = [query]
    }

    // ============= 2단계: GPT가 제안한 키워드로 검색 =============
    console.log(`\n[Step 2] Searching DB with GPT suggested keywords...`)
    
    // 각 검색어로 검색
    const hitMap = new Map<string, SearchResult>()
    
    console.log(`Starting search with ${searchTerms.length} terms...`)
    
    for (const term of searchTerms) {
      console.log(`  Searching for: "${term}"...`)
      // name_ko 검색
      const { data: nameKoResults } = await supabase
        .from('hs_codes')
        .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
        .ilike('name_ko', `%${term}%`)
        .limit(100)
      
      if (nameKoResults && nameKoResults.length > 0) {
        console.log(`    Found ${nameKoResults.length} hits in name_ko`)
        for (const row of nameKoResults) {
          const chap = row.hs_code?.substring(0, 2)
          if (allowedChapters && (!chap || !allowedChapters.has(chap))) continue
          const key = row.hs_code
          if (!hitMap.has(key)) {
            hitMap.set(key, {
              hs_code: row.hs_code,
              name_ko: row.name_ko,
              name_en: row.name_en,
              category_name: row.category_name,
              hit_count: 0,
              matched_fields: []
            })
          }
          const result = hitMap.get(key)!
          result.hit_count++
          if (!result.matched_fields.includes('name_ko')) {
            result.matched_fields.push('name_ko')
          }
        }
      }
      
      // name_en 검색
      const { data: nameEnResults } = await supabase
        .from('hs_codes')
        .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
        .ilike('name_en', `%${term}%`)
        .limit(100)
      
      if (nameEnResults) {
        for (const row of nameEnResults) {
          const chap = row.hs_code?.substring(0, 2)
          if (allowedChapters && (!chap || !allowedChapters.has(chap))) continue
          const key = row.hs_code
          if (!hitMap.has(key)) {
            hitMap.set(key, {
              hs_code: row.hs_code,
              name_ko: row.name_ko,
              name_en: row.name_en,
              category_name: row.category_name,
              hit_count: 0,
              matched_fields: []
            })
          }
          const result = hitMap.get(key)!
          result.hit_count++
          if (!result.matched_fields.includes('name_en')) {
            result.matched_fields.push('name_en')
          }
        }
      }
      
      // category_name 검색
      const { data: categoryResults } = await supabase
        .from('hs_codes')
        .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
        .ilike('category_name', `%${term}%`)
        .limit(100)
      
      if (categoryResults) {
        for (const row of categoryResults) {
          const chap = row.hs_code?.substring(0, 2)
          if (allowedChapters && (!chap || !allowedChapters.has(chap))) continue
          const key = row.hs_code
          if (!hitMap.has(key)) {
            hitMap.set(key, {
              hs_code: row.hs_code,
              name_ko: row.name_ko,
              name_en: row.name_en,
              category_name: row.category_name,
              hit_count: 0,
              matched_fields: []
            })
          }
          const result = hitMap.get(key)!
          result.hit_count++
          if (!result.matched_fields.includes('category_name')) {
            result.matched_fields.push('category_name')
          }
        }
      }
    }
    
    // 히트수로 정렬하고 상위 30-40개 추출
    let searchResults = Array.from(hitMap.values())
      .sort((a, b) => b.hit_count - a.hit_count)
      .slice(0, 40)
    
    console.log(`✅ Found ${searchResults.length} candidates (top hits: ${searchResults[0]?.hit_count || 0})`)
    
    // 결과가 없으면 GPT에게 다시 물어보기
    if (searchResults.length === 0) {
      console.log(`⚠️ No results found. Asking GPT for better keywords...`)
      
      const retryPrompt = `"${query}"를 HS 코드 DB에서 찾으려고 했는데 
이 검색어들로는 안 나왔어: ${searchTerms.join(', ')}

다른 검색어 5개 제안해줘. JSON 배열로.`
      
      const retryResponse = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "검색 키워드 제안. JSON 배열만 응답."
          },
          {
            role: "user",
            content: retryPrompt
          }
        ],
        max_completion_tokens: 150,
        reasoning_effort: "minimal"
      })
      
      const newKeywords = JSON.parse(retryResponse.choices[0]?.message?.content || '[]')
      console.log(`🔄 GPT suggested new keywords:`, newKeywords)
      
      // 새 키워드로 재검색
      if (newKeywords.length > 0) {
        searchTerms.push(...newKeywords)
        // 재검색 로직 실행
        for (const term of newKeywords) {
          console.log(`  Re-searching for: "${term}"...`)
          const { data: retryResults } = await supabase
            .from('hs_codes')
            .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
            .or(`name_ko.ilike.%${term}%,name_en.ilike.%${term}%,category_name.ilike.%${term}%`)
            .limit(100)
          
          if (retryResults) {
            for (const row of retryResults) {
              const chap = row.hs_code?.substring(0, 2)
              if (allowedChapters && (!chap || !allowedChapters.has(chap))) continue
              const key = row.hs_code
              if (!hitMap.has(key)) {
                hitMap.set(key, {
                  hs_code: row.hs_code,
                  name_ko: row.name_ko,
                  name_en: row.name_en,
                  category_name: row.category_name,
                  hit_count: 0,
                  matched_fields: []
                })
              }
              hitMap.get(key)!.hit_count++
            }
          }
        }
        
        searchResults = Array.from(hitMap.values())
          .sort((a, b) => b.hit_count - a.hit_count)
          .slice(0, 40)
      }
      
      // 그래도 없으면 챕터 예측 요청
      if (searchResults.length === 0) {
        console.log(`⚠️ Still no results. Asking GPT for chapter prediction...`)
        
        const chapterPrompt = `"${query}"가 HS 코드 어느 챕터에 속할까?
이 제품이 어느 챕터(2자리)에 속하는지와 검색어를 JSON으로 답해줘.`
        
        const chapterResponse = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            {
              role: "system",
              content: "HS 코드 챕터 예측. JSON 형식: {\"chapter\": \"번호\", \"chapterName\": \"이름\", \"searchTerms\": [\"단어1\", \"단어2\"]}"
            },
            {
              role: "user",
              content: chapterPrompt
            }
          ],
          max_completion_tokens: 200,
          reasoning_effort: "minimal"
        })
        
        const chapterData = JSON.parse(chapterResponse.choices[0]?.message?.content || '{}')
        console.log(`📚 GPT predicted chapter:`, chapterData)
        
        // 챕터 기반 검색
        if (chapterData.chapter) {
          const { data: chapterResults } = await supabase
            .from('hs_codes')
            .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
            .like('hs_code', `${chapterData.chapter}%`)
            .limit(200)
          
          if (chapterResults && chapterResults.length > 0) {
            console.log(`Found ${chapterResults.length} items in chapter ${chapterData.chapter}`)
            
            // 챕터 내에서 추가 검색어로 필터링
            if (chapterData.searchTerms) {
              for (const result of chapterResults) {
                let score = 0
                for (const term of chapterData.searchTerms) {
                  if (result.name_ko?.includes(term) || 
                      result.name_en?.toLowerCase().includes(term.toLowerCase()) ||
                      result.category_name?.includes(term)) {
                    score++
                  }
                }
                if (score > 0) {
                  const key = result.hs_code
                  if (!hitMap.has(key)) {
                    hitMap.set(key, {
                      hs_code: result.hs_code,
                      name_ko: result.name_ko,
                      name_en: result.name_en,
                      category_name: result.category_name,
                      hit_count: score,
                      matched_fields: ['chapter_search']
                    })
                  }
                }
              }
              
              searchResults = Array.from(hitMap.values())
                .sort((a, b) => b.hit_count - a.hit_count)
                .slice(0, 40)
            } else {
              // 검색어가 없으면 챕터 전체에서 상위 40개
              searchResults = chapterResults.slice(0, 40).map(r => ({
                hs_code: r.hs_code,
                name_ko: r.name_ko,
                name_en: r.name_en,
                category_name: r.category_name,
                hit_count: 1,
                matched_fields: ['chapter']
              }))
            }
          }
        }
      }
      
      // 최종적으로도 없으면 에러 반환
      if (searchResults.length === 0) {
        return new Response(
          JSON.stringify({
            status: 'no_results',
            message: `"${query}"에 대한 HS 코드를 찾을 수 없습니다.`,
            triedKeywords: searchTerms,
            suggestion: '수동으로 HS 코드를 입력하거나 다른 제품명을 시도하세요.',
            debug: debug ? {
              originalKeywords: searchTerms.slice(0, 5),
              retryKeywords: newKeywords,
              message: 'No results even after retry'
            } : undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
        )
      }
    }
    
    // ============= 3단계: 검색 결과 정리 =============
    console.log(`\n[Step 3] Processing search results...`)
    
    // 유효기간 필터 + 가중치 정렬 + 40개 컷
    const today = getTodayYYYYMMDD()
    let filteredResults = searchResults
      .filter(r => isWithinValidity(r.start_date ?? null, r.end_date ?? null, today))
      .map(r => ({ ...r, hit_score: r.hit_score ?? r.hit_count }))
      .sort((a, b) => (b.hit_score ?? 0) - (a.hit_score ?? 0))
      .slice(0, 40)
    console.log(`✅ Total candidates after validity: ${filteredResults.length}`)
    
    // ============= 3.5단계: 빠른 컷(GIR 힌지 룰) =============
    const girCut = applyGirCuts(filteredResults as any, extracted)
    filteredResults = girCut.filtered
      .sort((a, b) => (b.hit_score ?? 0) - (a.hit_score ?? 0))
      .slice(0, 15)
    console.log(`✅ After GIR hinge cuts: ${filteredResults.length}`)
    
    // ============= 4단계: 최종 판정 (GIR 규칙 적용) =============
    console.log(`\n[Step 4] Final judgment with GIR rules...`)
    
    const candidateList = filteredResults.slice(0, 30).map((r, idx) => 
      `${idx + 1}. ${r.hs_code} - ${r.name_ko || r.category_name || r.name_en} (히트: ${r.hit_count})`
    ).join('\n')
    
    const finalJudgmentPrompt = `제품: "${query}"

후보 목록:
${candidateList}

속성: ${JSON.stringify(extracted)}
제약: 다음 챕터 안에서만 선택: ${selectedChapters.length > 0 ? selectedChapters.join(', ') : '모든 챕터 허용'}
요구: 10자리 Top3 + 점수 + 한줄 이유. 1위 < 0.7이면 예/아니오 질문 1–2개를 생성. 관련 없으면 noGoodMatch: true.

JSON 응답:
{
  "top3": [{"hs_code":"10자리","score":0.0,"reason":"..."}],
  "noGoodMatch": true/false,
  "betterSearchTerms": [],
  "questions": ["...", "..."]
}`

    console.log(`📝 Final judgment prompt:`, finalJudgmentPrompt)

    const finalResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "HS 코드 전문가. JSON만 응답."
        },
        {
          role: "user",
          content: finalJudgmentPrompt
        }
      ],
      max_completion_tokens: 300,
      reasoning_effort: "minimal"
    })
    
    const rawJudgment = finalResponse.choices[0]?.message?.content || '{}'
    console.log(`GPT-5-mini judgment raw response:`, rawJudgment)
    
    const judgment = JSON.parse(rawJudgment)
    
    console.log(`✅ Final judgment complete`)
    console.log(`Judgment result:`, JSON.stringify(judgment, null, 2))
    
    // top3가 없으면 수동으로 구성
    if (!judgment.top3 || !Array.isArray(judgment.top3) || judgment.top3.length === 0) {
      console.log(`⚠️ No top3 in judgment, creating fallback from search results`)
      judgment.top3 = filteredResults.slice(0, 3).map((r, idx) => ({
        hs_code: r.hs_code,
        score: Math.max(0.5, 0.9 - (idx * 0.1)),
        reason: `${r.name_ko || r.category_name || r.name_en} (히트수: ${r.hit_count})`
      }))
    }
    
    // ============= 결과 반환 =============
    
    // 확인 질문이 필요한 경우
    if (judgment.needsConfirmation && judgment.confirmationQuestion) {
      return new Response(
        JSON.stringify({
          status: 'needs_confirmation',
          question: judgment.confirmationQuestion,
          candidates: judgment.top3,
          // attributes는 아직 수집하지 않으므로 빈 객체로 전달
          attributes: {},
          debug: debug ? {
            searchTerms,
            totalHits: searchResults.length,
            filteredHits: filteredResults.length,
            gptJudgment: judgment
          } : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }
    
    // noGoodMatch인 경우 betterSearchTerms로 재검색
    if (judgment.noGoodMatch) {
      console.log(`⚠️ No good matches. GPT suggests better search terms:`, judgment.betterSearchTerms)
      
      if (judgment.betterSearchTerms && judgment.betterSearchTerms.length > 0) {
        console.log(`🔄 Retrying with better search terms...`)
        
        // 새로운 검색어로 재검색
        const retryHitMap = new Map<string, SearchResult>()
        
        for (const term of judgment.betterSearchTerms) {
          console.log(`  Re-searching for: "${term}"...`)
          
          const { data: retryResults } = await supabase
            .from('hs_codes')
            .select('hs_code, hs_code_10, name_ko, name_en, category_name, start_date, end_date, hs_description, quantity_unit')
            .or(`name_ko.ilike.%${term}%,name_en.ilike.%${term}%,category_name.ilike.%${term}%`)
            .limit(50)
          
          if (retryResults) {
            for (const row of retryResults) {
              const key = row.hs_code
              if (!retryHitMap.has(key)) {
                retryHitMap.set(key, {
                  hs_code: row.hs_code,
                  name_ko: row.name_ko,
                  name_en: row.name_en,
                  category_name: row.category_name,
                  hit_count: 0,
                  matched_fields: []
                })
              }
              retryHitMap.get(key)!.hit_count++
            }
          }
        }
        
        const retryResults = Array.from(retryHitMap.values())
          .sort((a, b) => b.hit_count - a.hit_count)
          .slice(0, 10)
        
        if (retryResults.length > 0) {
          console.log(`✅ Found ${retryResults.length} results with better search terms`)
          
          // 재검색 결과로 다시 최종 판정
          const retryList = retryResults.map((r, idx) => 
            `${idx + 1}. ${r.hs_code} - ${r.name_ko || r.category_name || r.name_en}`
          ).join('\\n')
          
          const retryJudgmentPrompt = `"${query}"에 대해 더 나은 검색어로 찾은 결과:
${retryList}

이 중에서 "${query}"에 가장 적합한 HS 코드를 선택해줘.

JSON 응답:
{
  "bestMatch": {"hs_code": "선택한코드", "reason": "이유"},
  "found": true/false
}`
          
          const retryJudgmentResponse = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
              {
                role: "system",
                content: "HS 코드 선택. JSON만 응답."
              },
              {
                role: "user",
                content: retryJudgmentPrompt
              }
            ],
            max_completion_tokens: 200,
            reasoning_effort: "minimal"
          })
          
          const retryJudgment = JSON.parse(retryJudgmentResponse.choices[0]?.message?.content || '{}')
          
          if (retryJudgment.found && retryJudgment.bestMatch) {
            return new Response(
              JSON.stringify({
                status: 'success',
                hsCode: retryJudgment.bestMatch.hs_code,
                description: retryJudgment.bestMatch.reason,
                score: 0.8,
                method: 'retry-with-better-terms',
                debug: debug ? {
                  originalSearchTerms: searchTerms,
                  betterSearchTerms: judgment.betterSearchTerms,
                  retryResults: retryResults.length
                } : undefined
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
            )
          }
        }
      }
      
      // 그래도 못 찾으면 최종 실패
      return new Response(
        JSON.stringify({
          status: 'no_match',
          message: '적합한 HS 코드를 찾을 수 없습니다.',
          query,
          searchedButNotMatched: filteredResults.slice(0, 5).map(r => ({
            code: r.hs_code,
            name: r.name_ko || r.category_name || r.name_en
          })),
          betterSearchTerms: judgment.betterSearchTerms,
          suggestedAction: '제안된 검색어로 수동 검색하거나 HS 코드를 직접 입력하세요.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }
    
    // 최종 결과 반환
    const topResult = judgment.top3?.[0]
    if (topResult && topResult.score >= 0.7) {
      return new Response(
        JSON.stringify({
          status: 'success',
          hsCode: getHs10(topResult.hs_code),
          description: topResult.reason,
          score: topResult.score,
          alternatives: judgment.top3?.slice(1),
          method: 'keyword-based',
          card: {
            hs_code: getHs10(topResult.hs_code),
            name_ko: filteredResults.find(r => r.hs_code === topResult.hs_code)?.name_ko ?? null,
            name_en: filteredResults.find(r => r.hs_code === topResult.hs_code)?.name_en ?? null,
            quantity_unit: filteredResults.find(r => r.hs_code === topResult.hs_code)?.quantity_unit ?? null,
            reason_line: '섹션/챕터 게이팅 + 가중치 + GIR 컷 기반'
          },
          debug: debug ? {
            searchTerms,
            totalHits: searchResults.length,
            filteredHits: filteredResults.length,
            topHitCounts: searchResults.slice(0, 5).map(r => ({
              code: r.hs_code,
              hits: r.hit_count,
              fields: r.matched_fields
            })),
            gptJudgment: judgment,
            finalPrompt: finalJudgmentPrompt
          } : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }
    
    // 점수가 낮은 경우
    return new Response(
      JSON.stringify({
        status: 'low_confidence',
        message: '정확한 분류를 위해 추가 정보가 필요합니다.',
        candidates: judgment.top3,
        suggestedQuestion: '이 제품의 주요 용도나 재질을 더 자세히 설명해주세요.',
        debug: debug ? {
          searchTerms,
          totalHits: searchResults.length,
          filteredHits: filteredResults.length,
          gptJudgment: judgment
        } : undefined
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