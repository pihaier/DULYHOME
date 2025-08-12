-- ============================================
-- 중복 RLS 정책 제거
-- 작성일: 2025-01-28
-- 
-- 문제점:
-- user_profiles 테이블에 중복 정책 8개 존재
-- 실제로는 4개만 필요 (SELECT, INSERT, UPDATE + korean_team)
-- ============================================

-- Step 1: user_profiles 테이블의 중복 정책 제거
-- 다음 정책들은 중복이므로 제거:
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.user_profiles;  
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

-- 기존 정책들도 이름을 명확하게 변경
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

-- Step 2: 깔끔한 정책 재생성 (중복 없이)
-- 기존 정책들도 명시적으로 삭제
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

-- 2-1. 사용자가 자신의 프로필 조회
CREATE POLICY "users_select_own_profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2-2. 사용자가 자신의 프로필 생성
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() = user_id);

-- 2-3. 사용자가 자신의 프로필 수정
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- korean_team 정책은 이미 존재하고 중복이 아니므로 유지
-- korean_team_all_profiles (SELECT)
-- korean_team_approve_profiles (UPDATE)