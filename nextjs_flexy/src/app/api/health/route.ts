import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    checks: {},
  };

  try {
    // 1. 기본 서버 상태
    checks.checks.server = {
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // 2. 환경변수 체크 (값은 숨김)
    const requiredEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];
    
    const envCheck = requiredEnvs.every(env => process.env[env]);
    checks.checks.environment = {
      status: envCheck ? 'ok' : 'error',
      required: requiredEnvs.length,
      configured: requiredEnvs.filter(env => process.env[env]).length,
    };

    // 3. Supabase 연결 체크
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .limit(1);
      
      checks.checks.database = {
        status: error ? 'error' : 'ok',
        connected: !error,
        error: error?.message,
      };
    } catch (dbError: any) {
      checks.checks.database = {
        status: 'error',
        connected: false,
        error: dbError.message,
      };
    }

    // 4. API 응답 시간
    checks.responseTime = Date.now() - startTime;

    // 전체 상태 결정
    const hasErrors = Object.values(checks.checks).some(
      (check: any) => check.status === 'error'
    );
    
    if (hasErrors) {
      checks.status = 'degraded';
    }

    return NextResponse.json(checks, { 
      status: hasErrors ? 503 : 200 
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks,
    }, { status: 500 });
  }
}