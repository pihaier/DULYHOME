import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { reservationNumber, files } = body;

    if (!reservationNumber || !files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 파일 정보를 데이터베이스에 저장만 함
    const fileRecords = files.map((file: any) => ({
      reservation_number: reservationNumber,
      uploaded_by: user.id,
      original_filename: file.name,
      file_size: file.size,
      file_type: file.type,
      upload_status: 'pending', // 업로드 대기 상태
      upload_purpose: 'application',
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('uploaded_files').insert(fileRecords).select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '파일 정보가 저장되었습니다.',
      files: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '파일 처리에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
