-- HS 코드 4자리 테이블 (Chapter Level)
CREATE TABLE IF NOT EXISTS hs_codes_4digit (
    id SERIAL PRIMARY KEY,
    hs_code VARCHAR(4) NOT NULL UNIQUE,
    description_ko TEXT NOT NULL,
    description_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HS 코드 6자리 테이블 (Heading Level)
CREATE TABLE IF NOT EXISTS hs_codes_6digit (
    id SERIAL PRIMARY KEY,
    hs_code VARCHAR(6) NOT NULL UNIQUE,
    description_ko TEXT NOT NULL,
    description_en TEXT NOT NULL,
    parent_code VARCHAR(4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent_4digit FOREIGN KEY (parent_code) 
        REFERENCES hs_codes_4digit(hs_code) ON DELETE CASCADE
);

-- HS 코드 10자리 테이블 (Full Code Level)
CREATE TABLE IF NOT EXISTS hs_codes_10digit (
    id SERIAL PRIMARY KEY,
    hs_code VARCHAR(10) NOT NULL UNIQUE,
    description_ko TEXT NOT NULL,
    description_en TEXT NOT NULL,
    parent_code VARCHAR(6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent_6digit FOREIGN KEY (parent_code) 
        REFERENCES hs_codes_6digit(hs_code) ON DELETE CASCADE
);

-- 인덱스 추가
CREATE INDEX idx_hs_codes_4digit_code ON hs_codes_4digit(hs_code);
CREATE INDEX idx_hs_codes_6digit_code ON hs_codes_6digit(hs_code);
CREATE INDEX idx_hs_codes_6digit_parent ON hs_codes_6digit(parent_code);
CREATE INDEX idx_hs_codes_10digit_code ON hs_codes_10digit(hs_code);
CREATE INDEX idx_hs_codes_10digit_parent ON hs_codes_10digit(parent_code);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hs_codes_4digit_updated_at 
    BEFORE UPDATE ON hs_codes_4digit 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hs_codes_6digit_updated_at 
    BEFORE UPDATE ON hs_codes_6digit 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hs_codes_10digit_updated_at 
    BEFORE UPDATE ON hs_codes_10digit 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 설정
ALTER TABLE hs_codes_4digit ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs_codes_6digit ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs_codes_10digit ENABLE ROW LEVEL SECURITY;

-- 모든 사용자(인증 여부 관계없이)가 읽기 가능
CREATE POLICY "Anyone can read hs_codes_4digit" 
    ON hs_codes_4digit FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can read hs_codes_6digit" 
    ON hs_codes_6digit FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can read hs_codes_10digit" 
    ON hs_codes_10digit FOR SELECT 
    USING (true);

-- 서비스 역할만 수정 가능 (Insert, Update, Delete)
CREATE POLICY "Service role can insert hs_codes_4digit" 
    ON hs_codes_4digit FOR INSERT 
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can update hs_codes_4digit" 
    ON hs_codes_4digit FOR UPDATE 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can delete hs_codes_4digit" 
    ON hs_codes_4digit FOR DELETE 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert hs_codes_6digit" 
    ON hs_codes_6digit FOR INSERT 
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can update hs_codes_6digit" 
    ON hs_codes_6digit FOR UPDATE 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can delete hs_codes_6digit" 
    ON hs_codes_6digit FOR DELETE 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert hs_codes_10digit" 
    ON hs_codes_10digit FOR INSERT 
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can update hs_codes_10digit" 
    ON hs_codes_10digit FOR UPDATE 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can delete hs_codes_10digit" 
    ON hs_codes_10digit FOR DELETE 
    USING (auth.jwt() ->> 'role' = 'service_role');