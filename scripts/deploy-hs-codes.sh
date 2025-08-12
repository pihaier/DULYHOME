#!/bin/bash

echo "🚀 HS코드 데이터베이스 프로덕션 배포 시작..."

# 1. 마이그레이션 실행 (테이블 생성)
echo "📊 테이블 생성 중..."
npx supabase db push

# 2. CSV 데이터 import (psql 사용)
echo "📤 CSV 데이터 import 중..."
npx supabase db import \
  --file ./nextjs_flexy/scripts/hs_codes_clean.csv \
  --table hs_codes \
  --csv-header

# 또는 Node.js 스크립트로 import
# node ./nextjs_flexy/scripts/import-hs-codes-production.js

echo "✅ 배포 완료!"