// 관세청 환율 API - USD와 CNY만 찾기
async function testExchangeAPI() {
  const apiUrl = 'https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo';
  const today = '20250809';
  
  const params = new URLSearchParams({
    crkyCn: 'o260t225i086q161g060c050i0',
    qryYymmDd: today,
    imexTp: '2'
  });

  try {
    const response = await fetch(`${apiUrl}?${params}`);
    const xmlText = await response.text();
    
    // USD 부분만 찾기
    const usdSection = xmlText.match(/<trifFxrtInfoQryRsltVo>[\s\S]*?<currSgn>USD<\/currSgn>[\s\S]*?<\/trifFxrtInfoQryRsltVo>/);
    if (usdSection) {
      console.log('=== USD 섹션 ===');
      console.log(usdSection[0]);
      
      // fxrt 값 추출
      const fxrtMatch = usdSection[0].match(/<fxrt>([\d.]+)<\/fxrt>/);
      if (fxrtMatch) {
        console.log('\nUSD 환율:', fxrtMatch[1], '원');
      }
    }
    
    // CNY 부분만 찾기
    const cnySection = xmlText.match(/<trifFxrtInfoQryRsltVo>[\s\S]*?<currSgn>CNY<\/currSgn>[\s\S]*?<\/trifFxrtInfoQryRsltVo>/);
    if (cnySection) {
      console.log('\n=== CNY 섹션 ===');
      console.log(cnySection[0]);
      
      // fxrt 값 추출
      const fxrtMatch = cnySection[0].match(/<fxrt>([\d.]+)<\/fxrt>/);
      if (fxrtMatch) {
        console.log('\nCNY 환율:', fxrtMatch[1], '원');
      }
    }
    
  } catch (error) {
    console.error('에러:', error.message);
  }
}

testExchangeAPI();
