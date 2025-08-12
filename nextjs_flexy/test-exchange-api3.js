// 관세청 환율 API - 정확한 엔드포인트
const apiKey = 'q200i211z071y240v020g080o0';
const today = '20250209';  // YYYYMMDD 형식

async function testExchangeAPI() {
  // API012 - 환율정보
  const url = `https://apis.data.go.kr/1220000/searchApi012/getexcApi012`;
  const params = new URLSearchParams({
    serviceKey: apiKey,
    imexTp: '2',  // 수입
    searchDate: today,
    pageNo: '1',
    numOfRows: '100'
  });

  try {
    console.log('API 호출:', `${url}?${params}`);
    
    const response = await fetch(`${url}?${params}`);
    const text = await response.text();
    
    console.log('응답:', text.substring(0, 3000));
    
    // XML 파싱
    const currencies = ['USD', 'CNY', 'EUR', 'JPY'];
    console.log('\n=== 환율 추출 ===');
    
    currencies.forEach(curr => {
      const regex = new RegExp(`<currCd>${curr}</currCd>.*?<chgRate>(.*?)</chgRate>`, 's');
      const match = text.match(regex);
      if (match) {
        console.log(`${curr}: ${match[1]}원`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testExchangeAPI();
