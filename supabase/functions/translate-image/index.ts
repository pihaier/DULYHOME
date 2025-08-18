import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 알리바바 이미지 번역 API 설정
const ALIBABA_ACCESS_KEY_ID = Deno.env.get('ALIBABA_ACCESS_KEY_ID') || ''
const ALIBABA_ACCESS_KEY_SECRET = Deno.env.get('ALIBABA_ACCESS_KEY_SECRET') || ''

// 기계 번역 API 엔드포인트 - 화동1(항저우) 리전
const ALIBABA_API_ENDPOINT = 'https://mt.cn-hangzhou.aliyuncs.com'

// SHA256 해시 생성
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// HMAC-SHA256 서명 생성 (버퍼 기반)
async function hmacSha256(key: Uint8Array | string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  
  // 키 데이터 준비
  const keyData = typeof key === 'string' ? encoder.encode(key) : key
  const messageData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ACS3-HMAC-SHA256 서명 생성 (Alibaba Cloud 공식 방식)
async function generateACS3Authorization(
  headers: Record<string, string>,
  body: string
): Promise<string> {
  // 1. Signed Headers 결정 (x-acs-*, host, content-type만 포함)
  const signedHeaders = Object.keys(headers)
    .filter(key => {
      const lowerKey = key.toLowerCase()
      return lowerKey.startsWith('x-acs-') || lowerKey === 'host' || lowerKey === 'content-type'
    })
    .map(key => key.toLowerCase())
    .sort()
    .join(';')
  
  // 2. Canonical Headers 생성
  const canonicalHeaders = signedHeaders.split(';')
    .map(key => {
      const originalKey = Object.keys(headers).find(k => k.toLowerCase() === key)
      return `${key}:${headers[originalKey!].trim()}`
    })
    .join('\n')
  
  // 3. Canonical Request 생성
  const hashedBody = await sha256(body)
  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    '',
    signedHeaders,
    hashedBody
  ].join('\n')
  
  // 4. String to Sign 생성
  const algorithm = 'ACS3-HMAC-SHA256'
  const hashedCanonicalRequest = await sha256(canonicalRequest)
  const stringToSign = `${algorithm}\n${hashedCanonicalRequest}`
  
  // 5. HMAC-SHA256 서명 생성
  // Alibaba Cloud의 ACS3-HMAC-SHA256은 AccessKeySecret을 직접 사용 (ACS3 prefix 없음!)
  const secretKey = ALIBABA_ACCESS_KEY_SECRET.trim()
  
  // HMAC-SHA256 서명 생성 (AccessKeySecret으로 StringToSign 서명)
  const signatureHex = await hmacSha256(secretKey, stringToSign)
  
  return `${algorithm} Credential=${ALIBABA_ACCESS_KEY_ID},SignedHeaders=${signedHeaders},Signature=${signatureHex}`
}

// 알리바바 이미지 번역 API 호출 (리뷰.md 방식)
async function translateImageWithAlibaba(
  imageUrl: string,
  sourceLanguage: string = 'zh',
  targetLanguage: string = 'ko'
) {
  try {
    // 타임스탬프 생성 (ISO 8601 형식)
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    
    // Nonce 생성 (32자리 16진수)
    const array = new Uint8Array(16)
    globalThis.crypto.getRandomValues(array)
    const nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // Request body (URLSearchParams 형식)
    const bodyParams = new URLSearchParams({
      'ImageUrl': imageUrl,
      'SourceLanguage': sourceLanguage,
      'TargetLanguage': targetLanguage,
      'Field': 'e-commerce'  // 전자상거래 이미지 번역 모드
    })
    const body = bodyParams.toString()
    
    // URL에서 호스트 추출
    const url = new URL(ALIBABA_API_ENDPOINT)
    const host = url.host
    
    // Request headers (서명에 필요한 헤더만)
    const headers: Record<string, string> = {
      'host': host,
      'x-acs-version': '2018-10-12',
      'x-acs-action': 'TranslateImage',
      'x-acs-date': timestamp,
      'x-acs-signature-nonce': nonce,
      'content-type': 'application/x-www-form-urlencoded',
      'x-acs-content-sha256': await sha256(body)
    }
    
    // Authorization 헤더 생성
    const authorization = await generateACS3Authorization(headers, body)
    headers['Authorization'] = authorization
    
    // accept 헤더는 서명 후에 추가
    headers['accept'] = 'application/json'
    
    
    // API 호출
    const response = await fetch(ALIBABA_API_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: body
    })
    
    const responseText = await response.text()
    
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Failed to parse response: ${responseText.substring(0, 200)}`)
    }
    
    // 성공 응답 처리 (리뷰.md 응답 형식과 동일)
    if (result.Code === '200' || result.Code === 200) {
      if (result.Data && result.Data.FinalImageUrl) {
        return {
          success: true,
          data: {
            translatedImageUrl: result.Data.FinalImageUrl,
            requestId: result.RequestId
          }
        }
      }
    }
    
    // 오류 처리
    return {
      success: false,
      error: result.Message || 'Translation failed',
      code: result.Code
    }
  } catch (error) {
    console.error('Alibaba TranslateImage API error:', error)
    throw error
  }
}

Deno.serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, sourceLanguage = 'zh', targetLanguage = 'ko' } = await req.json()

    // 입력 검증
    if (!imageUrl) {
      throw new Error('imageUrl이 필요합니다.')
    }

    // API 키 확인
    if (!ALIBABA_ACCESS_KEY_ID || !ALIBABA_ACCESS_KEY_SECRET) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Alibaba Cloud API keys not configured',
          message: '이미지 번역 서비스가 준비 중입니다. API 키를 설정해주세요.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Alibaba API 호출
    const result = await translateImageWithAlibaba(
      imageUrl,
      sourceLanguage,
      targetLanguage
    )

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})