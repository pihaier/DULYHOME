-- HS코드 테이블에 규격 정보 컬럼 추가
ALTER TABLE hs_codes 
ADD COLUMN IF NOT EXISTS required_spec_name TEXT,  -- 필수규격명
ADD COLUMN IF NOT EXISTS reference_spec_name TEXT, -- 참고규격명  
ADD COLUMN IF NOT EXISTS spec_description TEXT,    -- 규격설명
ADD COLUMN IF NOT EXISTS spec_details TEXT;        -- 규격사항내용

-- 인덱스 추가 (규격 정보가 있는 항목 빠른 검색)
CREATE INDEX IF NOT EXISTS idx_hs_codes_has_spec 
ON hs_codes(hs_code) 
WHERE spec_name IS NOT NULL OR required_spec_name IS NOT NULL;