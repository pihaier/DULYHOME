import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();
    
    const body = await request.json();
    const { email, password, companyName, contactPerson, phone } = body;

    // 필수 필드 검증
    if (!email || !password || !companyName || !contactPerson || !phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: '모든 필수 항목을 입력해주세요.' 
          } 
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_EMAIL', 
            message: '올바른 이메일 형식이 아닙니다.' 
          } 
        },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'WEAK_PASSWORD', 
            message: '비밀번호는 최소 6자 이상이어야 합니다.' 
          } 
        },
        { status: 400 }
      );
    }

    // 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'customer',
          company_name: companyName,
          contact_person: contactPerson,
          phone: phone
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'EMAIL_EXISTS', 
              message: '이미 등록된 이메일입니다.' 
            } 
          },
          { status: 400 }
        );
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('사용자 생성에 실패했습니다.');
    }

    // 프로필 생성
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: email,
        role: 'customer',
        company_name: companyName,
        contact_person: contactPerson,
        phone: phone,
        language_preference: 'ko',
        approval_status: 'approved', // 임시로 자동 승인
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // 프로필 생성 실패 시 사용자 삭제 (롤백)
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session
      },
      message: '회원가입이 완료되었습니다. 로그인해주세요.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR', 
          message: '회원가입 중 오류가 발생했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    );
  }
}