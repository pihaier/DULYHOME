-- =====================================================
-- factory_contact_requests 테이블 정리 SQL
-- 작성일: 2025-01-13
-- 목적: 중국어 필드 추가, 결제 관련 필드 추가, 견적 테이블 생성
-- =====================================================

-- =====================================================
-- 1. factory_contact_requests 테이블 필드 추가
-- =====================================================

-- 중국어 번역 필드 추가
ALTER TABLE factory_contact_requests
ADD COLUMN IF NOT EXISTS product_name_chinese VARCHAR(500),         -- 제품명(중국어)
ADD COLUMN IF NOT EXISTS product_description_chinese TEXT,          -- 제품설명(중국어)  
ADD COLUMN IF NOT EXISTS special_requirements_chinese TEXT;         -- 특별요구사항(중국어)

-- 결제 관련 필드 추가
ALTER TABLE factory_contact_requests
ADD COLUMN IF NOT EXISTS selected_quotation_pdf TEXT,               -- 최종 선택된 견적서 PDF URL
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);              -- 최종 결제금액

-- =====================================================
-- 2. factory_contact_quotations 테이블 생성 (견적 관리)
-- =====================================================

CREATE TABLE IF NOT EXISTS factory_contact_quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_number VARCHAR(50) NOT NULL,                        -- 예약번호 (FC-YYYYMMDD-XXXXXX)
    quotation_number VARCHAR(50) NOT NULL,                          -- 견적번호 (QT-001, QT-002...)
    supplier_name VARCHAR(200),                                     -- 공급업체명
    supplier_name_chinese VARCHAR(200),                             -- 공급업체명(중국어)
    quotation_date DATE DEFAULT CURRENT_DATE,                       -- 견적일
    
    -- 가격 정보
    unit_price NUMERIC(10,2),                                       -- 단가
    quantity INTEGER,                                                -- 수량
    total_amount NUMERIC(10,2),                                     -- 총금액 (단가 × 수량)
    vat_amount NUMERIC(10,2),                                       -- 부가세 (자동계산: 총금액 × 10%)
    final_amount NUMERIC(10,2),                                     -- 최종금액 (자동계산: 총금액 + 부가세)
    currency VARCHAR(10) DEFAULT 'KRW',                             -- 통화 (KRW/USD/CNY)
    
    -- 조건 정보
    delivery_terms TEXT,                                            -- 배송조건
    delivery_terms_chinese TEXT,                                    -- 배송조건(중국어)
    payment_terms TEXT,                                             -- 결제조건
    payment_terms_chinese TEXT,                                     -- 결제조건(중국어)
    validity_period INTEGER DEFAULT 30,                             -- 유효기간(일)
    
    -- 문서 및 상태
    quotation_pdf TEXT,                                             -- 견적서 PDF URL
    is_selected BOOLEAN DEFAULT FALSE,                              -- 선택된 견적 여부
    notes TEXT,                                                     -- 비고
    notes_chinese TEXT,                                             -- 비고(중국어)
    
    -- 메타데이터
    created_by UUID,                                                -- 생성자 (중국직원)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 외래키 제약
    CONSTRAINT fk_reservation 
        FOREIGN KEY (reservation_number) 
        REFERENCES factory_contact_requests(reservation_number) 
        ON DELETE CASCADE,
    
    -- 유니크 제약 (하나의 예약번호당 견적번호는 중복 불가)
    CONSTRAINT unique_quotation_number 
        UNIQUE (reservation_number, quotation_number)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quotations_reservation 
ON factory_contact_quotations(reservation_number);

CREATE INDEX IF NOT EXISTS idx_quotations_selected 
ON factory_contact_quotations(is_selected) 
WHERE is_selected = TRUE;

-- =====================================================
-- 3. 자동계산 트리거 함수 생성
-- =====================================================

