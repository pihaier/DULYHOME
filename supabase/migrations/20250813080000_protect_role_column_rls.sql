-- role 컬럼 보호를 위한 RLS 정책
-- role과 approval_status는 권한에 따라 수정 제한

-- 기존 UPDATE 정책들 삭제
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile except role" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update any profile including role" ON user_profiles;
DROP POLICY IF EXISTS "Korean team can update profiles except role" ON user_profiles;

-- 1. 일반 사용자(customer, chinese_staff)는 자신의 프로필만 수정 (role, approval_status 제외)
CREATE POLICY "Users can update own profile except protected fields" 
ON user_profiles
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
  -- role과 approval_status는 변경 불가
  AND role = (SELECT role FROM user_profiles WHERE user_id = auth.uid())
  AND approval_status = (SELECT approval_status FROM user_profiles WHERE user_id = auth.uid())
);

-- 2. Admin은 모든 사용자의 모든 필드 수정 가능
CREATE POLICY "Admin can update any profile" 
ON user_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- 3. Korean team은 approval_status만 변경 가능 (role은 불가)
CREATE POLICY "Korean team can approve users" 
ON user_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'korean_team'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'korean_team'
  )
  -- role은 변경 불가
  AND role = (SELECT role FROM user_profiles WHERE user_id = user_profiles.user_id)
);

-- INSERT 정책은 그대로 유지 (회원가입 가능)
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- SELECT 정책 확인 (기존 정책 유지)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (
  -- 자신의 프로필 조회
  auth.uid() = user_id
  -- 또는 korean_team/admin은 모든 프로필 조회
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('korean_team', 'admin')
  )
);

-- DELETE 정책 (admin만 가능)
DROP POLICY IF EXISTS "Only admin can delete profiles" ON user_profiles;
CREATE POLICY "Only admin can delete profiles"
ON user_profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- 확인
SELECT 'Role protection RLS policies created successfully' AS status;