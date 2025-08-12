-- HS코드 테이블 생성
CREATE TABLE IF NOT EXISTS hs_codes (
  id BIGSERIAL PRIMARY KEY,
  hs_code VARCHAR(20) UNIQUE NOT NULL,
  hs_code_10 VARCHAR(10) GENERATED ALWAYS AS (LEFT(hs_code, 10)) STORED,
  hs_code_6 VARCHAR(6) GENERATED ALWAYS AS (LEFT(hs_code, 6)) STORED,
  hs_code_4 VARCHAR(4) GENERATED ALWAYS AS (LEFT(hs_code, 4)) STORED,
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  name_ko TEXT,
  name_en TEXT,
  quantity_unit VARCHAR(10),
  weight_unit VARCHAR(10),
  export_code VARCHAR(20),
  import_code VARCHAR(20),
  spec_name TEXT,
  category_code VARCHAR(20),
  category_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검색 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_hs_code ON hs_codes(hs_code);
CREATE INDEX IF NOT EXISTS idx_hs_10 ON hs_codes(hs_code_10);
CREATE INDEX IF NOT EXISTS idx_hs_6 ON hs_codes(hs_code_6);
CREATE INDEX IF NOT EXISTS idx_hs_4 ON hs_codes(hs_code_4);
CREATE INDEX IF NOT EXISTS idx_name_ko_gin ON hs_codes USING gin(to_tsvector('simple', COALESCE(name_ko, '')));
CREATE INDEX IF NOT EXISTS idx_name_en_gin ON hs_codes USING gin(to_tsvector('simple', COALESCE(name_en, '')));

-- RLS 정책 (모든 사용자가 읽기 가능)
ALTER TABLE hs_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON hs_codes;
CREATE POLICY "Allow public read access" ON hs_codes
  FOR SELECT
  TO public
  USING (true);

-- 검색 함수 생성
CREATE OR REPLACE FUNCTION search_hs_codes(search_term TEXT)
RETURNS TABLE (
  hs_code VARCHAR,
  name_ko TEXT,
  name_en TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.hs_code,
    h.name_ko,
    h.name_en,
    CASE
      WHEN h.hs_code = search_term THEN 100
      WHEN h.hs_code LIKE search_term || '%' THEN 90
      WHEN h.name_ko = search_term THEN 85
      WHEN h.name_ko ILIKE '%' || search_term || '%' THEN 70
      WHEN h.name_en ILIKE '%' || search_term || '%' THEN 60
      ELSE 50
    END::REAL as relevance
  FROM hs_codes h
  WHERE 
    h.hs_code LIKE search_term || '%' OR
    h.name_ko ILIKE '%' || search_term || '%' OR
    h.name_en ILIKE '%' || search_term || '%'
  ORDER BY relevance DESC, h.hs_code
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;