const fs = require('fs');
const csv = require('csv-parse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 프로덕션 Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key 필요!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수 설정 필요:');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 정리된 CSV 파일 경로
const csvFilePath = './scripts/hs_codes_clean.csv';

async function importToProduction() {
  console.log('🚀 프로덕션 Import 시작...');
  console.log('📁 CSV 파일:', csvFilePath);
  console.log('🌐 Supabase URL:', supabaseUrl);
  
  // 기존 데이터 확인
  const { count: existingCount } = await supabase
    .from('hs_codes')
    .select('*', { count: 'exact', head: true });
  
  if (existingCount > 0) {
    console.log(`⚠️  기존 데이터 ${existingCount}개 발견`);
    const answer = await new Promise((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question('기존 데이터를 덮어쓰시겠습니까? (y/n): ', (answer) => {
        readline.close();
        resolve(answer);
      });
    });
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Import 취소됨');
      return;
    }
    
    // 기존 데이터 삭제
    console.log('🗑️ 기존 데이터 삭제 중...');
    await supabase.from('hs_codes').delete().gte('id', 0);
  }
  
  const records = [];
  let rowCount = 0;
  
  // CSV 읽기
  const parser = fs
    .createReadStream(csvFilePath, { encoding: 'utf8' })
    .pipe(csv.parse({
      columns: true,
      skip_empty_lines: true
    }));
  
  parser.on('data', (data) => {
    rowCount++;
    records.push(data);
    
    if (rowCount % 1000 === 0) {
      console.log(`📖 ${rowCount}행 읽는 중...`);
    }
  });
  
  parser.on('end', async () => {
    console.log(`\n📊 총 ${records.length}개 데이터 준비 완료`);
    
    // 배치 처리 (500개씩)
    const batchSize = 500;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('hs_codes')
          .upsert(batch, { 
            onConflict: 'hs_code',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 실패:`, error.message);
          errorCount += batch.length;
          errors.push(error.message);
        } else {
          successCount += batch.length;
          const progress = Math.round((i + batch.length) / records.length * 100);
          console.log(`✅ [${progress}%] ${i + batch.length}/${records.length} 완료`);
        }
      } catch (err) {
        console.error(`❌ 예외 발생:`, err.message);
        errorCount += batch.length;
        errors.push(err.message);
      }
      
      // API 제한 방지를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 프로덕션 Import 완료!');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    if (errors.length > 0) {
      console.log('\n❌ 오류 목록:');
      errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      if (errors.length > 5) {
        console.log(`  ... 외 ${errors.length - 5}개`);
      }
    }
    
    console.log('='.repeat(50));
    
    // 최종 확인
    await verifyImport();
  });
  
  parser.on('error', (err) => {
    console.error('❌ CSV 파싱 오류:', err);
  });
}

async function verifyImport() {
  console.log('\n📊 프로덕션 데이터 검증 중...');
  
  // 총 개수 확인
  const { count } = await supabase
    .from('hs_codes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ 총 ${count}개 HS코드가 프로덕션에 저장됨`);
  
  // 검색 테스트
  console.log('\n🔍 검색 테스트:');
  
  const testKeywords = ['두유', '청바지', '신발'];
  for (const keyword of testKeywords) {
    const { data, error } = await supabase
      .from('hs_codes')
      .select('hs_code, name_ko')
      .ilike('name_ko', `%${keyword}%`)
      .limit(3);
    
    if (data && data.length > 0) {
      console.log(`  ✅ "${keyword}" 검색: ${data.length}개 결과`);
      data.forEach(item => {
        console.log(`     - ${item.hs_code}: ${item.name_ko}`);
      });
    } else {
      console.log(`  ❌ "${keyword}" 검색: 결과 없음`);
    }
  }
  
  console.log('\n✨ 모든 작업 완료!');
}

// 실행
importToProduction().catch(console.error);