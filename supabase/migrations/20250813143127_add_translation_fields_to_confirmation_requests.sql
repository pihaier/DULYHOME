-- =====================================================
-- confirmation_requests table translation fields
-- Date: 2025-01-13
-- Purpose: Add translation fields for China-Korea communication
-- =====================================================

-- Add Chinese translation fields for requests from Chinese staff
ALTER TABLE confirmation_requests
ADD COLUMN IF NOT EXISTS title_chinese VARCHAR(500),           -- Chinese title
ADD COLUMN IF NOT EXISTS title_korean VARCHAR(500),            -- Korean title (translated)
ADD COLUMN IF NOT EXISTS description_chinese TEXT,             -- Chinese description
ADD COLUMN IF NOT EXISTS description_korean TEXT,              -- Korean description (translated)
ADD COLUMN IF NOT EXISTS options_chinese JSONB,                -- Chinese option list
ADD COLUMN IF NOT EXISTS options_korean JSONB;                 -- Korean option list (translated)

-- Add translation fields for customer responses
ALTER TABLE confirmation_requests
ADD COLUMN IF NOT EXISTS customer_response_original VARCHAR(1000),    -- Original customer response
ADD COLUMN IF NOT EXISTS customer_response_translated VARCHAR(1000),  -- Translated customer response
ADD COLUMN IF NOT EXISTS customer_comment_original TEXT,              -- Original customer comment
ADD COLUMN IF NOT EXISTS customer_comment_translated TEXT,            -- Translated customer comment
ADD COLUMN IF NOT EXISTS response_language VARCHAR(10);                -- Response language (ko/zh)

-- Add sender information
ALTER TABLE confirmation_requests
ADD COLUMN IF NOT EXISTS sender_role VARCHAR(50),               -- Sender role (chinese_staff/korean_team)
ADD COLUMN IF NOT EXISTS sender_language VARCHAR(10);           -- Sender language (ko/zh)

-- =====================================================
-- Create automatic translation trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION set_confirmation_language_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Set sender language based on role
    IF NEW.created_by IS NOT NULL THEN
        SELECT 
            CASE 
                WHEN up.role IN ('chinese_staff', 'factory', 'inspector') THEN 'zh'
                WHEN up.role IN ('customer', 'korean_team', 'admin') THEN 'ko'
                ELSE 'ko'
            END INTO NEW.sender_language
        FROM user_profiles up
        WHERE up.user_id = NEW.created_by;
        
        -- Set sender role
        SELECT up.role INTO NEW.sender_role
        FROM user_profiles up
        WHERE up.user_id = NEW.created_by;
    END IF;
    
    -- Update timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_confirmation_language_trigger ON confirmation_requests;
CREATE TRIGGER set_confirmation_language_trigger
BEFORE INSERT OR UPDATE ON confirmation_requests
FOR EACH ROW
EXECUTE FUNCTION set_confirmation_language_fields();

-- =====================================================
-- Add updated_at column if not exists
-- =====================================================
ALTER TABLE confirmation_requests
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_confirmation_sender_language 
ON confirmation_requests(sender_language);

CREATE INDEX IF NOT EXISTS idx_confirmation_response_language 
ON confirmation_requests(response_language);

CREATE INDEX IF NOT EXISTS idx_confirmation_sender_role 
ON confirmation_requests(sender_role);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON COLUMN confirmation_requests.title_chinese IS 'Title in Chinese (original if from Chinese staff)';
COMMENT ON COLUMN confirmation_requests.title_korean IS 'Title in Korean (translated if from Chinese staff)';
COMMENT ON COLUMN confirmation_requests.description_chinese IS 'Description in Chinese';
COMMENT ON COLUMN confirmation_requests.description_korean IS 'Description in Korean';
COMMENT ON COLUMN confirmation_requests.options_chinese IS 'Option list in Chinese';
COMMENT ON COLUMN confirmation_requests.options_korean IS 'Option list in Korean';
COMMENT ON COLUMN confirmation_requests.customer_response_original IS 'Customer response in original language';
COMMENT ON COLUMN confirmation_requests.customer_response_translated IS 'Customer response translated';
COMMENT ON COLUMN confirmation_requests.response_language IS 'Language of customer response (ko/zh)';
COMMENT ON COLUMN confirmation_requests.sender_role IS 'Role of request sender';
COMMENT ON COLUMN confirmation_requests.sender_language IS 'Language of request sender';

-- =====================================================
-- Usage example
-- =====================================================
-- When Chinese staff creates confirmation request:
-- 1. Insert with title_chinese, description_chinese, options_chinese
-- 2. API translates to title_korean, description_korean, options_korean
-- 3. Korean customer sees Korean version
-- 
-- When customer responds:
-- 1. Insert customer_response_original (Korean)
-- 2. API translates to customer_response_translated (Chinese)
-- 3. Chinese staff sees Chinese version

-- =====================================================
-- Completion message
-- =====================================================
-- Total added fields: 13
-- - 6 translation fields for requests
-- - 5 translation fields for responses  
-- - 2 language/role tracking fields
-- Added 1 trigger function for automatic language detection
-- Added 3 indexes for performance