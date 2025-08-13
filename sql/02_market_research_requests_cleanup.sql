-- =====================================================
-- market_research_requests 테이블 정리 SQL
-- 작성일: 2025-01-13
-- 목적: 페이지 필드명과 일치시키고 누락된 필드 추가
-- =====================================================

-- =====================================================
-- 1. 불필요한 필드 삭제
-- =====================================================
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS logo_print_details,      -- logo_details로 통합
DROP COLUMN IF EXISTS payment_status,          -- 사용 안함
DROP COLUMN IF EXISTS first_payment_details,   -- 1차 상세비용 삭제
DROP COLUMN IF EXISTS photos,                  -- uploaded_files 테이블 사용
DROP COLUMN IF EXISTS logo_file,               -- uploaded_files 테이블 사용
DROP COLUMN IF EXISTS box_design_file,         -- uploaded_files 테이블 사용
DROP COLUMN IF EXISTS sample_total_price;      -- sample_price 필드 필요없음

-- =====================================================
-- 2. 필드명 변경 (페이지에서 사용하는 이름으로 통일)
-- =====================================================

-- 박스 관련 필드명 변경
ALTER TABLE market_research_requests 
RENAME COLUMN box_length_cm TO box_length;

ALTER TABLE market_research_requests 
RENAME COLUMN box_width_cm TO box_width;

ALTER TABLE market_research_requests 
RENAME COLUMN box_height_cm TO box_height;

ALTER TABLE market_research_requests 
RENAME COLUMN total_box_count TO total_boxes;

ALTER TABLE market_research_requests 
RENAME COLUMN cbm_volume TO total_cbm;

-- 샘플 관련 필드명 변경
ALTER TABLE market_research_requests 
RENAME COLUMN sample_availability TO sample_available;

ALTER TABLE market_research_requests 
RENAME COLUMN sample_order_quantity TO sample_order_qty;

ALTER TABLE market_research_requests 
RENAME COLUMN sample_weight_kg TO sample_weight;

ALTER TABLE market_research_requests 
RENAME COLUMN sample_delivery_time TO sample_make_time;

-- 기타 필드명 변경
ALTER TABLE market_research_requests 
RENAME COLUMN product_url TO product_link;

ALTER TABLE market_research_requests 
RENAME COLUMN china_shipping_cost TO china_shipping_fee;

ALTER TABLE market_research_requests 
RENAME COLUMN production_duration TO work_period;

-- 인증 관련 필드명 변경
ALTER TABLE market_research_requests 
RENAME COLUMN required_certifications TO certification_required;

ALTER TABLE market_research_requests 
RENAME COLUMN certification_cost TO cert_cost;

-- =====================================================
-- 3. 새로운 필드 추가
-- =====================================================

-- 공장정보 탭 필드 추가
ALTER TABLE market_research_requests
ADD COLUMN IF NOT EXISTS industry_kr VARCHAR(200),           -- 업종
ADD COLUMN IF NOT EXISTS industry_cn VARCHAR(200),           -- 업종(중국어)
ADD COLUMN IF NOT EXISTS legal_type_kr VARCHAR(50),          -- 법인/개인
ADD COLUMN IF NOT EXISTS company_size_kr VARCHAR(100),       -- 인원규모
ADD COLUMN IF NOT EXISTS established_date DATE,              -- 개업시간
ADD COLUMN IF NOT EXISTS registered_capital VARCHAR(100),    -- 등록자본
ADD COLUMN IF NOT EXISTS real_paid_capital VARCHAR(100),     -- 실수등록자금
ADD COLUMN IF NOT EXISTS company_status VARCHAR(100),        -- 기업상태
ADD COLUMN IF NOT EXISTS company_status_cn VARCHAR(100),     -- 기업상태(중국어)
ADD COLUMN IF NOT EXISTS is_small_business BOOLEAN,          -- 소규모기업 여부
ADD COLUMN IF NOT EXISTS business_scope_kr TEXT,             -- 영업범위
ADD COLUMN IF NOT EXISTS business_scope_cn TEXT,             -- 영업범위(중국어)
ADD COLUMN IF NOT EXISTS factory_contact_person VARCHAR(100), -- 공장담당자
ADD COLUMN IF NOT EXISTS factory_contact_phone VARCHAR(50);   -- 공장연락처

