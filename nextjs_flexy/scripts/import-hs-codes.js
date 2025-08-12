const fs = require('fs');
const csv = require('csv-parse');
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHlmenBtd3l2cXVtdmZ0ZmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY2Njk3OSwiZXhwIjoyMDY5MjQyOTc5fQ.2Ku3zzqg7NRJz4tMa0jiL3xEbfzEG8H0IxAODLc8yvs';

const supabase = createClient(supabaseUrl, supabaseKey);

// CSV 파일 경로
const csvFilePath = 'C:\\Users\\bishi\\Desktop\\💻_개발_프로그램\\개발자료\\마케팅\\컨설팅\\관세청_HS부호_20250101.csv';

async function createTable() {
  console.log('📊 테이블 생성 중...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- 기존 테이블 삭제 (있는 경우)
      DROP TABLE IF EXISTS hs_codes CASCADE;
      
      -- HS코드 테이블 생성
      CREATE TABLE hs_codes (
        id BIGSERIAL PRIMARY KEY,
        hs_code VARCHAR(20) UNIQUE NOT NULL,
        hs_code_10 VARCHAR(10) GENERATED ALWAYS AS (LEFT(hs_code, 10)) STORED,
        hs_code_6 VARCHAR(6) GENERATED ALWAYS AS (LEFT(hs_code, 6)) STORED,
        hs_code_4 VARCHAR(4) GENERATED ALWAYS AS (LEFT(hs_code, 4)) STORED,
        start_date VARCHAR(20),
        end_date VARCHAR(20),
        name_ko TEXT,
        name_en TEXT,
        quantity_unit VARCHAR(10),
        weight_unit VARCHAR(10),
        export_code VARCHAR(20),
        import_code VARCHAR(20),
        spec_name TEXT,
        category_code VARCHAR(20),
        category_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- 검색 최적화 인덱스
      CREATE INDEX idx_hs_code ON hs_codes(hs_code);
      CREATE INDEX idx_hs_10 ON hs_codes(hs_code_10);
      CREATE INDEX idx_hs_6 ON hs_codes(hs_code_6);
      CREATE INDEX idx_hs_4 ON hs_codes(hs_code_4);
      CREATE INDEX idx_name_ko_gin ON hs_codes USING gin(to_tsvector('simple', COALESCE(name_ko, '')));
      CREATE INDEX idx_name_en_gin ON hs_codes USING gin(to_tsvector('simple', COALESCE(name_en, '')));
    `
  });
  
  if (error) {
    console.error('테이블 생성 실패:', error);
    return false;
  }
  
  console.log('✅ 테이블 생성 완료');
  return true;
}

async function importCSV() {
  console.log('🚀 CSV Import 시작...');
  console.log('📁 파일:', csvFilePath);
  
  // 테이블 생성
  const tableCreated = await createTable();
  if (!tableCreated) {
    console.error('테이블 생성 실패로 import 중단');
    return;
  }
  
  const records = [];
  let rowCount = 0;
  let skipCount = 0;
  
  // CSV 파일 읽기
  const parser = fs
    .createReadStream(csvFilePath, { encoding: 'utf8' })
    .pipe(csv.parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true // BOM 처리
    }));
  
  parser.on('data', (data) => {
    rowCount++;
    
    // HS부호가 있는 행만 처리
    const hsCode = data['HS부호'] || data['﻿HS부호']; // BOM 처리
    
    if (hsCode && hsCode.length > 0) {
      records.push({
        hs_code: hsCode.trim(),
        start_date: data['적용시작일자'] || null,
        end_date: data['적용종료일자'] || null,
        name_ko: data['한글품목명'] || null,
        name_en: data['영문품목명'] || null,
        quantity_unit: data['수량단위코드'] || null,
        weight_unit: data['중량단위코드'] || null,
        export_code: data['수출성질코드'] || null,
        import_code: data['수입성질코드'] || null,
        spec_name: data['품목규격명'] || null,
        category_code: data['성질통합분류코드'] || null,
        category_name: data['성질통합분류코드명'] || null
      });
    } else {
      skipCount++;
    }
    
    // 진행 상황 표시
    if (rowCount % 1000 === 0) {
      console.log(`📖 ${rowCount}행 읽는 중...`);
    }
  });
  
  parser.on('end', async () => {
    console.log(`\n📊 총 ${rowCount}행 읽기 완료`);
    console.log(`✅ 유효한 데이터: ${records.length}개`);
    console.log(`⚠️ 스킵된 데이터: ${skipCount}개`);
    
    if (records.length === 0) {
      console.log('❌ import할 데이터가 없습니다');
      return;
    }
    
    // 배치 처리 (500개씩)
    const batchSize = 500;
    let successCount = 0;
    let errorCount = 0;
    
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
        } else {
          successCount += batch.length;
          const progress = Math.round((i + batch.length) / records.length * 100);
          console.log(`✅ [${progress}%] ${i + batch.length}/${records.length} 완료`);
        }
      } catch (err) {
        console.error(`❌ 예외 발생:`, err.message);
        errorCount += batch.length;
      }
      
      // API 제한 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Import 완료!');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log('='.repeat(50));
    
    // 통계 확인
    await checkStats();
  });
  
  parser.on('error', (err) => {
    console.error('❌ CSV 파싱 오류:', err);
  });
}

async function checkStats() {
  console.log('\n📊 데이터베이스 통계 확인 중...');
  
  const { data, error } = await supabase
    .from('hs_codes')
    .select('*', { count: 'exact', head: true });
  
  if (!error) {
    console.log(`✅ 총 ${data} 개의 HS코드가 데이터베이스에 저장되었습니다`);
  }
  
  // 샘플 데이터 확인
  const { data: samples } = await supabase
    .from('hs_codes')
    .select('hs_code, name_ko, name_en')
    .limit(5);
  
  if (samples) {
    console.log('\n📋 샘플 데이터:');
    samples.forEach(item => {
      console.log(`  - ${item.hs_code}: ${item.name_ko} (${item.name_en})`);
    });
  }
}

// 실행
importCSV().catch(console.error);