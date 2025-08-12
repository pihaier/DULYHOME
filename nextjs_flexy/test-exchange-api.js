// 관세청 API 직접 테스트
const apiKey = 'q200i211z071y240v020g080o0';
const today = '20250809'; // 오늘 날짜

async function testExchangeAPI() {
  const url = `https://apis.data.go.kr/1220000/Itemdsapi/getItemdsapi`;
  const params = new URLSearchParams({
    serviceKey: apiKey,
    searchDate: today,
    resultType: 'json'
  });

  try {
    console.log('API 호출 URL:', `${url}?${params}`);
    
    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    console.log('\n전체 응답:', JSON.stringify(data, null, 2));
    
    if (data?.items?.item) {
      const items = Array.isArray(data.items.item) ? data.items.item : [data.items.item];
      console.log('\n=== 환율 정보 ===');
      items.forEach(item => {
        if (['USD', 'CNY', 'EUR', 'JPY'].includes(item.cur_cd)) {
          console.log(`${item.cur_cd}:`, {
            ttb: item.ttb,  // 송금 보낼 때
            tts: item.tts,  // 송금 받을 때
            deal_bas_r: item.deal_bas_r  // 매매 기준율
          });
        }
      });
    } else {
      console.log('환율 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testExchangeAPI();
