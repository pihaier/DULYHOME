-- 초기 테이블 생성 (user_profiles)
-- 다른 마이그레이션이 의존하는 핵심 테이블

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" uuid NOT NULL,
    "role" character varying(20) NOT NULL,
    "company_name" character varying(100),
    "company_name_chinese" character varying(100),
    "business_number" character varying(20),
    "contact_person" character varying(50),
    "phone" character varying(20),
    "department" character varying(50),
    "position" character varying(50),
    "customer_type" character varying(10),
    "personal_customs_code" character varying(20),
    "virtual_account" character varying(50),
    "approval_status" character varying(20) DEFAULT 'pending',
    "approved_by" uuid,
    "approved_at" timestamp with time zone,
    "language_preference" character varying(2) DEFAULT 'ko',
    "notification_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "provider" character varying(20) DEFAULT 'email',
    "provider_id" character varying(255),
    "avatar_url" text,
    "full_name" character varying(100),
    "terms_accepted_at" timestamp with time zone,
    "privacy_accepted_at" timestamp with time zone,
    "marketing_accepted_at" timestamp with time zone,
    "customs_type" text,
    "default_shipping_address" text,
    "default_receiver_name" text,
    "default_receiver_phone" text,    "email" character varying(255),
    "tax_company_name" character varying(255),
    "tax_registration_number" character varying(50),
    "tax_representative" character varying(100),
    "tax_address" text,
    "tax_business_type" character varying(100),
    "tax_business_item" character varying(100),
    "tax_email" character varying(255),
    "tax_phone" character varying(50),
    "tax_fax" character varying(50),
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id"),
    CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") 
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT "user_profiles_approval_status_check" CHECK (
        approval_status IN ('pending', 'approved', 'rejected')
    ),
    CONSTRAINT "user_profiles_customer_type_check" CHECK (
        customer_type IN ('개인', '법인')
    ),
    CONSTRAINT "user_profiles_customs_type_check" CHECK (
        customs_type IN ('개인통관', '사업자통관')
    ),
    CONSTRAINT "user_profiles_language_preference_check" CHECK (
        language_preference IN ('ko', 'zh')
    ),
    CONSTRAINT "user_profiles_role_check" CHECK (
        role IN ('customer', 'chinese_staff', 'korean_team', 'admin', 'inspector', 'factory')
    )
);

-- RLS 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_approval_status ON public.user_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);