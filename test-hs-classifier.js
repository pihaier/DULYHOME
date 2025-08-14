// HS 코드 분류 테스트
const testProducts = [
  "우유",
  "콜라"
];

async function testHSClassifier() {
  console.log("=== HS 코드 분류 테스트 시작 ===\n");
  
  for (const product of testProducts) {
    console.log(`\n테스트 제품: "${product}"`);
    console.log("-".repeat(50));
    
    try {
      const response = await fetch('https://fzpyfzpmwyvqumvftfbr.supabase.co/functions/v1/hs-code-classifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHlmenBtd3l2cXVtdmZ0ZmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjY5NzksImV4cCI6MjA2OTI0Mjk3OX0.iz3EeD1-W84mHHRhQ4_JpimLjSAIYDTs00UgLeZIGW0'
      },
        body: JSON.stringify({ productName: product })
      });
      
      const data = await response.json();
      
      if (data.hsCode) {
        console.log(`✅ 분류 성공`);
        console.log(`   HS 코드: ${data.hsCode}`);
        console.log(`   품목명: ${data.description}`);
        console.log(`   레벨: ${data.level}`);
        if (data.hierarchy) {
          console.log(`   계층 구조:`);
          console.log(`     - 류: ${data.hierarchy.chapter}`);
          console.log(`     - 호: ${data.hierarchy.heading}`);
          console.log(`     - 소호: ${data.hierarchy.subheading}`);
          console.log(`     - 세번: ${data.hierarchy.item}`);
        }
        if (data.candidates && data.candidates.length > 1) {
          console.log(`   후보들:`);
          data.candidates.forEach((c, i) => {
            console.log(`     ${i+1}. ${c.hsCode}: ${c.description}`);
          });
        }
      } else if (data.error) {
        console.log(`❌ 오류: ${data.error}`);
        if (data.details) {
          console.log(`   상세: ${data.details}`);
        }
      } else {
        console.log(`❌ 분류 실패: 결과 없음`);
      }
      
      console.log(`\n토큰 사용량:`);
      console.log(`   입력: ${data.usage?.prompt_tokens || 0} 토큰`);
      console.log(`   출력: ${data.usage?.completion_tokens || 0} 토큰`);
      console.log(`   총합: ${data.usage?.total_tokens || 0} 토큰`);
      
      // 비용 계산 (GPT-5-mini 기준: $0.25/1M input, $2/1M output)
      const inputCost = (data.usage?.prompt_tokens || 0) / 1000000 * 0.25;
      const outputCost = (data.usage?.completion_tokens || 0) / 1000000 * 2.00;
      const totalCost = inputCost + outputCost;
      
      console.log(`\n예상 비용 (GPT-5-mini):`);
      console.log(`   입력: $${inputCost.toFixed(6)} (약 ${(inputCost * 1300).toFixed(2)}원)`);
      console.log(`   출력: $${outputCost.toFixed(6)} (약 ${(outputCost * 1300).toFixed(2)}원)`);
      console.log(`   총합: $${totalCost.toFixed(6)} (약 ${(totalCost * 1300).toFixed(2)}원)`);
      
    } catch (error) {
      console.log(`❌ 오류 발생: ${error.message}`);
    }
    
    // 1초 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n\n=== 테스트 완료 ===");
}

// 테스트 실행
testHSClassifier().catch(console.error);