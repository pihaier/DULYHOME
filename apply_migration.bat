@echo off
echo 마이그레이션 적용 시작...

REM 환경변수 설정 (비밀번호 입력 필요)
echo 비밀번호를 입력하세요:
set /p POSTGRES_PASSWORD=

REM 마이그레이션 적용
npx supabase db push --include-all --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:%POSTGRES_PASSWORD%@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"

echo 마이그레이션 적용 완료!
pause