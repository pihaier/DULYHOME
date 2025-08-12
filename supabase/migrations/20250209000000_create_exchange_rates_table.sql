-- 환율 테이블 생성
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  usd_rate DECIMAL(10, 2) NOT NULL,
  cny_rate DECIMAL(10, 2) NOT NULL,
  eur_rate DECIMAL(10, 2),
  jpy_rate DECIMAL(10, 2),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date DESC);

-- RLS 정책
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can read exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role can insert exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role can update exchange rates" ON exchange_rates;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read exchange rates" ON exchange_rates
  FOR SELECT USING (true);

-- 서비스 역할만 삽입/수정 가능
CREATE POLICY "Service role can insert exchange rates" ON exchange_rates
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update exchange rates" ON exchange_rates
  FOR UPDATE WITH CHECK (auth.role() = 'service_role');

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exchange_rates_updated_at 
  BEFORE UPDATE ON exchange_rates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 오늘 환율 가져오는 함수 (기존 함수 삭제 후 재생성)
DROP FUNCTION IF EXISTS get_today_exchange_rate();
CREATE FUNCTION get_today_exchange_rate()
RETURNS TABLE (
  date DATE,
  usd_rate DECIMAL,
  cny_rate DECIMAL,
  eur_rate DECIMAL,
  jpy_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    er.date,
    er.usd_rate,
    er.cny_rate,
    er.eur_rate,
    er.jpy_rate
  FROM exchange_rates er
  WHERE er.date = CURRENT_DATE
  ORDER BY er.created_at DESC
  LIMIT 1;
  
  -- 오늘 환율이 없으면 가장 최근 환율 반환
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      er.date,
      er.usd_rate,
      er.cny_rate,
      er.eur_rate,
      er.jpy_rate
    FROM exchange_rates er
    ORDER BY er.date DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;