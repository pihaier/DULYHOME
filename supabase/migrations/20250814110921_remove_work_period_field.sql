-- market_research_requests 테이블에서 work_period 필드 제거
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS work_period;

-- 제거 완료 알림
DO $$
BEGIN
  RAISE NOTICE 'work_period 필드 제거 완료';
  RAISE NOTICE 'work_duration 필드만 사용하도록 통일';
END $$;