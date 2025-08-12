// 관세청 환율 API 직접 테스트
async function testExchangeAPI() {
  const apiUrl = 'https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo';
  const today = '20250809';
  
  const params = new URLSearchParams({
    crkyCn: 'o260t225i086q161g060c050i0',  // API 키
    qryYymmDd: today,                      // 조회날짜 YYYYMMDD
    imexTp: '2'                            // 2=수입
  });

  console.log('API 호출:', `${apiUrl}?${params}`);
  
  try {
    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
        'Content-Type': 'application/xml'
      }
    });
    
    console.log('응답 상태:', response.status);
    const xmlText = await response.text();
    
    // USD 찾기
    const usdMatch = xmlText.match(/<currSgn>USD<\/currSgn>[\s\S]*?<fxrt>([\d.]+)<\/fxrt>/);
    if (usdMatch) {
      console.log('USD 환율:', usdMatch[1], '원');
    }
    
    // CNY 찾기
    const cnyMatch = xmlText.match(/<currSgn>CNY<\/currSgn>[\s\S]*?<fxrt>([\d.]+)<\/fxrt>/);
    if (cnyMatch) {
      console.log('CNY 환율:', cnyMatch[1], '원');
    }
    
    // 전체 응답 일부
    console.log('\n응답 (처음 1000자):', xmlText.substring(0, 1000));
    
  } catch (error) {
    console.error('에러:', error.message);
  }
}

testExchangeAPI();