-- 부가세 및 최종금액 자동계산 트리거
CREATE OR REPLACE FUNCTION calculate_quotation_amounts()
RETURNS TRIGGER AS $$
BEGIN
    -- 총금액 계산 (단가 × 수량)
    IF NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
        NEW.total_amount = NEW.unit_price * NEW.quantity;
    END IF;
    
    -- 부가세 계산 (총금액 × 10%)
    IF NEW.total_amount IS NOT NULL THEN
        NEW.vat_amount = NEW.total_amount * 0.1;
    END IF;
    
    -- 최종금액 계산 (총금액 + 부가세)
    IF NEW.total_amount IS NOT NULL AND NEW.vat_amount IS NOT NULL THEN
        NEW.final_amount = NEW.total_amount + NEW.vat_amount;
    END IF;
    
    -- updated_at 갱신
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS calculate_quotation_amounts_trigger ON factory_contact_quotations;
CREATE TRIGGER calculate_quotation_amounts_trigger
BEFORE INSERT OR UPDATE ON factory_contact_quotations
FOR EACH ROW
EXECUTE FUNCTION calculate_quotation_amounts();

-- =====================================================
-- 4. 견적 선택 시 메인 테이블 업데이트 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION update_selected_quotation()
RETURNS TRIGGER AS $$
BEGIN
    -- 견적이 선택되었을 때
    IF NEW.is_selected = TRUE THEN
        -- 같은 reservation_number의 다른 견적들은 선택 해제
        UPDATE factory_contact_quotations
        SET is_selected = FALSE
        WHERE reservation_number = NEW.reservation_number
        AND id != NEW.id;
        
        -- 메인 테이블에 선택된 견적 정보 업데이트
        UPDATE factory_contact_requests
        SET 
            selected_quotation_pdf = NEW.quotation_pdf,
            payment_amount = NEW.final_amount,
            payment_status = 'pending',
            updated_at = NOW()
        WHERE reservation_number = NEW.reservation_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_selected_quotation_trigger ON factory_contact_quotations;
CREATE TRIGGER update_selected_quotation_trigger
AFTER INSERT OR UPDATE OF is_selected ON factory_contact_quotations
FOR EACH ROW
EXECUTE FUNCTION update_selected_quotation();

-- =====================================================
-- 5. 견적번호 자동생성 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 견적번호가 없을 때만 생성
    IF NEW.quotation_number IS NULL OR NEW.quotation_number = '' THEN
        -- 해당 reservation_number의 견적 개수 확인
        SELECT COUNT(*) + 1 INTO v_count
        FROM factory_contact_quotations
        WHERE reservation_number = NEW.reservation_number;
        
        -- QT-001, QT-002 형식으로 생성
        NEW.quotation_number = 'QT-' || LPAD(v_count::TEXT, 3, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS generate_quotation_number_trigger ON factory_contact_quotations;
CREATE TRIGGER generate_quotation_number_trigger
BEFORE INSERT ON factory_contact_quotations
FOR EACH ROW
EXECUTE FUNCTION generate_quotation_number();

-- =====================================================
-- 6. RLS (Row Level Security) 정책 설정
-- =====================================================

-- factory_contact_quotations 테이블 RLS 활성화
ALTER TABLE factory_contact_quotations ENABLE ROW LEVEL SECURITY;

-- 고객은 자신의 견적만 조회 가능
CREATE POLICY "customers_view_own_quotations" ON factory_contact_quotations
FOR SELECT
USING (
    reservation_number IN (
        SELECT reservation_number 
        FROM factory_contact_requests 
        WHERE user_id = auth.uid()
    )
);

-- 중국직원은 배정된 건의 견적 CRUD 가능
CREATE POLICY "chinese_staff_manage_quotations" ON factory_contact_quotations
FOR ALL
USING (
    reservation_number IN (
        SELECT reservation_number 
        FROM factory_contact_requests 
        WHERE assigned_chinese_staff = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role = 'chinese_staff'
    )
);

-- 한국팀/관리자는 모든 견적 접근 가능
CREATE POLICY "korean_team_full_access_quotations" ON factory_contact_quotations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('korean_team', 'admin')
    )
);

-- =====================================================
-- 7. 기본값 설정
-- =====================================================

ALTER TABLE factory_contact_requests
ALTER COLUMN status SET DEFAULT 'submitted',
ALTER COLUMN payment_status SET DEFAULT 'pending';

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 총 변경사항:
-- - factory_contact_requests: 5개 필드 추가 (중국어 3개, 결제 2개)
-- - factory_contact_quotations: 새 테이블 생성 (견적 관리)
-- - 4개 자동계산 트리거 생성
-- - 3개 RLS 정책 추가
-- - 2개 인덱스 추가