-- 제품정보 탭 필드 추가
ALTER TABLE market_research_requests
ADD COLUMN IF NOT EXISTS product_code VARCHAR(50),           -- 제품번호
ADD COLUMN IF NOT EXISTS quoted_quantity INTEGER,            -- 견적수량
ADD COLUMN IF NOT EXISTS other_matters_kr TEXT,              -- 기타사항
ADD COLUMN IF NOT EXISTS other_matters_cn TEXT,              -- 기타사항(중국어)
ADD COLUMN IF NOT EXISTS sample_china_price NUMERIC(10,2),   -- 샘플 중국단가
ADD COLUMN IF NOT EXISTS product_actual_photos JSONB,        -- 제품 실제사진
ADD COLUMN IF NOT EXISTS product_site_url TEXT;              -- 제품 사이트 URL (중국직원용)

-- 가격정보 탭 필드 추가
ALTER TABLE market_research_requests
ADD COLUMN IF NOT EXISTS work_duration VARCHAR(100),         -- 소요시간
ADD COLUMN IF NOT EXISTS export_port VARCHAR(100),           -- 수출항
ADD COLUMN IF NOT EXISTS export_port_cn VARCHAR(100),        -- 수출항(중국어)
ADD COLUMN IF NOT EXISTS factory_price_rmb NUMERIC(10,2),    -- 출고가 RMB
ADD COLUMN IF NOT EXISTS exchange_rate_date DATE,            -- 환율 산정일
ADD COLUMN IF NOT EXISTS lcl_shipping_fee NUMERIC(10,2),     -- LCL 운송비
ADD COLUMN IF NOT EXISTS fcl_shipping_fee NUMERIC(10,2),     -- FCL 운송비
ADD COLUMN IF NOT EXISTS customs_rate NUMERIC(5,2),          -- 관세율
ADD COLUMN IF NOT EXISTS customs_duty NUMERIC(10,2),         -- 관세
ADD COLUMN IF NOT EXISTS import_vat NUMERIC(10,2),           -- 부가세
ADD COLUMN IF NOT EXISTS expected_second_payment NUMERIC(10,2), -- 예상 2차결제비용
ADD COLUMN IF NOT EXISTS expected_total_supply_price NUMERIC(10,2), -- 예상 총 공급가
ADD COLUMN IF NOT EXISTS expected_unit_price NUMERIC(10,2);  -- 예상 단가

-- =====================================================
-- 4. 필드 타입 변경 (필요한 경우)
-- =====================================================

-- certification_required를 boolean으로 변경 (text였다면)
DO $$
BEGIN
    -- 기존 타입이 text인지 확인
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'market_research_requests' 
        AND column_name = 'certification_required'
        AND data_type = 'text'
    ) THEN
        -- 임시 컬럼 생성
        ALTER TABLE market_research_requests 
        ADD COLUMN certification_required_new BOOLEAN;
        
        -- 기존 데이터 변환
        UPDATE market_research_requests 
        SET certification_required_new = 
            CASE 
                WHEN certification_required IS NOT NULL 
                AND certification_required != '' 
                THEN TRUE 
                ELSE FALSE 
            END;
        
        -- 기존 컬럼 삭제
        ALTER TABLE market_research_requests 
        DROP COLUMN certification_required;
        
        -- 새 컬럼 이름 변경
        ALTER TABLE market_research_requests 
        RENAME COLUMN certification_required_new TO certification_required;
    END IF;
END $$;

-- =====================================================
-- 5. 기본값 설정
-- =====================================================

