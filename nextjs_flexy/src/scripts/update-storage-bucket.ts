import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBucketMimeTypes() {
  try {
    // application-files 버킷 업데이트
    const { data, error } = await supabase.storage.updateBucket('application-files', {
      public: false,
      allowedMimeTypes: [
        // 이미지 파일
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',

        // 디자인 파일
        'application/postscript', // .ai, .eps
        'application/illustrator', // .ai (alternative)
        'image/vnd.adobe.photoshop', // .psd
        'image/x-photoshop', // .psd (alternative)
        'application/x-photoshop', // .psd (alternative)
        'application/psd', // .psd (alternative)

        // 문서 파일
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-powerpoint', // .ppt

        // 텍스트 파일
        'text/plain',
        'text/csv',

        // 압축 파일
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',

        // 비디오 파일 (선택사항)
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',

        // 기타 디자인 관련 파일
        'application/x-sketch', // .sketch
        'application/figma', // .fig
        'image/svg+xml', // .svg
      ],
      fileSizeLimit: '52428800', // 50MB in bytes
    });

    if (error) {
      return;
    }

    // 다른 버킷들도 필요하면 업데이트
    const bucketsToUpdate = ['chat-files', 'report-files']; // 실제 버킷 이름으로 변경

    for (const bucketName of bucketsToUpdate) {
      const { data: bucketData, error: bucketError } = await supabase.storage.updateBucket(
        bucketName,
        {
          public: false,
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
          ],
          fileSizeLimit: '52428800', // 50MB
        }
      );

      if (bucketError) {
      } else {
      }
    }
  } catch (error) {}
}

// 스크립트 실행
updateBucketMimeTypes();
