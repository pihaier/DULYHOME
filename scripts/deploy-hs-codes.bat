@echo off
echo ========================================
echo   HS코드 데이터베이스 프로덕션 배포
echo ========================================
echo.

REM 1. 마이그레이션 실행
echo [1/3] 테이블 생성 중...
cd ..
npx supabase migration up --linked

REM 2. 프로덕션용 import 스크립트 실행
echo [2/3] CSV 데이터 import 중...
cd nextjs_flexy
node scripts/import-hs-codes-production.js

REM 3. 확인
echo [3/3] 데이터 확인 중...
npx supabase db query "SELECT COUNT(*) as total FROM hs_codes" --linked

echo.
echo ========================================
echo   ✅ 배포 완료!
echo ========================================
pause