ALTER TABLE market_research_requests
ALTER COLUMN commission_rate SET DEFAULT 5.0,              -- 수수료율 5% 고정
ALTER COLUMN shipping_method SET DEFAULT 'LCL',            -- 기본 운송방식
ALTER COLUMN exchange_rate SET DEFAULT 192.0,              -- 기본 환율 (exchange_rates 테이블 참조)
ALTER COLUMN status SET DEFAULT 'submitted';

-- =====================================================
-- 6. 자동계산 필드를 위한 트리거 함수 생성
-- =====================================================

-- 총 CBM 자동계산 트리거
CREATE OR REPLACE FUNCTION calculate_total_cbm()
RETURNS TRIGGER AS $$
BEGIN
    -- 박스 크기와 박스 수가 모두 있을 때만 계산
    IF NEW.box_length IS NOT NULL 
    AND NEW.box_width IS NOT NULL 
    AND NEW.box_height IS NOT NULL 
    AND NEW.total_boxes IS NOT NULL THEN
        NEW.total_cbm = (NEW.box_length * NEW.box_width * NEW.box_height * NEW.total_boxes) / 1000000.0;
    END IF;
    
    -- 운송방식 자동 설정 (15CBM 기준)
    IF NEW.total_cbm IS NOT NULL THEN
        IF NEW.total_cbm >= 15 THEN
            NEW.shipping_method = 'FCL';
        ELSE
            NEW.shipping_method = 'LCL';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS calculate_cbm_trigger ON market_research_requests;
CREATE TRIGGER calculate_cbm_trigger
BEFORE INSERT OR UPDATE ON market_research_requests
FOR EACH ROW
EXECUTE FUNCTION calculate_total_cbm();

-- 샘플 단가 자동계산 트리거
CREATE OR REPLACE FUNCTION calculate_sample_price()
RETURNS TRIGGER AS $$
BEGIN
    -- 샘플 중국단가와 환율이 있을 때 계산
    IF NEW.sample_china_price IS NOT NULL AND NEW.exchange_rate IS NOT NULL THEN
        NEW.sample_unit_price = NEW.sample_china_price * NEW.exchange_rate;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS calculate_sample_price_trigger ON market_research_requests;
CREATE TRIGGER calculate_sample_price_trigger
BEFORE INSERT OR UPDATE ON market_research_requests
FOR EACH ROW
EXECUTE FUNCTION calculate_sample_price();

-- 환율 산정일 자동입력 트리거
CREATE OR REPLACE FUNCTION set_exchange_rate_date()
RETURNS TRIGGER AS $$
BEGIN
    -- 중국직원이 데이터 입력할 때 자동으로 오늘 날짜 설정
    IF NEW.china_unit_price IS NOT NULL AND NEW.exchange_rate_date IS NULL THEN
        NEW.exchange_rate_date = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS set_exchange_rate_date_trigger ON market_research_requests;
CREATE TRIGGER set_exchange_rate_date_trigger
BEFORE INSERT OR UPDATE ON market_research_requests
FOR EACH ROW
EXECUTE FUNCTION set_exchange_rate_date();

-- 가격 자동계산 트리거
CREATE OR REPLACE FUNCTION calculate_prices()
RETURNS TRIGGER AS $$
DECLARE
    v_shipping_fee NUMERIC;
