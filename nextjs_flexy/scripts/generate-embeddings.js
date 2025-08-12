/**
 * HS코드 임베딩 생성 스크립트
 * 12,467개의 HS코드에 대한 벡터 임베딩을 생성합니다
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// OpenAI 설정 (fetch 사용)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Supabase 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * OpenAI 임베딩 생성 함수
 */
async function generateEmbeddings(texts) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map(item => item.embedding);
  } catch (error) {
    console.error('Fetch error details:', error.message);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 HS코드 임베딩 생성 시작...');
  console.log('📊 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  try {
    // 1. 모든 HS코드 가져오기 (페이지네이션으로)
    console.log('\n📥 HS코드 데이터 로드 중...');
    let allHsCodes = [];
    let from = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data: batch, error } = await supabase
        .from('hs_codes')
        .select('hs_code, name_ko, name_en, category_name, category_code, hs_code_4, hs_code_6')
        .order('hs_code')
        .range(from, from + pageSize - 1);
      
      if (error) {
        console.error('❌ HS코드 조회 실패:', error);
        return;
      }
      
      if (!batch || batch.length === 0) break;
      
      allHsCodes = allHsCodes.concat(batch);
      console.log(`📄 ${allHsCodes.length}개 로드됨...`);
      
      if (batch.length < pageSize) break;
      from += pageSize;
    }
    
    const hsCodes = allHsCodes;

    console.log(`✅ 총 ${hsCodes.length}개 HS코드 발견`);

    // 2. 이미 임베딩이 있는 항목 확인
    const { data: existing } = await supabase
      .from('hs_code_embeddings')
      .select('hs_code')
      .limit(100000);

    const existingSet = new Set((existing || []).map(e => e.hs_code));
    const toProcess = hsCodes.filter(h => !existingSet.has(h.hs_code));

    console.log(`📊 이미 처리됨: ${existingSet.size}개`);
    console.log(`📊 처리 필요: ${toProcess.length}개`);

    if (toProcess.length === 0) {
      console.log('✨ 모든 HS코드가 이미 임베딩되어 있습니다!');
      return;
    }

    // 3. 배치 처리 (50개씩)
    const batchSize = 50;
    let processedCount = 0;
    let errorCount = 0;
    let totalCost = 0;

    for (let i = 0; i < toProcess.length; i += batchSize) {
      const batch = toProcess.slice(i, i + batchSize);
      
      // 텍스트 준비 (카테고리명 + 카테고리코드 + HS코드들 + 품목명 조합)
      // "기타"인 경우 상위 코드 정보도 포함
      const texts = batch.map(item => {
        let text = `${item.category_name || ''} ${item.category_code || ''} ${item.hs_code_4 || ''} ${item.hs_code_6 || ''} ${item.hs_code}`;
        
        // 품목명이 "기타"나 비슷한 경우 HS코드 정보 강화
        if (item.name_ko === '기타' || item.name_ko === '그 밖의 것' || item.name_ko === '그밖의 것') {
          text += ` HS${item.hs_code_4}류 HS${item.hs_code_6}호의 기타 품목`;
        }
        
        text += ` ${item.name_ko || ''} ${item.name_en || ''}`;
        return text.trim();
      });

      try {
        // OpenAI API 호출
        console.log(`\n🔄 배치 ${Math.floor(i/batchSize) + 1} 처리 중...`);
        const embeddings = await generateEmbeddings(texts);

        // 임베딩 데이터 준비
        const embeddingData = batch.map((item, idx) => ({
          hs_code: item.hs_code,
          text_content: texts[idx],
          embedding: JSON.stringify(embeddings[idx]) // pgvector는 JSON 형식으로 받음
        }));

        // Supabase에 저장
        const { error: insertError } = await supabase
          .from('hs_code_embeddings')
          .upsert(embeddingData, { onConflict: 'hs_code' });

        if (insertError) {
          console.error('❌ 임베딩 저장 실패:', insertError);
          errorCount += batch.length;
        } else {
          processedCount += batch.length;
          const progress = ((processedCount / toProcess.length) * 100).toFixed(1);
          console.log(`✅ [${progress}%] ${processedCount}/${toProcess.length} 완료`);
        }

        // 비용 계산 (text-embedding-3-small: $0.00002 per 1K tokens)
        // 대략 10 tokens per item
        totalCost += (batch.length * 10 / 1000) * 0.00002;

        // Rate limit 방지 (분당 3000 요청 제한)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 실패:`, error.message);
        errorCount += batch.length;
        
        // 에러 발생 시 더 긴 대기
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // 4. 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('🎉 임베딩 생성 완료!');
    console.log(`✅ 성공: ${processedCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`💰 예상 비용: $${totalCost.toFixed(4)} (약 ${Math.round(totalCost * 1300)}원)`);
    console.log('='.repeat(50));

    // 5. 검증
    console.log('\n🔍 검증 중...');
    const { count } = await supabase
      .from('hs_code_embeddings')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 총 임베딩 수: ${count}개`);

  } catch (error) {
    console.error('❌ 치명적 오류:', error);
  }
}

// 실행
console.log('='.repeat(50));
console.log('   HS코드 임베딩 생성 스크립트');
console.log('='.repeat(50));

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

main().catch(console.error);