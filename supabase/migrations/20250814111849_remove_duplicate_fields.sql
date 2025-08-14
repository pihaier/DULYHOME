-- market_research_requests 테이블에서 중복 필드 제거
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS estimated_unit_price,
DROP COLUMN IF EXISTS estimated_total_supply;

-- 제거 완료 알림
DO $$
BEGIN
  RAISE NOTICE '중복 필드 제거 완료';
  RAISE NOTICE 'estimated_unit_price -> expected_unit_price 사용';
  RAISE NOTICE 'estimated_total_supply -> expected_total_supply_price 사용';
END $$;