BEGIN
    -- 견적수량이 없으면 조사수량 사용
    IF NEW.quoted_quantity IS NULL AND NEW.research_quantity IS NOT NULL THEN
        NEW.quoted_quantity = NEW.research_quantity;
    END IF;
    
    -- 수수료 계산 (중국단가 * 수량 * 환율 * 5%)
    IF NEW.china_unit_price IS NOT NULL 
    AND NEW.quoted_quantity IS NOT NULL 
    AND NEW.exchange_rate IS NOT NULL THEN
        NEW.commission_amount = NEW.china_unit_price * NEW.quoted_quantity * NEW.exchange_rate * 0.05;
    END IF;
    
    -- EXW 합계 계산 (중국단가*수량+중국운송료)*환율
    IF NEW.china_unit_price IS NOT NULL 
    AND NEW.quoted_quantity IS NOT NULL 
    AND NEW.exchange_rate IS NOT NULL THEN
        NEW.exw_total = (NEW.china_unit_price * NEW.quoted_quantity + COALESCE(NEW.china_shipping_fee, 0)) * NEW.exchange_rate;
    END IF;
    
    -- LCL 운송비 자동계산 (CBM * 90000원)
    IF NEW.shipping_method = 'LCL' AND NEW.total_cbm IS NOT NULL THEN
        NEW.lcl_shipping_fee = NEW.total_cbm * 90000;
        v_shipping_fee = NEW.lcl_shipping_fee;
    ELSIF NEW.shipping_method = 'FCL' AND NEW.fcl_shipping_fee IS NOT NULL THEN
        v_shipping_fee = NEW.fcl_shipping_fee;
    ELSE
        v_shipping_fee = 0;
    END IF;
    
    -- 1차 결제비용 계산 (EXW + 수수료의 부가세)
    IF NEW.exw_total IS NOT NULL AND NEW.commission_amount IS NOT NULL THEN
        NEW.first_payment_amount = NEW.exw_total + (NEW.commission_amount * 0.1);
    END IF;
    
    -- 관세 계산 (관세율 * (EXW 합계 + 배송비))
    IF NEW.customs_rate IS NOT NULL AND NEW.exw_total IS NOT NULL THEN
        NEW.customs_duty = (NEW.customs_rate / 100) * (NEW.exw_total + v_shipping_fee);
    END IF;
    
    -- 부가세 계산 ((EXW 합계 + 배송비 + 관세) * 10%)
    IF NEW.exw_total IS NOT NULL AND NEW.customs_duty IS NOT NULL THEN
        NEW.import_vat = (NEW.exw_total + v_shipping_fee + NEW.customs_duty) * 0.1;
    END IF;
    
    -- 예상 2차결제비용 (관세 + 부가세 + 배송비)
    IF NEW.customs_duty IS NOT NULL AND NEW.import_vat IS NOT NULL THEN
        NEW.expected_second_payment = NEW.customs_duty + NEW.import_vat + v_shipping_fee;
    END IF;
    
    -- 예상 총 합계 (1차비용 + 2차비용)
    IF NEW.first_payment_amount IS NOT NULL AND NEW.expected_second_payment IS NOT NULL THEN
        NEW.expected_total_supply_price = NEW.first_payment_amount + NEW.expected_second_payment;
    END IF;
    
    -- 예상 단가 (예상 총 합계 / 수량)
    IF NEW.expected_total_supply_price IS NOT NULL AND NEW.quoted_quantity IS NOT NULL AND NEW.quoted_quantity > 0 THEN
        NEW.expected_unit_price = NEW.expected_total_supply_price / NEW.quoted_quantity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS calculate_prices_trigger ON market_research_requests;
CREATE TRIGGER calculate_prices_trigger
BEFORE INSERT OR UPDATE ON market_research_requests
FOR EACH ROW
EXECUTE FUNCTION calculate_prices();

-- =====================================================
-- 7. 인덱스 추가 (성능 최적화)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_market_research_reservation 
ON market_research_requests(reservation_number);

CREATE INDEX IF NOT EXISTS idx_market_research_user 
ON market_research_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_market_research_status 
ON market_research_requests(status);

CREATE INDEX IF NOT EXISTS idx_market_research_assigned_staff 
ON market_research_requests(assigned_staff);

-- =====================================================
-- 8. 기존 데이터 마이그레이션
-- =====================================================

-- 기존 데이터가 있다면 자동계산 필드 업데이트
UPDATE market_research_requests SET 
    updated_at = CURRENT_TIMESTAMP
WHERE id IS NOT NULL;

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 총 변경사항:
-- - 7개 필드 삭제
-- - 15개 필드명 변경
-- - 34개 신규 필드 추가
-- - 5개 자동계산 트리거 생성
-- - 4개 인덱스 추가