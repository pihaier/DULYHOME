// Test auto-translate-fields Edge Function

const SUPABASE_URL = 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHlmenBtd3l2cXVtdmZ0ZmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjY5NzksImV4cCI6MjA2OTI0Mjk3OX0.iz3EeD1-W84mHHRhQ4_JpimLjSAIYDTs00UgLeZIGW0';

async function testAutoTranslate() {
  console.log('=== Auto Translate Fields 테스트 시작 ===\n');

  // 테스트 1: 한국어 → 중국어 번역 (고객 입력)
  const testCase1 = {
    table: 'market_research_requests',
    record: {
      id: 'test-id-1',
      product_name: '커피머신',
      product_description: '고품질 에스프레소 머신',
      sample_requirements: '샘플 2개 필요, 포장 상태 확인',
      requirements: '제품 인증서 및 테스트 리포트 필요',
      logo_details: '회사 로고 각인 가능 여부',
      box_details: '맞춤형 포장 박스 제작 가능'
    },
    event: 'INSERT'
  };

  console.log('테스트 1: 한국어 → 중국어 번역');
  console.log('입력 데이터:', {
    product_name: testCase1.record.product_name,
    requirements: testCase1.record.requirements
  });

  try {
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/auto-translate-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testCase1)
    });

    if (!response1.ok) {
      const error = await response1.text();
      console.error('❌ 테스트 1 실패:', error);
    } else {
      const result1 = await response1.json();
      console.log('✅ 테스트 1 성공!');
      console.log('번역 결과:', result1.updates);
      console.log('토큰 사용량:', result1.usage);
    }
  } catch (error) {
    console.error('❌ 테스트 1 오류:', error);
  }

  console.log('\n-----------------------------------\n');

  // 테스트 2: 중국어 → 한국어 번역 (중국 직원 입력)
  const testCase2 = {
    table: 'market_research_requests',
    record: {
      id: 'test-id-2',
      industry_cn: '制造业',
      factory_name_cn: '上海咖啡机制造有限公司',
      factory_address_cn: '上海市浦东新区工业园区',
      main_products_cn: '咖啡机、研磨机、配件',
      factory_certification_cn: 'ISO9001, CE认证',
      quality_certification_cn: 'ISO9001质量管理体系',
      legal_type_cn: '有限责任公司',
      company_size_cn: '500-1000人',
      oem_odm_availability_cn: '支持OEM/ODM',
      payment_terms_cn: 'T/T 30%预付，70%尾款'
    },
    event: 'UPDATE'
  };

  console.log('테스트 2: 중국어 → 한국어 번역');
  console.log('입력 데이터:', {
    factory_name_cn: testCase2.record.factory_name_cn,
    industry_cn: testCase2.record.industry_cn
  });

  try {
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/auto-translate-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testCase2)
    });

    if (!response2.ok) {
      const error = await response2.text();
      console.error('❌ 테스트 2 실패:', error);
    } else {
      const result2 = await response2.json();
      console.log('✅ 테스트 2 성공!');
      console.log('번역 결과:', result2.updates);
      console.log('토큰 사용량:', result2.usage);
    }
  } catch (error) {
    console.error('❌ 테스트 2 오류:', error);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 테스트 실행
testAutoTranslate();