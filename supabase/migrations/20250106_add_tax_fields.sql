-- 세금계산서 관련 필드 추가
ALTER TABLE "public"."user_profiles"
ADD COLUMN IF NOT EXISTS "tax_company_name" character varying(200),
ADD COLUMN IF NOT EXISTS "tax_registration_number" character varying(50),
ADD COLUMN IF NOT EXISTS "tax_representative" character varying(100),
ADD COLUMN IF NOT EXISTS "tax_address" text,
ADD COLUMN IF NOT EXISTS "tax_business_type" character varying(100),
ADD COLUMN IF NOT EXISTS "tax_business_item" character varying(100),
ADD COLUMN IF NOT EXISTS "tax_email" character varying(100),
ADD COLUMN IF NOT EXISTS "tax_phone" character varying(20),
ADD COLUMN IF NOT EXISTS "tax_fax" character varying(20);

-- 코멘트 추가
COMMENT ON COLUMN "public"."user_profiles"."tax_company_name" IS '세금계산서용 회사명';
COMMENT ON COLUMN "public"."user_profiles"."tax_registration_number" IS '사업자등록번호';
COMMENT ON COLUMN "public"."user_profiles"."tax_representative" IS '대표자명';
COMMENT ON COLUMN "public"."user_profiles"."tax_address" IS '사업장 주소';
COMMENT ON COLUMN "public"."user_profiles"."tax_business_type" IS '업태';
COMMENT ON COLUMN "public"."user_profiles"."tax_business_item" IS '종목';
COMMENT ON COLUMN "public"."user_profiles"."tax_email" IS '세금계산서 수신 이메일';
COMMENT ON COLUMN "public"."user_profiles"."tax_phone" IS '세금계산서용 전화번호';
COMMENT ON COLUMN "public"."user_profiles"."tax_fax" IS '세금계산서용 팩스번호';