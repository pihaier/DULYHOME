-- chat_messages 테이블에 읽음 상태 추가
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 읽음 상태 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_reservation_number TEXT,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE chat_messages
  SET 
    is_read = TRUE,
    read_by = CASE 
      WHEN read_by::jsonb @> to_jsonb(p_user_id::text) THEN read_by
      ELSE read_by || to_jsonb(p_user_id::text)
    END,
    read_at = NOW()
  WHERE 
    reservation_number = p_reservation_number
    AND sender_id != p_user_id
    AND (NOT read_by::jsonb @> to_jsonb(p_user_id::text) OR read_by IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 읽지 않은 메시지 수를 가져오는 함수
CREATE OR REPLACE FUNCTION get_unread_count(
  p_reservation_number TEXT,
  p_user_id UUID
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages
    WHERE 
      reservation_number = p_reservation_number
      AND sender_id != p_user_id
      AND (NOT read_by::jsonb @> to_jsonb(p_user_id::text) OR read_by IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_chat_messages_read_status 
ON chat_messages(reservation_number, is_read, sender_id);

COMMENT ON COLUMN chat_messages.is_read IS '메시지 읽음 여부';
COMMENT ON COLUMN chat_messages.read_by IS '메시지를 읽은 사용자 ID 목록';
COMMENT ON COLUMN chat_messages.read_at IS '마지막으로 읽은 시간';