// 관세청 환율 API 테스트
const fetch = require('node-fetch');

async function testCustomsAPI() {
  // 여러 API 엔드포인트 테스트
  const apis = [
    {
      name: 'searchApi012',
      url: 'https://apis.data.go.kr/1220000/searchApi012/getexcApi012',
      params: {
        serviceKey: 'q200i211z071y240v020g080o0',
        imexTp: '2',
        searchDate: '20250209',
        pageNo: '1',
        numOfRows: '100'
      }
    },
    {
      name: 'Ntsapi',
      url: 'https://apis.data.go.kr/1220000/Ntsapi/getWhskGnrlApi',  
      params: {
        serviceKey: 'q200i211z071y240v020g080o0',
        strtYymm: '202502',
        endYymm: '202502'
      }
    }
  ];

  for (const api of apis) {
    console.log(`\n=== ${api.name} 테스트 ===`);
    const params = new URLSearchParams(api.params);
    const fullUrl = `${api.url}?${params}`;
    
    try {
      const response = await fetch(fullUrl);
      const text = await response.text();
      
      console.log('응답 상태:', response.status);
      console.log('응답 (처음 500자):', text.substring(0, 500));
      
      // USD 환율 찾기
      const usdPattern = /<currCd>USD<\/currCd>.*?<chgRate>([\d.]+)<\/chgRate>/s;
      const usdMatch = text.match(usdPattern);
      if (usdMatch) {
        console.log('USD 환율 발견:', usdMatch[1]);
      }
      
      // CNY 환율 찾기  
      const cnyPattern = /<currCd>CNY<\/currCd>.*?<chgRate>([\d.]+)<\/chgRate>/s;
      const cnyMatch = text.match(cnyPattern);
      if (cnyMatch) {
        console.log('CNY 환율 발견:', cnyMatch[1]);
      }
      
    } catch (error) {
      console.error('에러:', error.message);
    }
  }
}

testCustomsAPI();
