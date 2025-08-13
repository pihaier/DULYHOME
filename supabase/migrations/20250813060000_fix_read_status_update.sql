-- chat_messages 테이블에 대한 UPDATE 권한 추가
-- 사용자가 자신이 받은 메시지를 읽음으로 표시할 수 있도록

-- 기존 UPDATE 정책이 있다면 삭제
DROP POLICY IF EXISTS "System can update messages for translation" ON chat_messages;

-- 새로운 UPDATE 정책 생성
CREATE POLICY "Users can update read status" 
ON chat_messages
FOR UPDATE
USING (
  -- 인증된 사용자만
  auth.role() = 'authenticated'
)
WITH CHECK (
  -- 자신이 보낸 메시지가 아닌 경우만 업데이트 가능
  sender_id != auth.uid()
);

-- is_read 컬럼 기본값 설정 (없으면)
ALTER TABLE chat_messages 
ALTER COLUMN is_read SET DEFAULT false;

-- 기존 메시지들의 is_read 값을 false로 설정 (NULL인 경우)
UPDATE chat_messages 
SET is_read = false 
WHERE is_read IS NULL;

-- 확인
SELECT 'Read status update policy created' AS status;