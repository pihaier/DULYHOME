import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export async function POST(request: NextRequest) {
  try {
    // 서버 클라이언트로 인증 확인
    const supabase = await createClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('인증 오류:', authError);
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const reservationNumber = formData.get('reservationNumber') as string;
    const files = formData.getAll('files') as File[];
    const types = formData.getAll('types') as string[];

    if (!reservationNumber) {
      return NextResponse.json(
        { success: false, error: '예약번호가 필요합니다.' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: '파일을 선택해주세요.' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const errors = [];

    // 각 파일 업로드
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = types[i] || 'general';

      try {
        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            filename: file.name,
            error: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`
          });
          continue;
        }

        // 파일 타입 검증
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          errors.push({
            filename: file.name,
            error: '지원하지 않는 파일 형식입니다.'
          });
          continue;
        }

        // 파일명 생성
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileName = `${reservationNumber}/${type}_${timestamp}_${randomString}.${fileExt}`;

        // Supabase Storage에 업로드
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const { data, error } = await supabase.storage
          .from('inspection-files')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          errors.push({
            filename: file.name,
            error: error.message
          });
          continue;
        }

        // 파일 정보 저장
        const { data: fileRecord, error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            reservation_number: reservationNumber,
            uploaded_by: user.id,
            original_filename: file.name,
            file_path: data.path,
            file_size: file.size,
            file_type: fileExt,
            mime_type: file.type,
            upload_purpose: 'application',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (dbError) {
          // DB 저장 실패 시 업로드된 파일 삭제
          await supabase.storage.from('inspection-files').remove([fileName]);
          errors.push({
            filename: file.name,
            error: '파일 정보 저장 실패'
          });
          continue;
        }

        uploadedFiles.push({
          id: fileRecord.id,
          filename: file.name,
          path: data.path,
          type: type
        });

      } catch (error) {
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploadedFiles,
      errors,
      message: `${uploadedFiles.length}개 파일 업로드 성공${errors.length > 0 ? `, ${errors.length}개 실패` : ''}`
    });

  } catch (error) {
    console.error('Batch file upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '파일 업로드에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}