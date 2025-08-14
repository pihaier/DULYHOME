-- market_research_requests 테이블에 중국어 번역 필드 추가
ALTER TABLE market_research_requests
ADD COLUMN IF NOT EXISTS requirements_chinese text,
ADD COLUMN IF NOT EXISTS logo_details_chinese text,
ADD COLUMN IF NOT EXISTS box_details_chinese text;

-- 컬럼 코멘트 추가
COMMENT ON COLUMN market_research_requests.requirements_chinese IS '요구사항 중국어 번역';
COMMENT ON COLUMN market_research_requests.logo_details_chinese IS '로고 상세 중국어 번역';
COMMENT ON COLUMN market_research_requests.box_details_chinese IS '박스 상세 중국어 번역';