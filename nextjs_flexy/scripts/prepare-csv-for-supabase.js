const fs = require('fs');
const csv = require('csv-parse');
const { stringify } = require('csv-stringify');

// 입력 파일
const inputFile = 'C:\\Users\\bishi\\Desktop\\💻_개발_프로그램\\개발자료\\마케팅\\컨설팅\\관세청_HS부호_20250101.csv';
// 출력 파일 (정리된 CSV)
const outputFile = 'C:\\Users\\bishi\\Desktop\\💻_개발_프로그램\\개발자료\\erp-custom\\nextjs_flexy\\scripts\\hs_codes_clean.csv';

console.log('🔄 CSV 파일 정리 시작...');

const cleanedData = [];
let rowCount = 0;

// CSV 읽기
fs.createReadStream(inputFile, { encoding: 'utf8' })
  .pipe(csv.parse({
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true
  }))
  .on('data', (row) => {
    rowCount++;
    
    const hsCode = row['HS부호'] || row['﻿HS부호'];
    
    // HS코드가 있는 행만 처리
    if (hsCode && hsCode.trim()) {
      cleanedData.push({
        hs_code: hsCode.trim(),
        start_date: row['적용시작일자'] || '',
        end_date: row['적용종료일자'] || '',
        name_ko: row['한글품목명'] || '',
        name_en: row['영문품목명'] || '',
        quantity_unit: row['수량단위코드'] || '',
        weight_unit: row['중량단위코드'] || '',
        export_code: row['수출성질코드'] || '',
        import_code: row['수입성질코드'] || '',
        spec_name: row['품목규격명'] || '',
        category_code: row['성질통합분류코드'] || '',
        category_name: row['성질통합분류코드명'] || ''
      });
    }
    
    if (rowCount % 1000 === 0) {
      console.log(`📖 ${rowCount}행 처리 중...`);
    }
  })
  .on('end', () => {
    console.log(`✅ 총 ${rowCount}행 읽기 완료`);
    console.log(`✅ 유효한 데이터: ${cleanedData.length}개`);
    
    // CSV 쓰기
    const stringifier = stringify({
      header: true,
      columns: [
        'hs_code',
        'start_date',
        'end_date',
        'name_ko',
        'name_en',
        'quantity_unit',
        'weight_unit',
        'export_code',
        'import_code',
        'spec_name',
        'category_code',
        'category_name'
      ]
    });
    
    const writeStream = fs.createWriteStream(outputFile);
    stringifier.pipe(writeStream);
    
    cleanedData.forEach(row => {
      stringifier.write(row);
    });
    
    stringifier.end();
    
    writeStream.on('finish', () => {
      console.log(`\n🎉 정리된 CSV 파일 생성 완료!`);
      console.log(`📁 파일 위치: ${outputFile}`);
      console.log(`📊 총 ${cleanedData.length}개 데이터`);
      
      // 파일 크기 확인
      const stats = fs.statSync(outputFile);
      const fileSizeInMB = stats.size / (1024 * 1024);
      console.log(`📦 파일 크기: ${fileSizeInMB.toFixed(2)} MB`);
      
      console.log('\n📌 다음 단계:');
      console.log('1. Supabase Dashboard (https://supabase.com/dashboard) 접속');
      console.log('2. Table Editor → hs_codes 테이블 선택');
      console.log('3. "Import data from CSV" 버튼 클릭');
      console.log('4. hs_codes_clean.csv 파일 업로드');
      console.log('5. Import 실행!');
    });
  })
  .on('error', (err) => {
    console.error('❌ 오류 발생:', err);
  });