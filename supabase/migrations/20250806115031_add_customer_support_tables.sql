-- 공지사항 테이블
CREATE TABLE IF NOT EXISTS notices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('공지', '안내', '기능추가', '점검')),
  is_important boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- FAQ 테이블
CREATE TABLE IF NOT EXISTS faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('회원가입', '서비스신청', '결제', '배송', '통관', '서비스')),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- 공지사항 읽기 권한 (모든 사용자)
CREATE POLICY "Anyone can view notices" ON notices
  FOR SELECT USING (true);

-- 공지사항 생성/수정/삭제 권한 (admin 또는 korean_team role만)
CREATE POLICY "Only admins can insert notices" ON notices
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('admin', 'korean_team')
    )
  );

CREATE POLICY "Only admins can update notices" ON notices
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('admin', 'korean_team')
    )
  );

CREATE POLICY "Only admins can delete notices" ON notices
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('admin', 'korean_team')
    )
  );

-- FAQ 읽기 권한 (모든 사용자)
CREATE POLICY "Anyone can view faqs" ON faqs
  FOR SELECT USING (true);

-- FAQ 생성/수정/삭제 권한 (admin 또는 korean_team role만)
CREATE POLICY "Only admins can insert faqs" ON faqs
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('admin', 'korean_team')
    )
  );

CREATE POLICY "Only admins can update faqs" ON faqs
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('admin', 'korean_team')
    )
  );

CREATE POLICY "Only admins can delete faqs" ON faqs
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('admin', 'korean_team')
    )
  );