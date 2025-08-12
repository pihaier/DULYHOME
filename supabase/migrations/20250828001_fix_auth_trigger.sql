-- ============================================
-- 사용자 인증 버그 수정
-- 작성일: 2025-01-28
--
-- 문제점:
-- 1. handle_new_user() 함수가 email 가입을 처리하지 않음
-- 2. 조건문이 잘못됨: IF provider != 'email' (email이 아닌 경우만 처리)
-- ============================================

-- Step 1: 기존 트리거 제거 (있는 경우)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: handle_new_user() 함수 수정
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
      'customer',          -- 기본 역할: customer
      'approved',          -- 일반 고객은 자동 승인
      '미입력',            -- 회사명: 나중에 입력
      '미입력',            -- 담당자명: 나중에 입력  
      '미입력',            -- 전화번호: 나중에 입력
      COALESCE((NEW.raw_user_meta_data->>'terms_accepted_at')::timestamptz, NOW()),
      COALESCE((NEW.raw_user_meta_data->>'privacy_accepted_at')::timestamptz, NOW()),
      (NEW.raw_user_meta_data->>'marketing_accepted_at')::timestamptz,
      'ko',                -- 기본 언어: 한국어
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
  -- OAuth 로그인 처리 (Google, Kakao 등)
  ELSE
    INSERT INTO public.user_profiles (
      user_id,
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

-- Step 3: 트리거 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: 기존 사용자 동기화
-- auth.users에 있지만 user_profiles에 없는 사용자들의 프로필 생성
INSERT INTO public.user_profiles (
  user_id,
  role,
  approval_status,
  company_name,
  contact_person,
  phone,
  language_preference,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'customer',
  'approved',
  '미입력',
  '미입력',
  '미입력',
  'ko',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;