-- =====================================================
-- inspection_applications 테이블 정리 SQL
-- 작성일: 2025-01-13
-- 목적: 시장조사용 필드 제거 및 필요 필드 추가
-- =====================================================

-- 1. 불필요한 필드 삭제 (시장조사용 및 미사용 필드)
ALTER TABLE inspection_applications
DROP COLUMN IF EXISTS moq_check,              -- MOQ체크 (시장조사용)
DROP COLUMN IF EXISTS logo_required,          -- 로고필요 (시장조사용)
DROP COLUMN IF EXISTS logo_details,           -- 로고상세 (시장조사용)
DROP COLUMN IF EXISTS custom_box_required,    -- 박스필요 (시장조사용)
DROP COLUMN IF EXISTS box_details,            -- 박스상세 (시장조사용)
DROP COLUMN IF EXISTS detail_page,            -- 상세페이지 (시장조사용)
DROP COLUMN IF EXISTS detail_page_cn,         -- 상세페이지중국어 (시장조사용)
DROP COLUMN IF EXISTS research_type,          -- 조사타입 (시장조사용)
DROP COLUMN IF EXISTS schedule_availability,  -- 일정가능 (미사용)
DROP COLUMN IF EXISTS available_dates,        -- 가능일자 (미사용)
DROP COLUMN IF EXISTS confirm_reservation,    -- 예약확인 (미사용)
DROP COLUMN IF EXISTS inspection_photos,      -- 검품사진 (files테이블 사용)
DROP COLUMN IF EXISTS quotation_pdf,          -- 견적서PDF (files테이블 사용)
DROP COLUMN IF EXISTS tax_invoice_pdf;        -- 세금계산서PDF (files테이블 사용)

-- 2. 필요한 필드 추가
ALTER TABLE inspection_applications
ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 290000,  -- 단가 (1일 기본가격)
ADD COLUMN IF NOT EXISTS total_amount NUMERIC;               -- 총합계 (총비용+부가세)

-- 3. 기존 데이터 업데이트 (총합계 계산)
UPDATE inspection_applications
SET total_amount = COALESCE(total_cost, 0) + COALESCE(vat_amount, 0)
WHERE total_amount IS NULL;

-- 4. 단가 설정 (검품일수 기준)
UPDATE inspection_applications
SET unit_price = CASE 
    WHEN inspection_days >= 10 THEN 250000  -- 10일 이상: 25만원
    WHEN inspection_days >= 5 THEN 270000   -- 5-9일: 27만원
    ELSE 290000                             -- 1-4일: 29만원 (기본)
END
WHERE unit_price IS NULL OR unit_price = 290000;

-- 5. 총비용 재계산 (단가 × 검품일수)
UPDATE inspection_applications
SET total_cost = unit_price * COALESCE(inspection_days, 1)
WHERE inspection_days IS NOT NULL;

-- 6. VAT 재계산 (총비용의 10%)
UPDATE inspection_applications
SET vat_amount = total_cost * 0.1
WHERE total_cost IS NOT NULL;

-- 7. 총합계 재계산
UPDATE inspection_applications
SET total_amount = COALESCE(total_cost, 0) + COALESCE(vat_amount, 0);

-- =====================================================
-- 유지되는 필드 목록 (참고용)
-- =====================================================
-- ✅ 기본 필드:
-- - id                              -- 고유ID
-- - reservation_number              -- 예약번호
-- - user_id                         -- 사용자ID
-- - company_name                    -- 회사명
-- - contact_person                  -- 담당자명
-- - contact_phone                   -- 연락처
-- - contact_email                   -- 이메일
-- - service_type                    -- 서비스타입
-- - service_subtype                 -- 서브타입 (일단 유지)
-- - product_name                    -- 제품명
-- - product_name_translated         -- 제품명번역 (중국직원용)
-- - production_quantity             -- 생산수량
-- - special_requirements            -- 특별요구사항
-- - special_requirements_translated -- 요구사항번역 (중국직원용)
-- - status                          -- 상태
-- - payment_status                  -- 결제상태
-- - assigned_chinese_staff          -- 담당중국직원
-- - created_at                      -- 생성일시
-- - updated_at                      -- 수정일시
--
-- ✅ 검품 관련 필드:
-- - inspection_method               -- 검품방법
-- - factory_name                    -- 공장명
-- - factory_contact                 -- 공장담당자
-- - factory_phone                   -- 공장전화
-- - factory_address                 -- 공장주소
-- - schedule_type                   -- 일정타입
-- - confirmed_date                  -- 확정일자
-- - inspection_days                 -- 검품일수
--
-- ✅ 결과 및 비용 필드:
-- - inspection_report               -- 검품리포트
-- - inspection_summary              -- 검품요약
-- - pass_fail_status                -- 합격불합격
-- - improvement_items               -- 개선사항
-- - unit_price                      -- 단가 (신규추가)
-- - total_cost                      -- 총비용
-- - vat_amount                      -- 부가세
-- - total_amount                    -- 총합계 (신규추가)
--
-- ✅ UI 처리 고려 필드:
-- - service_subtype_chinese         -- 서브타입중국어
-- - status_chinese                  -- 상태중국어