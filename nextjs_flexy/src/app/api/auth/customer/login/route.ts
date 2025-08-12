import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { email, password } = await request.json()

    // Supabase 로그인
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: '로그인에 실패했습니다.' },
        { status: 401 }
      )
    }

    // 프로필 확인
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    // 프로필이 없으면 프로필 설정 필요
    if (!profile) {
      return NextResponse.json({
        user: data.user,
        profile: null,
        needsProfile: true,
      })
    }

    // 고객이 아닌 경우 거부
    if (profile.role !== 'customer') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: '고객 전용 로그인입니다. 직원은 /auth/staff/login을 이용해주세요.' },
        { status: 403 }
      )
    }

    // 승인 상태 확인
    if (profile.approval_status === 'pending') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: '계정 승인 대기 중입니다.' },
        { status: 403 }
      )
    }

    if (profile.approval_status === 'rejected') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: '계정이 거부되었습니다. 관리자에게 문의하세요.' },
        { status: 403 }
      )
    }

    // 로그인 성공
    return NextResponse.json({
      user: data.user,
      profile,
      needsProfile: false,
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}