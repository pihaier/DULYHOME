// 실제 데이터로 auto-translate-fields Edge Function 테스트

const SUPABASE_URL = 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHlmenBtd3l2cXVtdmZ0ZmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjY5NzksImV4cCI6MjA2OTI0Mjk3OX0.iz3EeD1-W84mHHRhQ4_JpimLjSAIYDTs00UgLeZIGW0';

async function testRealTranslation() {
  console.log('=== 실제 데이터 번역 테스트 ===\n');

  // 실제 market_research_requests 레코드
  const realRecord = {
    id: 'a78bb953-c30d-45dd-b5b0-54dac6d122b0',
    reservation_number: 'MR-20250806-852333',
    product_name: '커피머신',  // 테스트용으로 변경
    requirements: '고품질 제품이 필요합니다. 인증서와 테스트 리포트를 제공해주세요.',  // 테스트용으로 변경
    // 중국어 필드는 null로 설정 (번역 대상)
    product_name_chinese: null,
    requirements_chinese: null
  };

  const requestBody = {
    table: 'market_research_requests',
    record: realRecord,
    event: 'UPDATE'
  };

  console.log('📝 번역 요청 데이터:');
  console.log('- 테이블:', requestBody.table);
  console.log('- 레코드 ID:', realRecord.id);
  console.log('- 제품명:', realRecord.product_name);
  console.log('- 요구사항:', realRecord.requirements);
  console.log('');

  try {
    console.log('🚀 Edge Function 호출 중...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auto-translate-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('📥 응답 상태:', response.status);
    console.log('📥 응답 내용:', responseText);

    if (!response.ok) {
      console.error('❌ 번역 실패!');
      console.error('오류:', responseText);
      return;
    }

    try {
      const result = JSON.parse(responseText);
      console.log('\n✅ 번역 성공!');
      console.log('번역된 필드 수:', result.translatedFields || 0);
      
      if (result.updates) {
        console.log('\n📋 번역 결과:');
        for (const [field, value] of Object.entries(result.updates)) {
          console.log(`  ${field}: ${value}`);
        }
      }
      
      if (result.usage) {
        console.log('\n💰 토큰 사용량:');
        console.log('  총 토큰:', result.usage.total_tokens);
        console.log('  추론 토큰:', result.usage.reasoning_tokens);
      }
    } catch (parseError) {
      console.log('⚠️ JSON 파싱 실패, 원본 응답:', responseText);
    }

  } catch (error) {
    console.error('❌ 요청 오류:', error);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 테스트 실행
testRealTranslation();