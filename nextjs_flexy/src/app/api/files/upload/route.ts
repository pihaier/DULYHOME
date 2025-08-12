import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/illustrator', // AI 파일
  'application/postscript', // AI 파일 (다른 MIME 타입)
  'image/vnd.adobe.photoshop', // PSD 파일
  'application/x-photoshop', // PSD 파일 (다른 MIME 타입)
  'application/photoshop', // PSD 파일 (다른 MIME 타입)
  'application/psd', // PSD 파일 (다른 MIME 타입)
  'application/zip', // 압축 파일
  'application/x-zip-compressed' // 압축 파일
];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'application-files';
    const folder = formData.get('folder') as string || 'general';
    const reservationNumber = formData.get('reservationNumber') as string;
    const category = formData.get('category') as string;
    const uploadPurpose = formData.get('uploadPurpose') as string || 'application';

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NO_FILE', 
            message: '파일을 선택해주세요.' 
          } 
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'FILE_TOO_LARGE', 
            message: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.` 
          } 
        },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_FILE_TYPE', 
            message: '지원하지 않는 파일 형식입니다.' 
          } 
        },
        { status: 400 }
      );
    }

    // 파일명 생성
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    
    // reservation_number가 있으면 그걸 기준으로, 없으면 user.id 기준
    const basePath = reservationNumber 
      ? `${reservationNumber}/${category || folder}` 
      : `${folder}/${user.id}`;
    const fileName = `${basePath}/${timestamp}_${randomString}.${fileExt}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // 파일 정보 저장 (uploaded_files 테이블)
    const fileInsertData: any = {
      uploaded_by: user.id,
      original_filename: file.name,
      file_path: data.path,
      file_url: publicUrl,
      file_size: file.size,
      file_type: fileExt,
      mime_type: file.type,
      upload_purpose: uploadPurpose,
      upload_status: 'completed',
      created_at: new Date().toISOString()
    };

    // reservation_number가 있으면 추가
    if (reservationNumber) {
      fileInsertData.reservation_number = reservationNumber;
      fileInsertData.upload_category = category;
    }

    const { data: fileRecord, error: dbError } = await supabase
      .from('uploaded_files')
      .insert(fileInsertData)
      .select()
      .single();

    if (dbError) {
      // DB 저장 실패 시 업로드된 파일 삭제
      await supabase.storage.from(bucket).remove([fileName]);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fileRecord.id,
        url: publicUrl,
        path: data.path,
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'UPLOAD_ERROR', 
          message: '파일 업로드에 실패했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    );
  }
}