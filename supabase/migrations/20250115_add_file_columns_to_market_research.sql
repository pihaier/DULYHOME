-- Add file columns to market_research_requests table
-- 각 용도별로 파일을 저장할 JSONB 컬럼 추가

-- ============= 고객 신청 시 업로드 파일들 =============
-- 고객이 신청할 때 업로드한 제품 사진들
ALTER TABLE market_research_requests 
ADD COLUMN IF NOT EXISTS application_photos JSONB DEFAULT '[]'::jsonb;

-- 로고 파일들
ALTER TABLE market_research_requests 
ADD COLUMN IF NOT EXISTS logo_files JSONB DEFAULT '[]'::jsonb;

-- 박스/포장 관련 파일들
ALTER TABLE market_research_requests 
ADD COLUMN IF NOT EXISTS box_files JSONB DEFAULT '[]'::jsonb;

-- ============= 중국 직원이 업로드하는 파일들 =============
-- product_actual_photos는 이미 존재함

-- 공장 관련 문서들
ALTER TABLE market_research_requests 
ADD COLUMN IF NOT EXISTS factory_documents JSONB DEFAULT '[]'::jsonb;

-- 인증서 파일들
ALTER TABLE market_research_requests 
ADD COLUMN IF NOT EXISTS certification_files JSONB DEFAULT '[]'::jsonb;

-- ============= 관련 자료 및 참고 링크 =============
-- 참고 링크들 (URL, 제목, 설명 포함)
ALTER TABLE market_research_requests 
ADD COLUMN IF NOT EXISTS reference_links JSONB DEFAULT '[]'::jsonb;

-- ============= 기존 uploaded_files 테이블 데이터 마이그레이션 =============
-- application_photos 마이그레이션 (고객 신청 제품 사진)
UPDATE market_research_requests mr
SET application_photos = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'url', uf.file_url,
        'filename', uf.original_filename,
        'size', uf.file_size,
        'uploaded_at', uf.created_at
      ) ORDER BY uf.created_at
    )
    FROM uploaded_files uf
    WHERE uf.reservation_number = mr.reservation_number
      AND uf.upload_purpose = 'application'
      AND uf.file_type IN ('image', 'product')
  ),
  '[]'::jsonb
)
WHERE EXISTS (
  SELECT 1 FROM uploaded_files uf2
  WHERE uf2.reservation_number = mr.reservation_number
    AND uf2.upload_purpose = 'application'
    AND uf2.file_type IN ('image', 'product')
);

-- logo_files 마이그레이션
UPDATE market_research_requests mr
SET logo_files = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'url', uf.file_url,
        'filename', uf.original_filename,
        'size', uf.file_size,
        'uploaded_at', uf.created_at
      ) ORDER BY uf.created_at
    )
    FROM uploaded_files uf
    WHERE uf.reservation_number = mr.reservation_number
      AND uf.file_type = 'logo'
  ),
  '[]'::jsonb
)
WHERE EXISTS (
  SELECT 1 FROM uploaded_files uf2
  WHERE uf2.reservation_number = mr.reservation_number
    AND uf2.file_type = 'logo'
);

-- box_files 마이그레이션 (박스/포장 관련)
UPDATE market_research_requests mr
SET box_files = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'url', uf.file_url,
        'filename', uf.original_filename,
        'size', uf.file_size,
        'uploaded_at', uf.created_at
      ) ORDER BY uf.created_at
    )
    FROM uploaded_files uf
    WHERE uf.reservation_number = mr.reservation_number
      AND uf.upload_purpose = 'application'
      AND uf.file_type = 'box'
  ),
  '[]'::jsonb
)
WHERE EXISTS (
  SELECT 1 FROM uploaded_files uf2
  WHERE uf2.reservation_number = mr.reservation_number
    AND uf2.upload_purpose = 'application'
    AND uf2.file_type = 'box'
);

-- factory_documents 마이그레이션
UPDATE market_research_requests mr
SET factory_documents = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'url', uf.file_url,
        'filename', uf.original_filename,
        'size', uf.file_size,
        'uploaded_at', uf.created_at
      ) ORDER BY uf.created_at
    )
    FROM uploaded_files uf
    WHERE uf.reservation_number = mr.reservation_number
      AND uf.file_type = 'factory_document'
  ),
  '[]'::jsonb
)
WHERE EXISTS (
  SELECT 1 FROM uploaded_files uf2
  WHERE uf2.reservation_number = mr.reservation_number
    AND uf2.file_type = 'factory_document'
);

-- certification_files 마이그레이션
UPDATE market_research_requests mr
SET certification_files = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'url', uf.file_url,
        'filename', uf.original_filename,
        'size', uf.file_size,
        'uploaded_at', uf.created_at
      ) ORDER BY uf.created_at
    )
    FROM uploaded_files uf
    WHERE uf.reservation_number = mr.reservation_number
      AND uf.file_type = 'certification'
  ),
  '[]'::jsonb
)
WHERE EXISTS (
  SELECT 1 FROM uploaded_files uf2
  WHERE uf2.reservation_number = mr.reservation_number
    AND uf2.file_type = 'certification'
);

-- ============= 인덱스 추가 (JSON 검색 성능 향상) =============
CREATE INDEX IF NOT EXISTS idx_market_research_application_photos ON market_research_requests USING gin(application_photos);
CREATE INDEX IF NOT EXISTS idx_market_research_logo_files ON market_research_requests USING gin(logo_files);
CREATE INDEX IF NOT EXISTS idx_market_research_box_files ON market_research_requests USING gin(box_files);
CREATE INDEX IF NOT EXISTS idx_market_research_factory_documents ON market_research_requests USING gin(factory_documents);
CREATE INDEX IF NOT EXISTS idx_market_research_certification_files ON market_research_requests USING gin(certification_files);
CREATE INDEX IF NOT EXISTS idx_market_research_reference_links ON market_research_requests USING gin(reference_links);

-- ============= 코멘트 추가 (문서화) =============
COMMENT ON COLUMN market_research_requests.application_photos IS '고객이 신청 시 업로드한 제품 사진들';
COMMENT ON COLUMN market_research_requests.logo_files IS '로고 파일들';
COMMENT ON COLUMN market_research_requests.box_files IS '박스/포장 관련 파일들';
COMMENT ON COLUMN market_research_requests.factory_documents IS '공장 관련 문서들';
COMMENT ON COLUMN market_research_requests.certification_files IS '인증서 파일들';
COMMENT ON COLUMN market_research_requests.reference_links IS '참고 링크 및 관련 자료들';