-- HS코드 데이터 시드
-- CSV 파일에서 데이터를 COPY 명령으로 import
-- 이 파일은 supabase db push --seed 명령으로 실행됩니다

-- 먼저 테이블 비우기 (중복 방지)
TRUNCATE TABLE hs_codes CASCADE;

-- CSV 데이터를 직접 INSERT로 처리하는 대신
-- psql의 COPY 명령을 사용하려면 별도 스크립트 필요
-- 여기서는 샘플 데이터만 추가

INSERT INTO hs_codes (hs_code, start_date, end_date, name_ko, name_en, quantity_unit, weight_unit) VALUES
('8438201000', '20120101', '20251231', '두유제조기', 'Soybean milk maker', 'U', 'KG'),
('6203421000', '20120101', '20251231', '청바지', 'Jeans', 'U', 'KG'),
('6404110000', '20120101', '20251231', '운동화', 'Sports shoes', 'U', 'KG')
ON CONFLICT (hs_code) DO NOTHING;