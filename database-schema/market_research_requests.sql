-- 시장조사 신청 테이블
-- SERVICE_FIELDS_DEFINITION.md 4.1 섹션 기반

CREATE TABLE IF NOT EXISTS market_research_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_number VARCHAR(50) UNIQUE NOT NULL, -- DLSY-YYYYMMDD-XXXXXX 형식
  
  -- 사용자 정보
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(100) NOT NULL,
  
  -- 제품 정보
  product_name VARCHAR(200) NOT NULL,
  product_name_translated VARCHAR(200), -- GPT-4 번역 결과
  research_quantity INTEGER NOT NULL,
  detail_page TEXT, -- 상세페이지 URL
  
  -- 요청사항
  requirements TEXT NOT NULL,
  requirements_translated TEXT, -- GPT-4 번역 결과
  
  -- 파일 업로드
  photos JSONB NOT NULL, -- 사진 파일 경로 배열
  
  -- 로고 인쇄 옵션
  logo_required BOOLEAN DEFAULT FALSE,
  logo_file TEXT, -- 로고 파일 경로
  logo_print_details TEXT, -- 인쇄 방식, 크기, 위치
  
  -- 박스 제작 옵션
  custom_box_required BOOLEAN DEFAULT FALSE,
  box_design_file TEXT, -- 박스 디자인 파일 경로
  
  -- 상태 관리
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'assigned', 'researching', 'quote_preparation', 
    'quote_sent', 'completed', 'cancelled'
  )),
  
  -- 담당자 배정
  assigned_chinese_staff UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- 견적 정보
  research_fee DECIMAL(10,2) DEFAULT 50000, -- 5만원 고정
  quote_sent_at TIMESTAMP WITH TIME ZONE,
  quote_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 시스템 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_market_research_reservation_number ON market_research_requests(reservation_number);
CREATE INDEX IF NOT EXISTS idx_market_research_user_id ON market_research_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_market_research_status ON market_research_requests(status);
CREATE INDEX IF NOT EXISTS idx_market_research_assigned_staff ON market_research_requests(assigned_chinese_staff);
CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON market_research_requests(created_at DESC);

-- RLS 정책 설정
ALTER TABLE market_research_requests ENABLE ROW LEVEL SECURITY;

-- 고객은 자신의 신청서만 조회/수정 가능
CREATE POLICY "customers_own_requests" ON market_research_requests
FOR ALL USING (auth.uid() = user_id);

-- 중국 직원은 배정된 신청서만 조회/수정 가능
CREATE POLICY "chinese_staff_assigned_requests" ON market_research_requests
FOR ALL USING (
  auth.uid() = assigned_chinese_staff 
  OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'chinese_staff'
    AND auth.uid() = assigned_chinese_staff
  )
);

-- 한국팀과 관리자는 모든 신청서 접근 가능
CREATE POLICY "korean_team_all_access" ON market_research_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('korean_team', 'admin')
  )
);

-- 업데이트 트리거 설정
CREATE OR REPLACE FUNCTION update_market_research_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_research_updated_at
  BEFORE UPDATE ON market_research_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_market_research_updated_at();