-- ============================================
-- user_profiles 테이블에 email 컬럼 추가
-- 작성일: 2025-08-12
--
-- 목적:
-- 1. auth.users와 별도로 email 정보 저장
-- 2. 프로필 조회 시 JOIN 없이 email 접근 가능
-- ============================================

-- Step 1: email 컬럼 추가
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email character varying(255);

-- Step 2: email 컬럼에 UNIQUE 제약 추가 (중복 방지)
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Step 3: 기존 사용자들의 이메일 동기화
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id
  AND up.email IS NULL;

-- Step 4: handle_new_user() 함수 수정 (email 필드 추가)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- 이메일 가입 처리 (provider가 'email'이거나 NULL인 경우)
  IF NEW.raw_app_meta_data->>'provider' = 'email' 
     OR NEW.raw_app_meta_data->>'provider' IS NULL THEN
    
    INSERT INTO public.user_profiles (
      user_id,
      email,  -- 이메일 추가
      role,
      approval_status,
      company_name,
      contact_person,
      phone,
      terms_accepted_at,
      privacy_accepted_at,
      marketing_accepted_at,
      language_preference,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,  -- auth.users의 이메일 저장
      'customer',
      'approved',
      '미입력',
      '미입력',  
      '미입력',
      COALESCE((NEW.raw_user_meta_data->>'terms_accepted_at')::timestamptz, NOW()),
      COALESCE((NEW.raw_user_meta_data->>'privacy_accepted_at')::timestamptz, NOW()),
      (NEW.raw_user_meta_data->>'marketing_accepted_at')::timestamptz,
      'ko',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
  -- OAuth 로그인 처리 (Google, Kakao 등)
  ELSE
    INSERT INTO public.user_profiles (
      user_id,
      email,  -- 이메일 추가
      role,
      company_name,
      contact_person,
      phone,
      provider,
      provider_id,
      avatar_url,
      full_name,
      approval_status,
      terms_accepted_at,
      privacy_accepted_at,
      language_preference,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,  -- auth.users의 이메일 저장
      'customer',
      '미입력',
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      '미입력',
      NEW.raw_app_meta_data->>'provider',
      NEW.raw_app_meta_data->>'provider_id',
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'full_name',
      'approved',
      NOW(),
      NOW(),
      'ko',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 5: 이메일 변경 시 동기화 트리거 (선택사항)
-- auth.users의 이메일이 변경되면 user_profiles도 업데이트
CREATE OR REPLACE FUNCTION public.sync_email_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 이메일이 변경된 경우
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.user_profiles
    SET email = NEW.email,
        updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 이메일 동기화 트리거 생성
DROP TRIGGER IF EXISTS sync_email_on_update ON auth.users;
CREATE TRIGGER sync_email_on_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_on_update();

-- Step 6: 검증
DO $$
DECLARE
  missing_emails INTEGER;
  duplicate_emails INTEGER;
BEGIN
  -- 이메일 누락 확인
  SELECT COUNT(*) INTO missing_emails
  FROM public.user_profiles
  WHERE email IS NULL;
  
  -- 중복 이메일 확인
  SELECT COUNT(*) - COUNT(DISTINCT email) INTO duplicate_emails
  FROM public.user_profiles
  WHERE email IS NOT NULL;
  
  RAISE NOTICE '=================================';
  RAISE NOTICE '이메일 컬럼 추가 완료';
  RAISE NOTICE '누락된 이메일: %', missing_emails;
  RAISE NOTICE '중복된 이메일: %', duplicate_emails;
  RAISE NOTICE '=================================';
  
  IF missing_emails > 0 THEN
    RAISE WARNING '⚠️ % 개의 프로필에 이메일이 없습니다!', missing_emails;
  END IF;
  
  IF duplicate_emails > 0 THEN
    RAISE WARNING '⚠️ % 개의 중복 이메일이 있습니다!', duplicate_emails;
  END IF;
END $$;