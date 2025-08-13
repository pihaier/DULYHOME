-- Chinese staff RLS policies for all service tables
-- This migration adds RLS policies for chinese_staff role to view and update service requests

-- =====================================================
-- inspection_applications - Chinese staff policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Chinese staff can view assigned applications" ON inspection_applications;
DROP POLICY IF EXISTS "Chinese staff can update assigned applications" ON inspection_applications;

-- Chinese staff can view all inspection applications
CREATE POLICY "Chinese staff can view all inspections" 
ON inspection_applications FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- Chinese staff can update assigned inspection applications
CREATE POLICY "Chinese staff can update assigned inspections" 
ON inspection_applications FOR UPDATE 
TO public 
USING (
  assigned_chinese_staff = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- =====================================================
-- market_research_requests - Chinese staff policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Chinese staff can view all market research" ON market_research_requests;
DROP POLICY IF EXISTS "Chinese staff can update assigned market research" ON market_research_requests;

-- Chinese staff can view all market research requests
CREATE POLICY "Chinese staff can view all market research" 
ON market_research_requests FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- Chinese staff can update assigned market research requests
CREATE POLICY "Chinese staff can update assigned market research" 
ON market_research_requests FOR UPDATE 
TO public 
USING (
  assigned_staff = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- =====================================================
-- factory_contact_requests - Chinese staff policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Chinese staff can view all factory contacts" ON factory_contact_requests;
DROP POLICY IF EXISTS "Chinese staff can update assigned factory contacts" ON factory_contact_requests;

-- Chinese staff can view all factory contact requests
CREATE POLICY "Chinese staff can view all factory contacts" 
ON factory_contact_requests FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- Chinese staff can update assigned factory contact requests
CREATE POLICY "Chinese staff can update assigned factory contacts" 
ON factory_contact_requests FOR UPDATE 
TO public 
USING (
  assigned_chinese_staff = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- =====================================================
-- confirmation_requests - Chinese staff policies (for factory contact)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Chinese staff can manage confirmation requests" ON confirmation_requests;

-- Chinese staff can manage confirmation requests
CREATE POLICY "Chinese staff can manage confirmation requests" 
ON confirmation_requests FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);

-- =====================================================
-- uploaded_files - Chinese staff policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Chinese staff can manage files" ON uploaded_files;

-- Chinese staff can manage uploaded files
CREATE POLICY "Chinese staff can manage files" 
ON uploaded_files FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'chinese_staff'
  )
);