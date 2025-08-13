-- Realtime을 위한 RLS 정책 수정
-- 모든 인증된 사용자가 chat_messages를 볼 수 있도록 임시로 개방

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable realtime for authenticated users" ON chat_messages;

-- 새로운 정책 생성 - 더 개방적으로
CREATE POLICY "Enable realtime for all authenticated users" 
ON chat_messages
FOR SELECT
TO authenticated
USING (true);

-- anon 역할도 볼 수 있도록 (테스트용)
CREATE POLICY "Enable realtime for anon users" 
ON chat_messages
FOR SELECT
TO anon
USING (true);

-- Realtime 권한 확인
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON chat_messages TO authenticated, anon;

-- 확인
SELECT 'RLS policies updated for Realtime' AS status;