-- sync_email_on_update 함수와 트리거 삭제
-- 이메일 동기화 불필요 (auth.users.email과 user_profiles.email을 독립적으로 관리)

-- 트리거 먼저 삭제
DROP TRIGGER IF EXISTS sync_email_on_update ON auth.users;

-- 함수 삭제
DROP FUNCTION IF EXISTS public.sync_email_on_update();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '=================================';
  RAISE NOTICE 'sync_email_on_update 삭제 완료';
  RAISE NOTICE 'auth.users.email = 로그인 ID (변경 불가)';
  RAISE NOTICE 'user_profiles.email = 연락용 이메일 (변경 가능)';
  RAISE NOTICE '=================================';
END $$;