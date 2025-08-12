// 관세청 API - XML 파싱
const apiKey = 'q200i211z071y240v020g080o0';
const today = '20250809';

async function testExchangeAPI() {
  const url = `https://apis.data.go.kr/1220000/Itemdsapi/getItemdsapi`;
  const params = new URLSearchParams({
    serviceKey: apiKey,
    searchDate: today,
    resultType: 'xml'  // XML로 받기
  });

  try {
    console.log('API 호출 중...');
    
    const response = await fetch(`${url}?${params}`);
    const text = await response.text();
    
    // XML에서 필요한 값 추출 (간단한 정규식 사용)
    const currencies = ['USD', 'CNY', 'EUR', 'JPY'];
    
    console.log('\n=== 환율 정보 ===');
    currencies.forEach(currency => {
      const regex = new RegExp(`<cur_cd>${currency}</cur_cd>.*?<ttb>(.*?)</ttb>`, 's');
      const match = text.match(regex);
      if (match) {
        console.log(`${currency}: ${match[1]}원`);
      }
    });
    
    // 전체 응답 일부 보기
    console.log('\n전체 응답 (처음 2000자):', text.substring(0, 2000));
  } catch (error) {
    console.error('Error:', error);
  }
}

testExchangeAPI();
