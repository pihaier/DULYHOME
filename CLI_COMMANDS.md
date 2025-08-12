# Supabase CLI 명령어 모음

## 데이터베이스 연결 정보
- **프로젝트 ID**: fzpyfzpmwyvqumvftfbr
- **연결 방식**: Session Mode Pooler (Port 5432)
- **비밀번호**: `.env` 파일의 `POSTGRES_PASSWORD` 참조

## 환경변수 설정 (먼저 실행)
```bash
# Windows
set POSTGRES_PASSWORD=<your-password>

# Mac/Linux
export POSTGRES_PASSWORD=<your-password>
```

## 자주 사용하는 명령어

### 1. 마이그레이션 목록 확인
```bash
npx supabase migration list --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"
```

### 2. 마이그레이션 적용 (Push)
```bash
# 일반적인 경우 (20250828 충돌 해결 필요)
npx supabase migration repair --status reverted 20250828 --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"
npx supabase db push --include-all --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"

# 또는 직접 --include-all 사용
npx supabase db push --include-all --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"
```

### 3. 스키마 차이 확인 (Diff)
```bash
npx supabase db diff --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"
```

### 4. 새 마이그레이션 파일로 저장
```bash
npx supabase db diff --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session" > supabase/migrations/$(date +%Y%m%d)_new_migration.sql
```

### 5. 프로덕션 스키마 가져오기 (Pull)
```bash
npx supabase db pull --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"
```

### 6. 마이그레이션 수정 (Repair)
```bash
# 적용됨으로 표시
npx supabase migration repair --status applied [version] --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"

# 되돌림으로 표시
npx supabase migration repair --status reverted [version] --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session"
```

### 7. TypeScript 타입 생성
```bash
npx supabase gen types typescript --db-url "postgresql://postgres.fzpyfzpmwyvqumvftfbr:$POSTGRES_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&pool_mode=session" > nextjs_flexy/src/lib/types/database.ts
```

## 주의사항
- **Pooler 모드**: Session Mode를 사용해야 prepared statement 충돌이 없음
- **포트**: 5432 (Session Mode) / 6543 (Transaction Mode - 오류 발생)
- **비밀번호 변경 시**: 이 파일과 .env 파일 모두 업데이트 필요
- **20250828 충돌**: 마이그레이션 push 시 20250828 버전 충돌이 발생하면 repair 명령 먼저 실행

## 문제 해결
- **prepared statement 오류**: Session Mode (`pool_mode=session`) 사용
- **인증 실패**: 비밀번호 확인, 대시보드에서 재설정
- **마이그레이션 불일치**: `migration repair` 명령 사용
- **"Remote migration versions not found" 오류**: 
  - 원인: 20250828 버전 충돌
  - 해결: `npx supabase migration repair --status reverted 20250828` 실행 후 `--include-all` 플래그로 push
  