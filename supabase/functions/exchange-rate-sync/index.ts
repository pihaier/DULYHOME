import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 매일 오전 9시에 실행되는 환율 동기화 함수
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 한국 시간으로 오늘 날짜 가져오기
    const kstDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
    const year = kstDate.getFullYear()
    const month = String(kstDate.getMonth() + 1).padStart(2, '0')
    const day = String(kstDate.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`
    const queryDate = `${year}${month}${day}` // YYYYMMDD 형식
    
    console.log('조회 날짜:', queryDate, '(KST)')
    
    // 이미 오늘 환율이 있는지 확인
    const { data: existing } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('date', today)
      .single()
    
    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: '오늘 환율이 이미 존재합니다',
          data: existing 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 관세청 환율 API 호출 (실제 작동하는 API)
    const apiUrl = 'https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo'
    const params = new URLSearchParams({
      crkyCn: 'o260t225i086q161g060c050i0',  // 실제 작동하는 API 키
      qryYymmDd: queryDate,
      imexTp: '2'  // 수입
    })

    console.log('API 호출:', `${apiUrl}?${params}`)
    
    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
        'Content-Type': 'application/xml'
      }
    })
    
    if (!response.ok) {
      throw new Error(`관세청 API 호출 실패: ${response.status}`)
    }

    const xmlText = await response.text()
    console.log('API 응답 받음, 길이:', xmlText.length)
    
    // XML에서 환율 데이터 추출
    let usdRate = null
    let cnyRate = null
    let eurRate = null
    let jpyRate = null
    
    // USD 환율 추출
    const usdMatch = xmlText.match(/<trifFxrtInfoQryRsltVo>[\s\S]*?<currSgn>USD<\/currSgn>[\s\S]*?<fxrt>([\d.]+)<\/fxrt>[\s\S]*?<\/trifFxrtInfoQryRsltVo>/)
    if (usdMatch && usdMatch[1]) {
      usdRate = parseFloat(usdMatch[1])
      console.log('USD 환율:', usdRate)
    }
    
    // CNY 환율 추출
    const cnyMatch = xmlText.match(/<trifFxrtInfoQryRsltVo>[\s\S]*?<currSgn>CNY<\/currSgn>[\s\S]*?<fxrt>([\d.]+)<\/fxrt>[\s\S]*?<\/trifFxrtInfoQryRsltVo>/)
    if (cnyMatch && cnyMatch[1]) {
      cnyRate = parseFloat(cnyMatch[1])
      console.log('CNY 환율:', cnyRate)
    }
    
    // EUR 환율 추출
    const eurMatch = xmlText.match(/<trifFxrtInfoQryRsltVo>[\s\S]*?<currSgn>EUR<\/currSgn>[\s\S]*?<fxrt>([\d.]+)<\/fxrt>[\s\S]*?<\/trifFxrtInfoQryRsltVo>/)
    if (eurMatch && eurMatch[1]) {
      eurRate = parseFloat(eurMatch[1])
      console.log('EUR 환율:', eurRate)
    }
    
    // JPY 환율 추출 (100엔 기준)
    const jpyMatch = xmlText.match(/<trifFxrtInfoQryRsltVo>[\s\S]*?<currSgn>JPY<\/currSgn>[\s\S]*?<fxrt>([\d.]+)<\/fxrt>[\s\S]*?<\/trifFxrtInfoQryRsltVo>/)
    if (jpyMatch && jpyMatch[1]) {
      jpyRate = parseFloat(jpyMatch[1])
      console.log('JPY 환율:', jpyRate, '(100엔당)')
    }
    
    // 환율을 못 가져온 경우 에러
    if (!usdRate || !cnyRate) {
      throw new Error(`환율 데이터 추출 실패. USD: ${usdRate}, CNY: ${cnyRate}`)
    }

    // DB에 저장
    const { data: savedRate, error: saveError } = await supabase
      .from('exchange_rates')
      .insert({
        date: today,
        usd_rate: usdRate,
        cny_rate: cnyRate,
        eur_rate: eurRate,
        jpy_rate: jpyRate,
        raw_data: { 
          source: 'customs_api',
          query_date: queryDate,
          rates: {
            USD: usdRate,
            CNY: cnyRate,
            EUR: eurRate,
            JPY: jpyRate
          }
        }
      })
      .select()
      .single()

    if (saveError) {
      throw saveError
    }

    console.log('환율 저장 완료:', savedRate)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: '환율 업데이트 완료',
        date: today,
        data: {
          usd_rate: usdRate,
          cny_rate: cnyRate,
          eur_rate: eurRate,
          jpy_rate: jpyRate
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})