// Supabase Storage 업로드 테스트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  try {
    // 1. 버킷 목록 확인
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
    if (bucketsError) {
      console.error('Buckets error:', bucketsError);
      return;
    }

    // 2. 테스트 파일 생성
    const testContent = 'This is a test file';
    const testFileName = `test-${Date.now()}.txt`;
    
    // 3. uploads 버킷에 업로드 시도
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`test/${testFileName}`, testContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
    } else {
      console.log('Upload success:', data);
      
      // 4. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(`test/${testFileName}`);
      
      console.log('Public URL:', publicUrl);
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

// 실행
testUpload();