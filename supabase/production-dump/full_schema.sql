

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."auto_create_chat_participants"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  customer_name TEXT;
  staff_name TEXT;
  staff_role TEXT;
BEGIN
  -- 고객 정보 조회
  SELECT contact_person INTO customer_name
  FROM public.user_profiles 
  WHERE user_id = NEW.user_id;
  
  -- 고객 참여자 추가
  INSERT INTO public.chat_participants (order_id, user_id, role, display_name)
  VALUES (
    NEW.id,
    NEW.user_id,
    'customer',
    COALESCE(customer_name, 'Customer')
  )
  ON CONFLICT (order_id, user_id) DO NOTHING;
  
  -- 담당 직원이 배정된 경우 추가
  IF NEW.assigned_staff IS NOT NULL THEN
    SELECT contact_person, role INTO staff_name, staff_role
    FROM public.user_profiles 
    WHERE user_id = NEW.assigned_staff;
    
    INSERT INTO public.chat_participants (order_id, user_id, role, display_name)
    VALUES (
      NEW.id,
      NEW.assigned_staff,
      COALESCE(staff_role, 'staff'),
      COALESCE(staff_name, 'Staff')
    )
    ON CONFLICT (order_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 에러 발생해도 오더 생성은 계속 진행
    RAISE WARNING 'Failed to create chat participants for order %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_chat_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_guest_tokens"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public.guest_tokens
  WHERE expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_guest_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_translations"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM ai_translation_cache
  WHERE expires_at < NOW()
  OR (usage_count = 1 AND created_at < NOW() - INTERVAL '7 days');
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_translations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_shipping_address_with_default_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  address_count INTEGER;
BEGIN
  -- 해당 사용자의 기존 배송지 개수 확인 (현재 추가하는 것 제외)
  SELECT COUNT(*) INTO address_count
  FROM user_shipping_addresses
  WHERE user_id = NEW.user_id;
  
  -- 첫 번째 배송지인 경우에만 자동으로 기본 배송지로 설정
  IF address_count = 0 THEN
    NEW.is_default = true;
  ELSIF NEW.is_default = true THEN
    -- 새로 추가하는 배송지를 기본으로 설정하는 경우, 기존 기본 배송지 해제
    UPDATE user_shipping_addresses 
    SET is_default = false, updated_at = NOW()
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_shipping_address_with_default_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_guest_token"("p_order_id" "uuid", "p_role" character varying, "p_guest_name" character varying DEFAULT NULL::character varying, "p_guest_email" character varying DEFAULT NULL::character varying, "p_expires_hours" integer DEFAULT 72) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- 랜덤 토큰 생성
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- 토큰 저장
  INSERT INTO public.guest_tokens (order_id, token, role, guest_name, guest_email, expires_at)
  VALUES (
    p_order_id,
    v_token,
    p_role,
    p_guest_name,
    p_guest_email,
    NOW() + (p_expires_hours || ' hours')::INTERVAL
  );
  
  RETURN v_token;
END;
$$;


ALTER FUNCTION "public"."generate_guest_token"("p_order_id" "uuid", "p_role" character varying, "p_guest_name" character varying, "p_guest_email" character varying, "p_expires_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_part := LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  RETURN 'DL-' || date_part || '-' || seq_part;
END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_reservation_number"("prefix" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result text;
BEGIN
  -- 현재 시간을 기반으로 유니크한 예약번호 생성
  -- 형식: DLSY-20250201-143052-1234 (날짜-시분초-랜덤4자리)
  result := prefix || '-' || 
            to_char(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' ||
            to_char(CURRENT_TIMESTAMP, 'HH24MISS') || '-' ||
            LPAD(floor(random() * 10000)::text, 4, '0');
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_reservation_number"("prefix" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_simple_reservation_number"("service_prefix" "text" DEFAULT 'DLSY'::"text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  date_str TEXT;
  time_str TEXT;
  reservation_num TEXT;
  kst_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 한국 시간(KST UTC+9)으로 변환
  kst_time := CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul';
  
  -- 한국 시간 기준으로 날짜와 시간 문자열 생성
  date_str := to_char(kst_time, 'YYYYMMDD');
  time_str := to_char(kst_time, 'HH24MISS');
  
  -- DLSY-YYYYMMDD-HHMMSS 형식으로 생성 (한국 시간 기준)
  reservation_num := service_prefix || '-' || date_str || '-' || time_str;
  
  RETURN reservation_num;
END;
$$;


ALTER FUNCTION "public"."generate_simple_reservation_number"("service_prefix" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auth_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claim.role', true),
    'anon'
  );
END;
$$;


ALTER FUNCTION "public"."get_auth_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_profile"() RETURNS TABLE("user_id" "uuid", "role" character varying, "company_name" character varying, "contact_person" character varying, "phone" character varying, "provider" character varying, "avatar_url" "text", "full_name" character varying, "approval_status" character varying, "language_preference" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.role,
    up.company_name,
    up.contact_person,
    up.phone,
    up.provider,
    up.avatar_url,
    up.full_name,
    up.approval_status,
    up.language_preference
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_current_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_today_exchange_rate"() RETURNS TABLE("date" "date", "usd_rate" numeric, "cny_rate" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- 오늘 환율 찾기
  RETURN QUERY
  SELECT 
    er.date,
    er.usd_rate,
    er.cny_rate
  FROM exchange_rates er
  WHERE er.date = CURRENT_DATE
  LIMIT 1;
  
  -- 없으면 가장 최근 환율
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      er.date,
      er.usd_rate,
      er.cny_rate
    FROM exchange_rates er
    ORDER BY er.date DESC
    LIMIT 1;
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_today_exchange_rate"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role_cached"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1
$$;


ALTER FUNCTION "public"."get_user_role_cached"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_application"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  chinese_staff_id uuid;
BEGIN
  -- 1. 중국 직원 자동 할당 (user_profiles 테이블만 사용)
  SELECT user_id INTO chinese_staff_id
  FROM user_profiles
  WHERE role = 'chinese_staff'
  ORDER BY (
    SELECT COUNT(*) 
    FROM inspection_applications 
    WHERE assigned_chinese_staff = user_profiles.user_id 
    AND status IN ('submitted', 'quoted', 'paid', 'in_progress')
  ) ASC
  LIMIT 1;

  -- 중국 직원이 있으면 할당
  IF chinese_staff_id IS NOT NULL THEN
    NEW.assigned_chinese_staff := chinese_staff_id;
  END IF;

  -- 2. 알림을 위한 activity_logs 생성
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata,
    created_at
  ) VALUES (
    NEW.user_id,
    'new_' || NEW.service_type || '_application',
    'inspection_applications',
    NEW.id,
    jsonb_build_object(
      'reservation_number', NEW.reservation_number,
      'service_type', NEW.service_type,
      'service_subtype', NEW.service_subtype,
      'product_name', NEW.product_name,
      'assigned_to', chinese_staff_id,
      'needs_attention', true
    ),
    NOW()
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_application"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- OAuth 로그인의 경우 기본 프로필만 생성 (추가 정보는 프로필 설정에서)
  IF NEW.raw_app_meta_data->>'provider' != 'email' THEN
    INSERT INTO public.user_profiles (
      user_id,
      role,
      company_name,
      contact_person,
      phone, -- erro.md: NOT NULL 필드이므로 임시값 설정
      provider,
      provider_id,
      avatar_url,
      full_name,
      approval_status,
      terms_accepted_at,
      privacy_accepted_at,
      language_preference
    ) VALUES (
      NEW.id,
      'customer', -- 고객 로그인은 무조건 고객
      '미입력', -- 임시 회사명
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      '미입력', -- 임시 전화번호 (프로필 설정에서 업데이트 필요)
      NEW.raw_app_meta_data->>'provider',
      NEW.raw_app_meta_data->>'provider_id',
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'full_name',
      'approved',
      NOW(),
      NOW(),
      'ko'
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invoke_translate_function"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  payload jsonb;
BEGIN
  -- 이미 번역된 메시지는 스킵
  IF NEW.translated_message IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Edge Function 호출을 위한 payload 구성
  payload := jsonb_build_object(
    'record', row_to_json(NEW)::jsonb
  );

  -- 비동기 작업을 위해 별도 처리 필요
  -- Supabase는 백그라운드 작업을 위해 pg_background 또는 별도 서비스 사용
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."invoke_translate_function"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_korean_team_cached"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('korean_team', 'admin')
  )
$$;


ALTER FUNCTION "public"."is_korean_team_cached"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff_cached"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('chinese_staff', 'korean_team', 'admin')
  )
$$;


ALTER FUNCTION "public"."is_staff_cached"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_hs_codes"("search_term" "text") RETURNS TABLE("hs_code" character varying, "name_ko" "text", "name_en" "text", "relevance" real)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.hs_code,
    h.name_ko,
    h.name_en,
    CASE
      WHEN h.hs_code = search_term THEN 100
      WHEN h.hs_code LIKE search_term || '%' THEN 90
      WHEN h.name_ko = search_term THEN 85
      WHEN h.name_ko ILIKE '%' || search_term || '%' THEN 70
      WHEN h.name_en ILIKE '%' || search_term || '%' THEN 60
      ELSE 50
    END::REAL as relevance
  FROM hs_codes h
  WHERE 
    h.hs_code LIKE search_term || '%' OR
    h.name_ko ILIKE '%' || search_term || '%' OR
    h.name_en ILIKE '%' || search_term || '%'
  ORDER BY relevance DESC, h.hs_code
  LIMIT 100;
END;
$$;


ALTER FUNCTION "public"."search_hs_codes"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_similar_hs_codes"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) RETURNS TABLE("hs_code" character varying, "name_ko" character varying, "name_en" character varying, "category_name" character varying, "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.hs_code::varchar(20),
    h.name_ko::varchar(500),
    h.name_en::varchar(500),
    h.category_name::varchar(500),
    (1 - (e.embedding <=> query_embedding))::float as similarity
  FROM hs_code_embeddings e
  JOIN hs_codes h ON h.hs_code = e.hs_code
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."search_similar_hs_codes"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_translation_request"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  request_id bigint;
  project_url text;
  service_role_key text;
BEGIN
  -- 이미 번역된 메시지는 스킵
  IF NEW.translated_message IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- 프로젝트 URL과 키 설정 (실제 값으로 변경 필요)
  project_url := 'https://fzpyfzpmwyvqumvftfbr.supabase.co';
  service_role_key := current_setting('app.service_role_key', true);

  -- Edge Function 호출
  SELECT net.http_post(
    url := project_url || '/functions/v1/translate-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  ) INTO request_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."send_translation_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_default_shipping_address"("p_user_id" "uuid", "p_address_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- 해당 사용자의 모든 배송지를 기본이 아닌 것으로 설정
  UPDATE user_shipping_addresses 
  SET is_default = false, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 선택한 배송지를 기본으로 설정
  UPDATE user_shipping_addresses 
  SET is_default = true, updated_at = NOW()
  WHERE id = p_address_id AND user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', '기본 배송지가 설정되었습니다.'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."set_default_shipping_address"("p_user_id" "uuid", "p_address_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_guest_uploaded_by"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- anon 세션에서 uploaded_by가 NULL인 경우 시스템 UUID 설정
  IF NEW.uploaded_by IS NULL AND get_auth_role() = 'anon' THEN
    NEW.uploaded_by := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_guest_uploaded_by"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_chat_translation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Only trigger for new messages without translation
  IF NEW.translated_message IS NULL THEN
    -- Prepare the payload
    payload := jsonb_build_object('record', row_to_json(NEW));
    
    -- Make HTTP request to Edge Function
    SELECT net.http_post(
      url := 'https://fzpyfzpmwyvqumvftfbr.supabase.co/functions/v1/translate-message',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := payload::text
    ) INTO request_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_chat_translation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_chat_participants_on_staff_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  staff_name TEXT;
  staff_role TEXT;
BEGIN
  -- 기존 담당자 제거 (고객은 제외)
  IF OLD.assigned_staff IS NOT NULL AND OLD.assigned_staff != NEW.assigned_staff THEN
    DELETE FROM public.chat_participants
    WHERE order_id = NEW.id
    AND user_id = OLD.assigned_staff
    AND role != 'customer';
  END IF;
  
  -- 새 담당자 추가
  IF NEW.assigned_staff IS NOT NULL AND OLD.assigned_staff != NEW.assigned_staff THEN
    SELECT contact_person, role INTO staff_name, staff_role
    FROM public.user_profiles 
    WHERE user_id = NEW.assigned_staff;
    
    INSERT INTO public.chat_participants (order_id, user_id, role, display_name)
    VALUES (
      NEW.id,
      NEW.assigned_staff,
      COALESCE(staff_role, 'staff'),
      COALESCE(staff_name, 'Staff')
    )
    ON CONFLICT (order_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update chat participants for order %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_chat_participants_on_staff_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_chinese_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- 고정된 중국어 필드값 설정
  -- 서비스 타입별 중국어 표기
  CASE NEW.service_subtype
    WHEN 'market_research' THEN
      NEW.service_subtype_chinese := '市场调研';
    WHEN 'sampling' THEN
      NEW.service_subtype_chinese := '样品采购';
    WHEN 'bulk_order' THEN
      NEW.service_subtype_chinese := '批量采购';
    WHEN 'logistics_support' THEN
      NEW.service_subtype_chinese := '物流支持';
    ELSE
      NEW.service_subtype_chinese := NEW.service_subtype;
  END CASE;

  -- 상태 중국어 표기
  CASE NEW.status
    WHEN 'submitted' THEN
      NEW.status_chinese := '已提交';
    WHEN 'quoted' THEN
      NEW.status_chinese := '已报价';
    WHEN 'paid' THEN
      NEW.status_chinese := '已付款';
    WHEN 'in_progress' THEN
      NEW.status_chinese := '进行中';
    WHEN 'completed' THEN
      NEW.status_chinese := '已完成';
    WHEN 'cancelled' THEN
      NEW.status_chinese := '已取消';
    ELSE
      NEW.status_chinese := NEW.status;
  END CASE;

  -- 기본 중국어 텍스트 설정 (실제 번역이 필요한 경우 나중에 Edge Function으로 처리)
  IF NEW.product_name_translated IS NULL THEN
    NEW.product_name_translated := NEW.product_name; -- 임시로 같은 값
  END IF;

  IF NEW.special_requirements_translated IS NULL THEN
    NEW.special_requirements_translated := NEW.special_requirements; -- 임시로 같은 값
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_chinese_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sampling_orders_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sampling_orders_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile_from_sampling"("p_user_id" "uuid", "p_shipping_method" "text", "p_customs_type" "text" DEFAULT NULL::"text", "p_business_name" "text" DEFAULT NULL::"text", "p_business_number" "text" DEFAULT NULL::"text", "p_korea_shipping_address" "text" DEFAULT NULL::"text", "p_korea_receiver_name" "text" DEFAULT NULL::"text", "p_korea_receiver_phone" "text" DEFAULT NULL::"text", "p_personal_name" "text" DEFAULT NULL::"text", "p_personal_customs_code" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_result JSON;
BEGIN
  -- 협력업체 배송인 경우에만 프로필 업데이트
  IF p_shipping_method = '협력업체' THEN
    UPDATE user_profiles 
    SET 
      customs_type = COALESCE(p_customs_type, customs_type),
      company_name = CASE 
        WHEN p_business_name IS NOT NULL AND p_customs_type = '사업자통관' 
        THEN p_business_name 
        ELSE company_name 
      END,
      business_number = COALESCE(p_business_number, business_number),
      default_shipping_address = COALESCE(p_korea_shipping_address, default_shipping_address),
      default_receiver_name = COALESCE(p_korea_receiver_name, default_receiver_name),
      default_receiver_phone = COALESCE(p_korea_receiver_phone, default_receiver_phone),
      contact_person = CASE 
        WHEN p_personal_name IS NOT NULL AND p_customs_type = '개인통관' 
        THEN p_personal_name 
        ELSE contact_person 
      END,
      personal_customs_code = COALESCE(p_personal_customs_code, personal_customs_code),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- 업데이트된 프로필 정보 반환
    SELECT json_build_object(
      'success', true,
      'message', '프로필이 성공적으로 업데이트되었습니다.',
      'updated_fields', json_build_object(
        'customs_type', p_customs_type,
        'shipping_address', p_korea_shipping_address,
        'receiver_name', p_korea_receiver_name,
        'receiver_phone', p_korea_receiver_phone
      )
    ) INTO v_result;
  ELSE
    -- 직접배송인 경우 업데이트 안함
    SELECT json_build_object(
      'success', true,
      'message', '직접배송으로 프로필 업데이트를 건너뜁니다.'
    ) INTO v_result;
  END IF;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."update_user_profile_from_sampling"("p_user_id" "uuid", "p_shipping_method" "text", "p_customs_type" "text", "p_business_name" "text", "p_business_number" "text", "p_korea_shipping_address" "text", "p_korea_receiver_name" "text", "p_korea_receiver_phone" "text", "p_personal_name" "text", "p_personal_customs_code" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" character varying(50) NOT NULL,
    "entity_type" character varying(50),
    "entity_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_translation_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "original_text" "text" NOT NULL,
    "original_language" character varying(2) NOT NULL,
    "text_hash" character varying(64) NOT NULL,
    "translated_text" "text" NOT NULL,
    "target_language" character varying(2) NOT NULL,
    "model_name" character varying(50) NOT NULL,
    "model_version" character varying(20),
    "prompt_template" "text",
    "confidence_score" numeric(3,2),
    "usage_count" integer DEFAULT 1,
    "last_used_at" timestamp with time zone DEFAULT "now"(),
    "context_type" character varying(50),
    "domain" character varying(50),
    "tokens_used" integer,
    "cost_usd" numeric(6,4),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval),
    CONSTRAINT "ai_translation_cache_original_language_check" CHECK ((("original_language")::"text" = ANY ((ARRAY['ko'::character varying, 'zh'::character varying, 'en'::character varying])::"text"[]))),
    CONSTRAINT "ai_translation_cache_target_language_check" CHECK ((("target_language")::"text" = ANY ((ARRAY['ko'::character varying, 'zh'::character varying, 'en'::character varying])::"text"[])))
);


ALTER TABLE "public"."ai_translation_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bulk_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_person" "text" NOT NULL,
    "contact_phone" "text" NOT NULL,
    "contact_email" "text",
    "market_research_id" "uuid",
    "order_items" "jsonb" NOT NULL,
    "delivery_date" "date",
    "delivery_address" "text",
    "delivery_method" "text",
    "packing_requirements" "text",
    "quality_standards" "text",
    "additional_requests" "text",
    "reference_files" "jsonb",
    "quantity_change_confirm" boolean,
    "price_adjustment" numeric,
    "adjustment_reason" "text",
    "revised_unit_price" numeric,
    "total_amount" numeric,
    "delivery_period" "text",
    "quotation_file" "text",
    "purchase_order_file" "text",
    "factory_confirmation" "text",
    "production_schedule" "text",
    "production_progress" numeric,
    "production_photos" "jsonb",
    "quality_inspection_report" "text",
    "expected_completion_date" "date",
    "packing_status" "text",
    "bl_document" "text",
    "invoice_document" "text",
    "packing_list_document" "text",
    "customs_status" "text",
    "estimated_arrival_date" "date",
    "delivery_receipt" "text",
    "down_payment" "jsonb",
    "middle_payment" "jsonb",
    "final_payment" "jsonb",
    "tax_invoices" "jsonb",
    "assigned_staff_id" "uuid",
    "status" "text" DEFAULT 'submitted'::"text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bulk_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "sender_name" character varying(50) NOT NULL,
    "sender_role" character varying(20) NOT NULL,
    "original_message" "text" NOT NULL,
    "original_language" character varying(2) NOT NULL,
    "translated_message" "text",
    "translated_language" character varying(2),
    "message_type" character varying(20) DEFAULT 'text'::character varying,
    "file_url" "text",
    "file_name" character varying(255),
    "file_size" bigint,
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "edited_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reservation_number" character varying(255) NOT NULL,
    "service_type" character varying(50),
    CONSTRAINT "chat_messages_message_type_check" CHECK ((("message_type")::"text" = ANY ((ARRAY['text'::character varying, 'file'::character varying, 'image'::character varying, 'video'::character varying, 'system'::character varying])::"text"[]))),
    CONSTRAINT "chat_messages_original_language_check" CHECK ((("original_language")::"text" = ANY ((ARRAY['ko'::character varying, 'zh'::character varying])::"text"[]))),
    CONSTRAINT "chat_messages_translated_language_check" CHECK ((("translated_language")::"text" = ANY ((ARRAY['ko'::character varying, 'zh'::character varying])::"text"[])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) NOT NULL,
    "display_name" character varying(50),
    "is_online" boolean DEFAULT false,
    "last_seen" timestamp with time zone DEFAULT "now"(),
    "typing" boolean DEFAULT false,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "left_at" timestamp with time zone,
    "reservation_number" character varying(255) NOT NULL
);


ALTER TABLE "public"."chat_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."china_business_trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "service_sub_type" character varying(30) NOT NULL,
    "inspection_days" integer,
    "qc_standard" "text",
    "factory_name" character varying(100) NOT NULL,
    "factory_contact" character varying(50),
    "factory_phone" character varying(30),
    "factory_address" "text" NOT NULL,
    "product_name" character varying(200) NOT NULL,
    "product_name_chinese" character varying(200),
    "specification" "text",
    "quantity" integer,
    "desired_date" "date",
    "confirmed_date" "date",
    "actual_start_date" "date",
    "actual_end_date" "date",
    "inspection_request" "text" NOT NULL,
    "inspection_request_cn" "text",
    "request_files" "jsonb" DEFAULT '[]'::"jsonb",
    "china_expenses_rmb" numeric(10,2),
    "china_expenses_request" numeric(12,2),
    "daily_rate" numeric(10,2),
    "inspection_files" "jsonb" DEFAULT '[]'::"jsonb",
    "inspection_report" "text",
    "quotation_number" character varying(50),
    "unit_price" numeric(10,2),
    "supply_amount" numeric(12,2),
    "tax_amount" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "china_business_trips_service_sub_type_check" CHECK ((("service_sub_type")::"text" = ANY ((ARRAY['검품(생산 후)'::character varying, '공장감사'::character varying, '선적검품'::character varying])::"text"[])))
);


ALTER TABLE "public"."china_business_trips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" character varying(255) NOT NULL,
    "company_name_chinese" character varying(255),
    "contact_person" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(255),
    "address" "text",
    "address_detail" "text",
    "postal_code" character varying(20),
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."company_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."confirmation_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" character varying(50) NOT NULL,
    "request_type" character varying(50) NOT NULL,
    "title" character varying(200) NOT NULL,
    "description" "text" NOT NULL,
    "options" "jsonb",
    "attachments" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "customer_response" character varying(20),
    "customer_comment" "text",
    "selected_option_id" character varying(100),
    "responded_at" timestamp with time zone,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "is_urgent" boolean DEFAULT false,
    "deadline" timestamp with time zone,
    "parent_request_id" "uuid",
    "related_order_type" character varying(50)
);


ALTER TABLE "public"."confirmation_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "company_name" character varying(200),
    "phone" character varying(50) NOT NULL,
    "email" character varying(200) NOT NULL,
    "inquiry_type" character varying(50) NOT NULL,
    "message" "text" NOT NULL,
    "files" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "assigned_to" "uuid",
    "notes" "text",
    "resolved_at" timestamp with time zone
);


ALTER TABLE "public"."contact_inquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inquiry_number" integer NOT NULL,
    "inquiry_channel" character varying(20),
    "customer_id" "uuid",
    "customer_name" character varying(50),
    "customer_email" character varying(100),
    "customer_phone" character varying(30),
    "inquiry_content" "text" NOT NULL,
    "inquiry_files" "jsonb" DEFAULT '[]'::"jsonb",
    "assigned_to" "uuid",
    "response_content" "text",
    "response_files" "jsonb" DEFAULT '[]'::"jsonb",
    "status" character varying(20) DEFAULT '대기'::character varying,
    "inquiry_date" timestamp with time zone DEFAULT "now"(),
    "response_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "customer_inquiries_inquiry_channel_check" CHECK ((("inquiry_channel")::"text" = ANY ((ARRAY['전화'::character varying, '이메일'::character varying, '웹'::character varying])::"text"[]))),
    CONSTRAINT "customer_inquiries_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['대기'::character varying, '처리중'::character varying, '완료'::character varying])::"text"[])))
);


ALTER TABLE "public"."customer_inquiries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."customer_inquiries_inquiry_number_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."customer_inquiries_inquiry_number_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."customer_inquiries_inquiry_number_seq" OWNED BY "public"."customer_inquiries"."inquiry_number";



CREATE TABLE IF NOT EXISTS "public"."exchange_rates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "usd_rate" numeric(10,2) NOT NULL,
    "cny_rate" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "applied_usd_rate" numeric(10,2) GENERATED ALWAYS AS ("round"(("usd_rate" * 1.05), 0)) STORED,
    "applied_cny_rate" numeric(10,2) GENERATED ALWAYS AS ("round"(("cny_rate" * 1.05), 0)) STORED,
    "usd_margin" numeric(10,2) GENERATED ALWAYS AS (("round"(("usd_rate" * 1.05), 0) - "usd_rate")) STORED,
    "cny_margin" numeric(10,2) GENERATED ALWAYS AS (("round"(("cny_rate" * 1.05), 0) - "cny_rate")) STORED
);


ALTER TABLE "public"."exchange_rates" OWNER TO "postgres";


COMMENT ON COLUMN "public"."exchange_rates"."applied_usd_rate" IS '실제 적용 USD 환율 (5% 마진 포함)';



COMMENT ON COLUMN "public"."exchange_rates"."applied_cny_rate" IS '실제 적용 CNY 환율 (5% 마진 포함)';



COMMENT ON COLUMN "public"."exchange_rates"."usd_margin" IS 'USD 마진 (원)';



COMMENT ON COLUMN "public"."exchange_rates"."cny_margin" IS 'CNY 마진 (원)';



CREATE TABLE IF NOT EXISTS "public"."factory_contact_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" character varying(50) NOT NULL,
    "user_id" "uuid",
    "company_name" character varying(200) NOT NULL,
    "contact_person" character varying(100) NOT NULL,
    "contact_phone" character varying(50) NOT NULL,
    "contact_email" character varying(200) NOT NULL,
    "product_name" character varying(500) NOT NULL,
    "product_description" "text",
    "request_type" "jsonb",
    "special_requirements" "text",
    "files" "jsonb",
    "status" character varying(50) DEFAULT 'submitted'::character varying,
    "assigned_chinese_staff" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "factory_contact_person" character varying(255),
    "factory_contact_phone" character varying(255),
    "factory_name" character varying(255),
    "factory_address" "text",
    "payment_status" character varying(50) DEFAULT NULL::character varying
);


ALTER TABLE "public"."factory_contact_requests" OWNER TO "postgres";


COMMENT ON COLUMN "public"."factory_contact_requests"."payment_status" IS '결제 상태: pending(대기), paid(완료), cancelled(취소), refunded(환불)';



CREATE TABLE IF NOT EXISTS "public"."faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" character varying(50) DEFAULT '서비스신청'::character varying,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "helpful_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guest_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "token" character varying(255) NOT NULL,
    "role" character varying(20) NOT NULL,
    "guest_name" character varying(50),
    "guest_email" character varying(100),
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "guest_tokens_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['inspector'::character varying, 'factory'::character varying])::"text"[])))
);


ALTER TABLE "public"."guest_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hs_code_aliases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alias" "text" NOT NULL,
    "canonical_name" "text" NOT NULL,
    "hs_code" character varying(10) NOT NULL,
    "category" "text",
    "priority" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hs_code_aliases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hs_codes" (
    "id" bigint NOT NULL,
    "hs_code" character varying(20) NOT NULL,
    "hs_code_10" character varying(10) GENERATED ALWAYS AS ("left"(("hs_code")::"text", 10)) STORED,
    "hs_code_6" character varying(6) GENERATED ALWAYS AS ("left"(("hs_code")::"text", 6)) STORED,
    "hs_code_4" character varying(4) GENERATED ALWAYS AS ("left"(("hs_code")::"text", 4)) STORED,
    "start_date" character varying(20),
    "end_date" character varying(20),
    "name_ko" "text",
    "name_en" "text",
    "quantity_unit" character varying(10),
    "weight_unit" character varying(10),
    "export_code" character varying(20),
    "import_code" character varying(20),
    "spec_name" "text",
    "category_code" character varying(20),
    "category_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "required_spec_name" "text",
    "reference_spec_name" "text",
    "spec_description" "text",
    "spec_details" "text",
    "hs_description" "text",
    "korean_trade_classification" "text",
    "quantity_unit_max_price" numeric(20,2),
    "weight_unit_max_price" numeric(20,2)
);


ALTER TABLE "public"."hs_codes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."hs_codes"."hs_description" IS 'HS부호 상세 내용 설명';



COMMENT ON COLUMN "public"."hs_codes"."korean_trade_classification" IS '한국표준무역분류명';



COMMENT ON COLUMN "public"."hs_codes"."quantity_unit_max_price" IS '수량단위 최대단가';



COMMENT ON COLUMN "public"."hs_codes"."weight_unit_max_price" IS '중량단위 최대단가';



CREATE TABLE IF NOT EXISTS "public"."hs_codes_hierarchy" (
    "id" integer NOT NULL,
    "hs_code" character varying(10) NOT NULL,
    "level" integer NOT NULL,
    "parent_code" character varying(10),
    "name_ko" "text" NOT NULL,
    "name_en" "text",
    "description" "text",
    "common_aliases" "text"[],
    "search_keywords" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hs_codes_hierarchy_level_check" CHECK ((("level" >= 1) AND ("level" <= 10)))
);


ALTER TABLE "public"."hs_codes_hierarchy" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."hs_codes_hierarchy_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."hs_codes_hierarchy_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."hs_codes_hierarchy_id_seq" OWNED BY "public"."hs_codes_hierarchy"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."hs_codes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."hs_codes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."hs_codes_id_seq" OWNED BY "public"."hs_codes"."id";



CREATE TABLE IF NOT EXISTS "public"."hs_search_logs" (
    "id" integer NOT NULL,
    "search_term" "text" NOT NULL,
    "selected_hs_code" character varying(10),
    "user_id" "uuid",
    "ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."hs_search_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."hs_search_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."hs_search_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."hs_search_logs_id_seq" OWNED BY "public"."hs_search_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."inspection_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_person" "text" NOT NULL,
    "contact_phone" "text" NOT NULL,
    "contact_email" "text",
    "service_type" "text" NOT NULL,
    "service_subtype" "text",
    "product_name" "text" NOT NULL,
    "product_name_translated" "text",
    "production_quantity" integer DEFAULT 0,
    "moq_check" boolean DEFAULT false,
    "special_requirements" "text",
    "special_requirements_translated" "text",
    "logo_required" boolean DEFAULT false,
    "logo_details" "text",
    "custom_box_required" boolean DEFAULT false,
    "box_details" "text",
    "status" "text" DEFAULT 'submitted'::"text",
    "payment_status" "text",
    "assigned_chinese_staff" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "service_subtype_chinese" "text",
    "status_chinese" "text",
    "detail_page" "text",
    "detail_page_cn" "text",
    "research_type" "text" DEFAULT '제품 조사'::"text",
    "inspection_method" "text",
    "factory_name" "text",
    "factory_contact" "text",
    "factory_phone" "text",
    "factory_address" "text",
    "schedule_type" "text",
    "confirmed_date" "date",
    "inspection_days" integer,
    "schedule_availability" "text",
    "available_dates" "jsonb",
    "confirm_reservation" boolean DEFAULT false,
    "inspection_report" "text",
    "inspection_summary" "text",
    "inspection_photos" "jsonb",
    "pass_fail_status" "text",
    "improvement_items" "jsonb",
    "total_cost" numeric,
    "vat_amount" numeric,
    "quotation_pdf" "text",
    "tax_invoice_pdf" "text",
    CONSTRAINT "inspection_applications_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'refunded'::"text"]))),
    CONSTRAINT "inspection_applications_service_type_check" CHECK (("service_type" = ANY (ARRAY['quality_inspection'::"text", 'factory_audit'::"text", 'loading_inspection'::"text", 'import_agency'::"text"]))),
    CONSTRAINT "inspection_applications_status_check" CHECK (("status" = ANY (ARRAY['submitted'::"text", 'quoted'::"text", 'paid'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."inspection_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inspection_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "original_filename" character varying(255) NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "report_type" character varying(50),
    "status" character varying(30) DEFAULT 'uploaded'::character varying,
    "uploaded_by" "uuid" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "translated_content" "jsonb",
    "ai_analysis" "jsonb",
    "translation_completed_at" timestamp with time zone,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "report_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inspection_reports_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['uploaded'::character varying, 'processing'::character varying, 'completed'::character varying, 'approved'::character varying])::"text"[])))
);


ALTER TABLE "public"."inspection_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_research_costs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "commission_rate" numeric,
    "commission_amount" numeric,
    "first_detail_cost" numeric,
    "shipping_method" "text",
    "china_shipping_cost" numeric,
    "fcl_freight" numeric,
    "china_unit_price" numeric,
    "exchange_rate" numeric,
    "exw_total" numeric,
    "first_payment" numeric,
    "tariff" numeric,
    "vat" numeric,
    "second_payment_estimate" numeric,
    "total_supply_price" numeric,
    "unit_price" numeric,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "market_research_costs_shipping_method_check" CHECK (("shipping_method" = ANY (ARRAY['LCL'::"text", 'FCL'::"text"])))
);


ALTER TABLE "public"."market_research_costs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_research_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "product_code" "text",
    "research_photos" "jsonb",
    "quoted_quantity" integer,
    "work_period" "text",
    "other_matters_kr" "text",
    "box_length" numeric,
    "box_width" numeric,
    "box_height" numeric,
    "units_per_box" integer,
    "total_boxes" integer,
    "total_cbm" numeric,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."market_research_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_research_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" character varying(50) NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" character varying(200) NOT NULL,
    "contact_person" character varying(100) NOT NULL,
    "contact_phone" character varying(30) NOT NULL,
    "contact_email" character varying(100) NOT NULL,
    "product_name" character varying(200) NOT NULL,
    "research_quantity" integer NOT NULL,
    "requirements" "text" NOT NULL,
    "detail_page" "text",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "logo_required" boolean DEFAULT false,
    "logo_file" "jsonb",
    "logo_print_details" "text",
    "custom_box_required" boolean DEFAULT false,
    "box_design_file" "jsonb",
    "status" character varying(30) DEFAULT 'submitted'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "research_photos" "jsonb" DEFAULT '[]'::"jsonb",
    "moq_quantity" integer,
    "production_duration" character varying(255),
    "product_options" "text",
    "product_colors" "text",
    "product_dimensions" "text",
    "product_materials" "text",
    "product_functions" "text",
    "product_specifications" "text",
    "product_composition" "text",
    "additional_notes" "text",
    "product_width_cm" numeric(10,2),
    "product_length_cm" numeric(10,2),
    "product_height_cm" numeric(10,2),
    "box_width_cm" numeric(10,2),
    "box_length_cm" numeric(10,2),
    "box_height_cm" numeric(10,2),
    "units_per_box" integer,
    "total_box_count" integer,
    "cbm_volume" numeric(10,4),
    "sample_availability" boolean DEFAULT false,
    "sample_unit_price" numeric(10,2),
    "sample_order_quantity" integer,
    "sample_weight_kg" numeric(10,3),
    "sample_quantity" integer,
    "sample_total_price" numeric(10,2),
    "sample_delivery_time" character varying(255),
    "shipping_cost_note" "text" DEFAULT '별도 착불 (특송업체 이용, 원하는 배대지 있으면 정보 기록)'::"text",
    "shipping_method" character varying(100),
    "estimated_shipping_cost" numeric(10,2),
    "hs_code" character varying(50),
    "required_certifications" "text",
    "certification_cost" numeric(10,2),
    "commission_rate" numeric(5,2),
    "commission_amount" numeric(10,2),
    "shipping_cost" numeric(10,2),
    "first_payment_details" "text",
    "china_unit_price" numeric(10,2),
    "exchange_rate" numeric(10,4),
    "exw_total" numeric(10,2),
    "china_shipping_cost" numeric(10,2),
    "first_payment_amount" numeric(10,2),
    "second_payment_estimate" numeric(10,2),
    "second_payment_note" "text" DEFAULT '포워더 및 관세사 있는 경우 별도 비용 요청'::"text",
    "estimated_unit_price" numeric(10,2),
    "estimated_total_supply" numeric(10,2),
    "estimated_tax" numeric(10,2),
    "estimated_total_amount" numeric(10,2),
    "assigned_staff" "uuid",
    "payment_status" character varying(50) DEFAULT NULL::character varying,
    "research_completed_at" timestamp with time zone,
    "quote_amount" numeric(10,2) DEFAULT 55000,
    "quote_sent_at" timestamp with time zone,
    "product_name_chinese" "text",
    "moq_check" boolean DEFAULT false,
    "logo_details" "text",
    "box_details" "text",
    "product_url" "text",
    "reference_files" "jsonb",
    "service_type" character varying DEFAULT 'import_agency'::character varying,
    "service_subtype" character varying DEFAULT 'market_research'::character varying,
    CONSTRAINT "check_payment_status" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying])::"text"[]))),
    CONSTRAINT "check_status" CHECK ((("status")::"text" = ANY ((ARRAY['submitted'::character varying, 'payment_pending'::character varying, 'research_in_progress'::character varying, 'research_completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."market_research_requests" OWNER TO "postgres";


COMMENT ON COLUMN "public"."market_research_requests"."logo_required" IS '로고 인쇄 필요 여부';



COMMENT ON COLUMN "public"."market_research_requests"."custom_box_required" IS '맞춤 박스 제작 필요 여부';



COMMENT ON COLUMN "public"."market_research_requests"."moq_check" IS 'MOQ(최소주문수량) 확인 요청 여부';



COMMENT ON COLUMN "public"."market_research_requests"."logo_details" IS '로고 인쇄 상세 정보';



COMMENT ON COLUMN "public"."market_research_requests"."box_details" IS '맞춤 박스 상세 정보';



COMMENT ON COLUMN "public"."market_research_requests"."product_url" IS '제품 참고 URL';



COMMENT ON COLUMN "public"."market_research_requests"."reference_files" IS '참고 파일 JSON 배열';



CREATE TABLE IF NOT EXISTS "public"."market_research_samples" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "sample_available" boolean DEFAULT false,
    "sample_unit_price" numeric,
    "sample_order_qty" integer,
    "sample_weight" numeric,
    "sample_make_time" "text",
    "sample_price" numeric,
    "hs_code" "text",
    "certification_required" boolean DEFAULT false,
    "cert_cost" numeric,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."market_research_samples" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_research_suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "supplier_name" "text",
    "contact_phone" "text",
    "contact_person" "text",
    "company_scale" "text",
    "registered_capital" "text",
    "registered_address" "text",
    "industry_kr" "text",
    "company_status" "text",
    "legal_type_kr" "text",
    "company_size_kr" "text",
    "established_date" "date",
    "business_scope_kr" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."market_research_suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "category" character varying(50) DEFAULT '공지'::character varying,
    "is_important" boolean DEFAULT false,
    "is_visible" boolean DEFAULT true,
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."notices" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" character varying(20) NOT NULL,
    "service_type" character varying(30) NOT NULL,
    "user_id" "uuid" NOT NULL,
    "customer_number" character varying(20),
    "status" character varying(50) DEFAULT 'submitted'::character varying NOT NULL,
    "assigned_staff" "uuid",
    "duly_manager" character varying(50),
    "total_amount" numeric(12,2),
    "margin_amount" numeric(12,2),
    "margin_percentage" numeric(5,2),
    "payment_status" character varying(20),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "orders_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'partial'::character varying, 'refunded'::character varying])::"text"[]))),
    CONSTRAINT "orders_service_type_check" CHECK ((("service_type")::"text" = ANY ((ARRAY['quality_inspection'::character varying, 'factory_audit'::character varying, 'loading_inspection'::character varying, 'market_research'::character varying, 'import_shipping'::character varying, 'purchasing_agency'::character varying, 'shipping_agency'::character varying])::"text"[]))),
    CONSTRAINT "orders_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['submitted'::character varying, 'under_review'::character varying, 'approved'::character varying, 'rejected'::character varying, 'researching'::character varying, 'quote_preparation'::character varying, 'quote_sent'::character varying, 'payment_pending'::character varying, 'payment_confirmed'::character varying, 'schedule_coordination'::character varying, 'in_progress'::character varying, 'report_writing'::character varying, 'final_review'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'on_hold'::character varying])::"text"[])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "calculation_number" character varying(30),
    "user_id" "uuid",
    "product_name" character varying(200) NOT NULL,
    "unit_price_rmb" numeric(10,2) NOT NULL,
    "quantity" integer NOT NULL,
    "cbm" numeric(10,3),
    "trade_terms" character varying(10),
    "export_port" character varying(50),
    "exw_total" numeric(12,2),
    "fob_total" numeric(12,2),
    "commission" numeric(10,2),
    "exchange_applied" numeric(8,4),
    "tariff" numeric(10,2),
    "customs_clearance" numeric(10,2),
    "ddp_lcl" numeric(12,2),
    "ddp_fcl" numeric(12,2),
    "unit_price_ddp" numeric(10,2),
    "first_payment_amount" numeric(12,2),
    "second_payment_estimate" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "price_calculations_trade_terms_check" CHECK ((("trade_terms")::"text" = ANY ((ARRAY['FOB'::character varying, 'DDP'::character varying, 'EXW'::character varying])::"text"[])))
);


ALTER TABLE "public"."price_calculations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."process_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "step_number" integer NOT NULL,
    "processor" character varying(100) NOT NULL,
    "process_node" "text" NOT NULL,
    "process_result" "text",
    "process_feedback" "text",
    "log_type" character varying(20),
    "is_internal" boolean DEFAULT false,
    "internal_process" character varying(50),
    "process_time" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    CONSTRAINT "process_logs_internal_process_check" CHECK ((("internal_process")::"text" = ANY ((ARRAY['AUTO_MEMBER_REGISTRATION'::character varying, 'ORDER_NUMBER_GENERATION'::character varying, 'AUTO_TRANSLATION'::character varying, 'PRICE_CALCULATION'::character varying, 'NOTIFICATION_SENT'::character varying, 'DATA_VALIDATION'::character varying, 'FILE_PROCESSING'::character varying, 'BACKUP_CREATED'::character varying, 'API_CALL'::character varying, 'WEBHOOK_RECEIVED'::character varying, 'SYNC_COMPLETED'::character varying])::"text"[]))),
    CONSTRAINT "process_logs_log_type_check" CHECK ((("log_type")::"text" = ANY ((ARRAY['system'::character varying, 'manual'::character varying, 'auto'::character varying])::"text"[])))
);


ALTER TABLE "public"."process_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchase_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchasing_order_id" "uuid" NOT NULL,
    "product_link" "text",
    "product_name" character varying(200) NOT NULL,
    "options" "text",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(12,2) NOT NULL,
    "purchase_status" character varying(30) DEFAULT 'pending'::character varying,
    "tracking_number" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."purchase_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchasing_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "warehouse_number" character varying(50),
    "warehouse_location" character varying(100),
    "purchase_type" character varying(20),
    "exchange_rate" numeric(8,4) NOT NULL,
    "total_product_cost" numeric(12,2) NOT NULL,
    "domestic_shipping" numeric(10,2),
    "commission_rate" numeric(5,2),
    "commission_amount" numeric(10,2),
    "shipping_address" "text" NOT NULL,
    "receiver_name" character varying(50) NOT NULL,
    "receiver_phone" character varying(30) NOT NULL,
    "postal_code" character varying(10),
    "customs_name" character varying(100) NOT NULL,
    "customs_docs" "jsonb" DEFAULT '[]'::"jsonb",
    "customs_clearance_status" character varying(30),
    "marking_number" character varying(50),
    "additional_requests" "text",
    "purchase_status" character varying(30) DEFAULT 'pending'::character varying,
    "purchased_at" timestamp with time zone,
    "shipped_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchasing_orders_purchase_type_check" CHECK ((("purchase_type")::"text" = ANY ((ARRAY['B2B'::character varying, '단일상품'::character varying])::"text"[])))
);


ALTER TABLE "public"."purchasing_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sample_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sample_order_id" "uuid" NOT NULL,
    "product_name" character varying(200) NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "weight_kg" numeric(8,3),
    "specifications" "text",
    "quality_rating" integer,
    "evaluation_notes" "text",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sample_items_quality_rating_check" CHECK ((("quality_rating" >= 1) AND ("quality_rating" <= 5)))
);


ALTER TABLE "public"."sample_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sample_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "research_id" "uuid",
    "supplier_name" character varying(200),
    "supplier_contact" character varying(50),
    "supplier_phone" character varying(30),
    "sample_making_cost" numeric(10,2),
    "total_sample_cost" numeric(12,2),
    "shipping_cost" numeric(10,2),
    "shipping_method" character varying(10),
    "sample_receive_address" "text",
    "receiver_name" character varying(50),
    "receiver_phone" character varying(30),
    "factory_sample_invoice" character varying(100),
    "factory_delivery_tracking" character varying(100),
    "gz_sample_invoice_number" character varying(100),
    "gz_delivery_tracking" character varying(100),
    "international_tracking" character varying(100),
    "sample_status" character varying(30) DEFAULT 'ordered'::character varying,
    "received_at" timestamp with time zone,
    "evaluation_result" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "customs_clearance_type" "text",
    "customs_clearance_number" "text",
    "sample_items" "jsonb",
    "sample_weight" "jsonb",
    "sample_photos" "jsonb",
    "requirements" "text",
    "reference_files" "jsonb",
    "customs_duty" numeric,
    "exchange_rate" numeric,
    "total_krw" numeric,
    "received_date" "date",
    "received_confirm" boolean DEFAULT false,
    "quality_rating" integer,
    "feedback_comments" "text",
    "improvement_request" "text",
    "bulk_order_interest" boolean DEFAULT false,
    "additional_sample_request" boolean DEFAULT false,
    CONSTRAINT "sample_orders_quality_rating_check" CHECK ((("quality_rating" >= 1) AND ("quality_rating" <= 5))),
    CONSTRAINT "sample_orders_shipping_method_check" CHECK ((("shipping_method")::"text" = ANY ((ARRAY['해운'::character varying, '항공'::character varying])::"text"[])))
);


ALTER TABLE "public"."sample_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sampling_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reservation_number" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "market_research_id" "uuid" NOT NULL,
    "product_name" "text" NOT NULL,
    "product_name_chinese" "text",
    "sample_quantity" integer NOT NULL,
    "requirements" "text",
    "request_files" "jsonb" DEFAULT '[]'::"jsonb",
    "shipping_method" "text" NOT NULL,
    "customs_type" "text",
    "personal_name" "text",
    "personal_customs_code" "text",
    "business_name" "text",
    "business_number" "text",
    "korea_shipping_address" "text",
    "korea_receiver_name" "text",
    "korea_receiver_phone" "text",
    "china_address" "text",
    "china_receiver_name" "text",
    "china_receiver_phone" "text",
    "status" "text" DEFAULT '결제대기'::"text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "tracking_number" "text",
    "sample_cost" numeric(10,2),
    "service_fee" numeric(10,2),
    "total_amount" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "paid_at" timestamp with time zone,
    "shipped_at" timestamp with time zone,
    "subtotal" numeric(12,2),
    "vat" numeric(12,2),
    CONSTRAINT "sampling_orders_customs_type_check" CHECK (("customs_type" = ANY (ARRAY['개인통관'::"text", '사업자통관'::"text"]))),
    CONSTRAINT "sampling_orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'refunded'::"text"]))),
    CONSTRAINT "sampling_orders_shipping_method_check" CHECK (("shipping_method" = ANY (ARRAY['협력업체'::"text", '직접배송'::"text"]))),
    CONSTRAINT "sampling_orders_status_check" CHECK (("status" = ANY (ARRAY['결제대기'::"text", '공장 출고중'::"text", '발송완료'::"text"])))
);


ALTER TABLE "public"."sampling_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."search_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "search_query" "text" NOT NULL,
    "results" "jsonb" NOT NULL,
    "hit_count" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval)
);


ALTER TABLE "public"."search_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."search_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "search_query" "text" NOT NULL,
    "search_query_normalized" "text",
    "selected_hs_code" character varying(10),
    "selected_name_ko" "text",
    "embedding" "extensions"."vector"(1536),
    "usage_count" integer DEFAULT 1,
    "confidence_score" double precision DEFAULT 1.0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."search_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_name" character varying(100),
    "shipping_address" "text" NOT NULL,
    "receiver_name" character varying(100) NOT NULL,
    "receiver_phone" character varying(50) NOT NULL,
    "customs_clearance_type" character varying(20) NOT NULL,
    "customs_clearance_number" character varying(50) NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shipping_addresses_customs_clearance_type_check" CHECK ((("customs_clearance_type")::"text" = ANY ((ARRAY['personal'::character varying, 'business'::character varying])::"text"[])))
);


ALTER TABLE "public"."shipping_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_agency_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "customer_code" character varying(20) NOT NULL,
    "shipping_number" character varying(50),
    "customs_number" character varying(50),
    "expected_packages" integer NOT NULL,
    "received_packages" integer DEFAULT 0,
    "storage_location" character varying(50),
    "storage_start_date" "date",
    "storage_end_date" "date",
    "consolidated_boxes" integer,
    "consolidation_request" boolean DEFAULT false,
    "consolidation_date" "date",
    "shipping_status" character varying(30) DEFAULT '대기'::character varying,
    "delivery_memo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shipping_agency_orders_shipping_status_check" CHECK ((("shipping_status")::"text" = ANY ((ARRAY['대기'::character varying, '입고'::character varying, '포장'::character varying, '출고'::character varying, '배송중'::character varying, '완료'::character varying])::"text"[])))
);


ALTER TABLE "public"."shipping_agency_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shipping_order_id" "uuid" NOT NULL,
    "product_name" character varying(200) NOT NULL,
    "quantity" integer NOT NULL,
    "weight_kg" numeric(8,3),
    "dimensions" character varying(50),
    "tracking_number" character varying(100),
    "received_at" timestamp with time zone,
    "package_condition" character varying(30),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."shipping_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tariff_cache" (
    "hs_code" character varying(10) NOT NULL,
    "country_code" character varying(2) DEFAULT 'KR'::character varying NOT NULL,
    "tariff_data" "jsonb" NOT NULL,
    "cached_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval)
);


ALTER TABLE "public"."tariff_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."uploaded_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "uploaded_by" "uuid" NOT NULL,
    "original_filename" character varying(255) NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "file_type" character varying(50),
    "mime_type" character varying(100),
    "upload_purpose" character varying(30) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reservation_number" "text",
    "upload_type" "text",
    "upload_status" "text" DEFAULT 'pending'::"text",
    "file_url" "text",
    "upload_category" "text",
    CONSTRAINT "uploaded_files_upload_purpose_check" CHECK ((("upload_purpose")::"text" = ANY ((ARRAY['application'::character varying, 'chat'::character varying, 'report'::character varying, 'quotation'::character varying, 'invoice'::character varying, 'customs'::character varying])::"text"[]))),
    CONSTRAINT "uploaded_files_upload_status_check" CHECK (("upload_status" = ANY (ARRAY['pending'::"text", 'uploading'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."uploaded_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" NOT NULL,
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
    "approval_status" character varying(20) DEFAULT 'pending'::character varying,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "language_preference" character varying(2) DEFAULT 'ko'::character varying,
    "notification_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "provider" character varying(20) DEFAULT 'email'::character varying,
    "provider_id" character varying(255),
    "avatar_url" "text",
    "full_name" character varying(100),
    "terms_accepted_at" timestamp with time zone,
    "privacy_accepted_at" timestamp with time zone,
    "marketing_accepted_at" timestamp with time zone,
    "customs_type" "text",
    "default_shipping_address" "text",
    "default_receiver_name" "text",
    "default_receiver_phone" "text",
    "tax_company_name" character varying(255),
    "tax_registration_number" character varying(50),
    "tax_representative" character varying(100),
    "tax_address" "text",
    "tax_business_type" character varying(100),
    "tax_business_item" character varying(100),
    "tax_email" character varying(255),
    "tax_phone" character varying(50),
    "tax_fax" character varying(50),
    CONSTRAINT "user_profiles_approval_status_check" CHECK ((("approval_status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::"text"[]))),
    CONSTRAINT "user_profiles_customer_type_check" CHECK ((("customer_type")::"text" = ANY ((ARRAY['개인'::character varying, '법인'::character varying])::"text"[]))),
    CONSTRAINT "user_profiles_customs_type_check" CHECK (("customs_type" = ANY (ARRAY['개인통관'::"text", '사업자통관'::"text"]))),
    CONSTRAINT "user_profiles_language_preference_check" CHECK ((("language_preference")::"text" = ANY ((ARRAY['ko'::character varying, 'zh'::character varying])::"text"[]))),
    CONSTRAINT "user_profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['customer'::character varying, 'chinese_staff'::character varying, 'korean_team'::character varying, 'admin'::character varying, 'inspector'::character varying, 'factory'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_profiles"."terms_accepted_at" IS '이용약관 동의 시간';



COMMENT ON COLUMN "public"."user_profiles"."privacy_accepted_at" IS '개인정보처리방침 동의 시간';



COMMENT ON COLUMN "public"."user_profiles"."marketing_accepted_at" IS '마케팅 수신 동의 시간 (선택)';



CREATE TABLE IF NOT EXISTS "public"."user_shipping_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_name" character varying(100) NOT NULL,
    "is_default" boolean DEFAULT false,
    "customs_type" "text" NOT NULL,
    "personal_name" character varying(100),
    "personal_customs_code" character varying(50),
    "business_name" character varying(200),
    "business_number" character varying(20),
    "shipping_address" "text" NOT NULL,
    "receiver_name" character varying(100) NOT NULL,
    "receiver_phone" character varying(20) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_shipping_addresses_customs_type_check" CHECK (("customs_type" = ANY (ARRAY['개인통관'::"text", '사업자통관'::"text"])))
);


ALTER TABLE "public"."user_shipping_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "service_type" character varying(50) NOT NULL,
    "event_type" character varying(50) NOT NULL,
    "event_name" character varying(100) NOT NULL,
    "from_state" character varying(50),
    "to_state" character varying(50),
    "triggered_by" "uuid",
    "triggered_at" timestamp with time zone DEFAULT "now"(),
    "executed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "actions_taken" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_events" OWNER TO "postgres";


ALTER TABLE ONLY "public"."customer_inquiries" ALTER COLUMN "inquiry_number" SET DEFAULT "nextval"('"public"."customer_inquiries_inquiry_number_seq"'::"regclass");



ALTER TABLE ONLY "public"."hs_codes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."hs_codes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."hs_codes_hierarchy" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."hs_codes_hierarchy_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."hs_search_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."hs_search_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_translation_cache"
    ADD CONSTRAINT "ai_translation_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bulk_orders"
    ADD CONSTRAINT "bulk_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bulk_orders"
    ADD CONSTRAINT "bulk_orders_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_participants"
    ADD CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."china_business_trips"
    ADD CONSTRAINT "china_business_trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_addresses"
    ADD CONSTRAINT "company_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."confirmation_requests"
    ADD CONSTRAINT "confirmation_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_inquiries"
    ADD CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_inquiries"
    ADD CONSTRAINT "customer_inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exchange_rates"
    ADD CONSTRAINT "exchange_rates_date_key" UNIQUE ("date");



ALTER TABLE ONLY "public"."exchange_rates"
    ADD CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."factory_contact_requests"
    ADD CONSTRAINT "factory_contact_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."factory_contact_requests"
    ADD CONSTRAINT "factory_contact_requests_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guest_tokens"
    ADD CONSTRAINT "guest_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guest_tokens"
    ADD CONSTRAINT "guest_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."hs_code_aliases"
    ADD CONSTRAINT "hs_code_aliases_alias_hs_code_key" UNIQUE ("alias", "hs_code");



ALTER TABLE ONLY "public"."hs_code_aliases"
    ADD CONSTRAINT "hs_code_aliases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hs_codes_hierarchy"
    ADD CONSTRAINT "hs_codes_hierarchy_hs_code_key" UNIQUE ("hs_code");



ALTER TABLE ONLY "public"."hs_codes_hierarchy"
    ADD CONSTRAINT "hs_codes_hierarchy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hs_codes"
    ADD CONSTRAINT "hs_codes_hs_code_key" UNIQUE ("hs_code");



ALTER TABLE ONLY "public"."hs_codes"
    ADD CONSTRAINT "hs_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hs_search_logs"
    ADD CONSTRAINT "hs_search_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspection_applications"
    ADD CONSTRAINT "inspection_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspection_applications"
    ADD CONSTRAINT "inspection_applications_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."inspection_reports"
    ADD CONSTRAINT "inspection_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_research_costs"
    ADD CONSTRAINT "market_research_costs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_research_costs"
    ADD CONSTRAINT "market_research_costs_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."market_research_products"
    ADD CONSTRAINT "market_research_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_research_products"
    ADD CONSTRAINT "market_research_products_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."market_research_requests"
    ADD CONSTRAINT "market_research_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_research_requests"
    ADD CONSTRAINT "market_research_requests_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."market_research_samples"
    ADD CONSTRAINT "market_research_samples_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_research_samples"
    ADD CONSTRAINT "market_research_samples_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."market_research_suppliers"
    ADD CONSTRAINT "market_research_suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_research_suppliers"
    ADD CONSTRAINT "market_research_suppliers_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_calculations"
    ADD CONSTRAINT "price_calculations_calculation_number_key" UNIQUE ("calculation_number");



ALTER TABLE ONLY "public"."price_calculations"
    ADD CONSTRAINT "price_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_logs"
    ADD CONSTRAINT "process_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_items"
    ADD CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchasing_orders"
    ADD CONSTRAINT "purchasing_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sample_items"
    ADD CONSTRAINT "sample_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sample_orders"
    ADD CONSTRAINT "sample_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sampling_orders"
    ADD CONSTRAINT "sampling_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sampling_orders"
    ADD CONSTRAINT "sampling_orders_reservation_number_key" UNIQUE ("reservation_number");



ALTER TABLE ONLY "public"."search_cache"
    ADD CONSTRAINT "search_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_cache"
    ADD CONSTRAINT "search_cache_search_query_key" UNIQUE ("search_query");



ALTER TABLE ONLY "public"."search_feedback"
    ADD CONSTRAINT "search_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_addresses"
    ADD CONSTRAINT "shipping_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_agency_orders"
    ADD CONSTRAINT "shipping_agency_orders_customer_code_key" UNIQUE ("customer_code");



ALTER TABLE ONLY "public"."shipping_agency_orders"
    ADD CONSTRAINT "shipping_agency_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_items"
    ADD CONSTRAINT "shipping_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tariff_cache"
    ADD CONSTRAINT "tariff_cache_pkey" PRIMARY KEY ("hs_code", "country_code");



ALTER TABLE ONLY "public"."company_addresses"
    ADD CONSTRAINT "unique_default_per_user" EXCLUDE USING "btree" ("user_id" WITH =) WHERE (("is_default" = true));



ALTER TABLE ONLY "public"."uploaded_files"
    ADD CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_shipping_addresses"
    ADD CONSTRAINT "user_shipping_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_events"
    ADD CONSTRAINT "workflow_events_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_created" ON "public"."activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_entity" ON "public"."activity_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_activity_user" ON "public"."activity_logs" USING "btree" ("user_id");



CREATE INDEX "idx_cache_query" ON "public"."search_cache" USING "btree" ("search_query");



CREATE INDEX "idx_calculations_number" ON "public"."price_calculations" USING "btree" ("calculation_number");



CREATE INDEX "idx_calculations_user" ON "public"."price_calculations" USING "btree" ("user_id");



CREATE INDEX "idx_chat_messages_created_at" ON "public"."chat_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_chat_messages_reservation_number" ON "public"."chat_messages" USING "btree" ("reservation_number");



CREATE INDEX "idx_chat_messages_sender_id" ON "public"."chat_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_chat_messages_service_type" ON "public"."chat_messages" USING "btree" ("service_type");



CREATE INDEX "idx_chat_participants_reservation_number" ON "public"."chat_participants" USING "btree" ("reservation_number");



CREATE INDEX "idx_chat_participants_user" ON "public"."chat_participants" USING "btree" ("user_id");



CREATE INDEX "idx_company_addresses_default" ON "public"."company_addresses" USING "btree" ("user_id", "is_default");



CREATE INDEX "idx_company_addresses_user_id" ON "public"."company_addresses" USING "btree" ("user_id");



CREATE INDEX "idx_confirmation_requests_reservation" ON "public"."confirmation_requests" USING "btree" ("reservation_number");



CREATE INDEX "idx_confirmation_requests_status" ON "public"."confirmation_requests" USING "btree" ("status");



CREATE INDEX "idx_confirmation_requests_type" ON "public"."confirmation_requests" USING "btree" ("request_type");



CREATE INDEX "idx_contact_inquiries_created" ON "public"."contact_inquiries" USING "btree" ("created_at");



CREATE INDEX "idx_contact_inquiries_status" ON "public"."contact_inquiries" USING "btree" ("status");



CREATE INDEX "idx_exchange_rates_date" ON "public"."exchange_rates" USING "btree" ("date" DESC);



CREATE INDEX "idx_factory_contact_payment_status" ON "public"."factory_contact_requests" USING "btree" ("payment_status");



CREATE INDEX "idx_factory_contact_requests_reservation" ON "public"."factory_contact_requests" USING "btree" ("reservation_number");



CREATE INDEX "idx_factory_contact_requests_status" ON "public"."factory_contact_requests" USING "btree" ("status");



CREATE INDEX "idx_factory_contact_requests_user" ON "public"."factory_contact_requests" USING "btree" ("user_id");



CREATE INDEX "idx_faqs_category" ON "public"."faqs" USING "btree" ("category");



CREATE INDEX "idx_faqs_sort_order" ON "public"."faqs" USING "btree" ("sort_order");



CREATE INDEX "idx_faqs_visible" ON "public"."faqs" USING "btree" ("is_visible");



CREATE INDEX "idx_feedback_query" ON "public"."search_feedback" USING "btree" ("search_query");



CREATE INDEX "idx_files_created" ON "public"."uploaded_files" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_files_order" ON "public"."uploaded_files" USING "btree" ("order_id");



CREATE INDEX "idx_files_purpose" ON "public"."uploaded_files" USING "btree" ("upload_purpose");



CREATE INDEX "idx_files_uploader" ON "public"."uploaded_files" USING "btree" ("uploaded_by");



CREATE INDEX "idx_guest_tokens_expires" ON "public"."guest_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_guest_tokens_order" ON "public"."guest_tokens" USING "btree" ("order_id");



CREATE INDEX "idx_guest_tokens_token" ON "public"."guest_tokens" USING "btree" ("token");



CREATE INDEX "idx_hs_10" ON "public"."hs_codes" USING "btree" ("hs_code_10");



CREATE INDEX "idx_hs_4" ON "public"."hs_codes" USING "btree" ("hs_code_4");



CREATE INDEX "idx_hs_6" ON "public"."hs_codes" USING "btree" ("hs_code_6");



CREATE INDEX "idx_hs_code" ON "public"."hs_codes" USING "btree" ("hs_code");



CREATE INDEX "idx_hs_code_aliases_alias" ON "public"."hs_code_aliases" USING "gin" ("alias" "public"."gin_trgm_ops");



CREATE INDEX "idx_hs_code_aliases_hs_code" ON "public"."hs_code_aliases" USING "btree" ("hs_code");



CREATE INDEX "idx_hs_codes_aliases" ON "public"."hs_codes_hierarchy" USING "gin" ("common_aliases");



CREATE INDEX "idx_hs_codes_has_spec" ON "public"."hs_codes" USING "btree" ("hs_code") WHERE (("spec_name" IS NOT NULL) OR ("required_spec_name" IS NOT NULL));



CREATE INDEX "idx_hs_codes_keywords" ON "public"."hs_codes_hierarchy" USING "gin" ("search_keywords");



CREATE INDEX "idx_hs_codes_level" ON "public"."hs_codes_hierarchy" USING "btree" ("level");



CREATE INDEX "idx_hs_codes_parent" ON "public"."hs_codes_hierarchy" USING "btree" ("parent_code");



CREATE INDEX "idx_hs_codes_search" ON "public"."hs_codes_hierarchy" USING "gin" ("to_tsvector"('"simple"'::"regconfig", (("name_ko" || ' '::"text") || COALESCE("name_en", ''::"text"))));



CREATE INDEX "idx_inquiries_assigned" ON "public"."customer_inquiries" USING "btree" ("assigned_to");



CREATE INDEX "idx_inquiries_customer" ON "public"."customer_inquiries" USING "btree" ("customer_id");



CREATE INDEX "idx_inquiries_date" ON "public"."customer_inquiries" USING "btree" ("inquiry_date" DESC);



CREATE INDEX "idx_inquiries_status" ON "public"."customer_inquiries" USING "btree" ("status");



CREATE INDEX "idx_inspection_applications_reservation_number" ON "public"."inspection_applications" USING "btree" ("reservation_number");



CREATE INDEX "idx_inspection_applications_status" ON "public"."inspection_applications" USING "btree" ("status");



CREATE INDEX "idx_inspection_applications_user_id" ON "public"."inspection_applications" USING "btree" ("user_id");



CREATE INDEX "idx_items_sample" ON "public"."sample_items" USING "btree" ("sample_order_id");



CREATE INDEX "idx_logs_internal" ON "public"."process_logs" USING "btree" ("is_internal");



CREATE INDEX "idx_logs_order" ON "public"."process_logs" USING "btree" ("order_id");



CREATE INDEX "idx_logs_processor" ON "public"."process_logs" USING "btree" ("processor");



CREATE INDEX "idx_logs_time" ON "public"."process_logs" USING "btree" ("process_time" DESC);



CREATE INDEX "idx_market_research_assigned_staff" ON "public"."market_research_requests" USING "btree" ("assigned_staff");



CREATE INDEX "idx_market_research_created" ON "public"."market_research_requests" USING "btree" ("created_at");



CREATE INDEX "idx_market_research_created_at" ON "public"."market_research_requests" USING "btree" ("created_at");



CREATE INDEX "idx_market_research_custom_box_required" ON "public"."market_research_requests" USING "btree" ("custom_box_required");



CREATE INDEX "idx_market_research_logo_required" ON "public"."market_research_requests" USING "btree" ("logo_required");



CREATE INDEX "idx_market_research_moq_check" ON "public"."market_research_requests" USING "btree" ("moq_check");



CREATE INDEX "idx_market_research_reservation" ON "public"."market_research_requests" USING "btree" ("reservation_number");



CREATE INDEX "idx_market_research_status" ON "public"."market_research_requests" USING "btree" ("status");



CREATE INDEX "idx_market_research_user" ON "public"."market_research_requests" USING "btree" ("user_id");



CREATE INDEX "idx_messages_created" ON "public"."chat_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_sender" ON "public"."chat_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_notices_category" ON "public"."notices" USING "btree" ("category");



CREATE INDEX "idx_notices_visible" ON "public"."notices" USING "btree" ("is_visible");



CREATE INDEX "idx_orders_created" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_service" ON "public"."orders" USING "btree" ("service_type");



CREATE INDEX "idx_orders_staff" ON "public"."orders" USING "btree" ("assigned_staff");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_user" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_participants_online" ON "public"."chat_participants" USING "btree" ("is_online");



CREATE INDEX "idx_participants_user" ON "public"."chat_participants" USING "btree" ("user_id");



CREATE INDEX "idx_pitems_order" ON "public"."purchase_items" USING "btree" ("purchasing_order_id");



CREATE INDEX "idx_profiles_approval" ON "public"."user_profiles" USING "btree" ("approval_status");



CREATE INDEX "idx_profiles_company" ON "public"."user_profiles" USING "btree" ("company_name");



CREATE INDEX "idx_profiles_provider" ON "public"."user_profiles" USING "btree" ("provider", "provider_id");



CREATE INDEX "idx_profiles_role" ON "public"."user_profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_terms_accepted" ON "public"."user_profiles" USING "btree" ("terms_accepted_at");



CREATE INDEX "idx_purchasing_order" ON "public"."purchasing_orders" USING "btree" ("order_id");



CREATE INDEX "idx_purchasing_status" ON "public"."purchasing_orders" USING "btree" ("purchase_status");



CREATE INDEX "idx_purchasing_warehouse" ON "public"."purchasing_orders" USING "btree" ("warehouse_number");



CREATE INDEX "idx_reports_order" ON "public"."inspection_reports" USING "btree" ("order_id");



CREATE INDEX "idx_reports_status" ON "public"."inspection_reports" USING "btree" ("status");



CREATE INDEX "idx_reports_uploader" ON "public"."inspection_reports" USING "btree" ("uploaded_by");



CREATE INDEX "idx_samples_order" ON "public"."sample_orders" USING "btree" ("order_id");



CREATE INDEX "idx_samples_research" ON "public"."sample_orders" USING "btree" ("research_id");



CREATE INDEX "idx_samples_status" ON "public"."sample_orders" USING "btree" ("sample_status");



CREATE INDEX "idx_sampling_orders_created_at" ON "public"."sampling_orders" USING "btree" ("created_at");



CREATE INDEX "idx_sampling_orders_market_research_id" ON "public"."sampling_orders" USING "btree" ("market_research_id");



CREATE INDEX "idx_sampling_orders_reservation_number" ON "public"."sampling_orders" USING "btree" ("reservation_number");



CREATE INDEX "idx_sampling_orders_status" ON "public"."sampling_orders" USING "btree" ("status");



CREATE INDEX "idx_sampling_orders_user_id" ON "public"."sampling_orders" USING "btree" ("user_id");



CREATE INDEX "idx_search_logs_code" ON "public"."hs_search_logs" USING "btree" ("selected_hs_code");



CREATE INDEX "idx_search_logs_term" ON "public"."hs_search_logs" USING "btree" ("search_term");



CREATE INDEX "idx_shipping_addresses_user_id" ON "public"."shipping_addresses" USING "btree" ("user_id");



CREATE INDEX "idx_shipping_code" ON "public"."shipping_agency_orders" USING "btree" ("customer_code");



CREATE INDEX "idx_shipping_order" ON "public"."shipping_agency_orders" USING "btree" ("order_id");



CREATE INDEX "idx_shipping_status" ON "public"."shipping_agency_orders" USING "btree" ("shipping_status");



CREATE INDEX "idx_sitems_order" ON "public"."shipping_items" USING "btree" ("shipping_order_id");



CREATE INDEX "idx_sitems_tracking" ON "public"."shipping_items" USING "btree" ("tracking_number");



CREATE INDEX "idx_tariff_expires" ON "public"."tariff_cache" USING "btree" ("expires_at");



CREATE INDEX "idx_tariff_hs" ON "public"."tariff_cache" USING "btree" ("hs_code");



CREATE INDEX "idx_translation_context" ON "public"."ai_translation_cache" USING "btree" ("context_type");



CREATE INDEX "idx_translation_expires" ON "public"."ai_translation_cache" USING "btree" ("expires_at");



CREATE UNIQUE INDEX "idx_translation_hash" ON "public"."ai_translation_cache" USING "btree" ("text_hash", "target_language");



CREATE INDEX "idx_translation_usage" ON "public"."ai_translation_cache" USING "btree" ("usage_count" DESC);



CREATE INDEX "idx_trips_dates" ON "public"."china_business_trips" USING "btree" ("confirmed_date");



CREATE INDEX "idx_trips_factory" ON "public"."china_business_trips" USING "btree" ("factory_name");



CREATE INDEX "idx_trips_order" ON "public"."china_business_trips" USING "btree" ("order_id");



CREATE INDEX "idx_uploaded_files_reservation_number" ON "public"."uploaded_files" USING "btree" ("reservation_number");



CREATE INDEX "idx_user_shipping_addresses_default" ON "public"."user_shipping_addresses" USING "btree" ("user_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_user_shipping_addresses_user_id" ON "public"."user_shipping_addresses" USING "btree" ("user_id");



CREATE INDEX "idx_workflow_created" ON "public"."workflow_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_workflow_order" ON "public"."workflow_events" USING "btree" ("order_id");



CREATE INDEX "idx_workflow_service" ON "public"."workflow_events" USING "btree" ("service_type");



CREATE INDEX "idx_workflow_status" ON "public"."workflow_events" USING "btree" ("status");



CREATE UNIQUE INDEX "unique_default_per_user_partial" ON "public"."user_shipping_addresses" USING "btree" ("user_id") WHERE ("is_default" = true);



CREATE OR REPLACE TRIGGER "auto_create_chat_participants_trigger" AFTER INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_chat_participants"();



CREATE OR REPLACE TRIGGER "on_application_created" BEFORE INSERT ON "public"."inspection_applications" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_application"();



CREATE OR REPLACE TRIGGER "on_application_update_chinese" BEFORE INSERT OR UPDATE ON "public"."inspection_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_chinese_fields"();



CREATE OR REPLACE TRIGGER "set_guest_uploaded_by_trigger" BEFORE INSERT ON "public"."uploaded_files" FOR EACH ROW EXECUTE FUNCTION "public"."set_guest_uploaded_by"();



CREATE OR REPLACE TRIGGER "trigger_create_shipping_address_with_default_check" BEFORE INSERT ON "public"."user_shipping_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."create_shipping_address_with_default_check"();



CREATE OR REPLACE TRIGGER "trigger_sampling_orders_updated_at" BEFORE UPDATE ON "public"."sampling_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_sampling_orders_updated_at"();



CREATE OR REPLACE TRIGGER "update_chat_participants_on_staff_change_trigger" AFTER UPDATE OF "assigned_staff" ON "public"."orders" FOR EACH ROW WHEN (("old"."assigned_staff" IS DISTINCT FROM "new"."assigned_staff")) EXECUTE FUNCTION "public"."update_chat_participants_on_staff_change"();



CREATE OR REPLACE TRIGGER "update_china_business_trips_updated_at" BEFORE UPDATE ON "public"."china_business_trips" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_company_addresses_updated_at" BEFORE UPDATE ON "public"."company_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_customer_inquiries_updated_at" BEFORE UPDATE ON "public"."customer_inquiries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_factory_contact_requests_updated_at" BEFORE UPDATE ON "public"."factory_contact_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_inspection_reports_updated_at" BEFORE UPDATE ON "public"."inspection_reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_market_research_requests_updated_at" BEFORE UPDATE ON "public"."market_research_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_purchasing_orders_updated_at" BEFORE UPDATE ON "public"."purchasing_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sample_orders_updated_at" BEFORE UPDATE ON "public"."sample_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_shipping_agency_orders_updated_at" BEFORE UPDATE ON "public"."shipping_agency_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bulk_orders"
    ADD CONSTRAINT "bulk_orders_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bulk_orders"
    ADD CONSTRAINT "bulk_orders_market_research_id_fkey" FOREIGN KEY ("market_research_id") REFERENCES "public"."market_research_requests"("id");



ALTER TABLE ONLY "public"."bulk_orders"
    ADD CONSTRAINT "bulk_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."chat_participants"
    ADD CONSTRAINT "chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."china_business_trips"
    ADD CONSTRAINT "china_business_trips_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_addresses"
    ADD CONSTRAINT "company_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."confirmation_requests"
    ADD CONSTRAINT "confirmation_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."confirmation_requests"
    ADD CONSTRAINT "confirmation_requests_parent_request_id_fkey" FOREIGN KEY ("parent_request_id") REFERENCES "public"."confirmation_requests"("id");



ALTER TABLE ONLY "public"."contact_inquiries"
    ADD CONSTRAINT "contact_inquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."customer_inquiries"
    ADD CONSTRAINT "customer_inquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."customer_inquiries"
    ADD CONSTRAINT "customer_inquiries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."factory_contact_requests"
    ADD CONSTRAINT "factory_contact_requests_assigned_chinese_staff_fkey" FOREIGN KEY ("assigned_chinese_staff") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."factory_contact_requests"
    ADD CONSTRAINT "factory_contact_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."guest_tokens"
    ADD CONSTRAINT "guest_tokens_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspection_applications"
    ADD CONSTRAINT "inspection_applications_assigned_chinese_staff_fkey" FOREIGN KEY ("assigned_chinese_staff") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inspection_applications"
    ADD CONSTRAINT "inspection_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inspection_reports"
    ADD CONSTRAINT "inspection_reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inspection_reports"
    ADD CONSTRAINT "inspection_reports_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspection_reports"
    ADD CONSTRAINT "inspection_reports_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."market_research_costs"
    ADD CONSTRAINT "market_research_costs_reservation_number_fkey" FOREIGN KEY ("reservation_number") REFERENCES "public"."inspection_applications"("reservation_number");



ALTER TABLE ONLY "public"."market_research_products"
    ADD CONSTRAINT "market_research_products_reservation_number_fkey" FOREIGN KEY ("reservation_number") REFERENCES "public"."inspection_applications"("reservation_number");



ALTER TABLE ONLY "public"."market_research_requests"
    ADD CONSTRAINT "market_research_requests_assigned_staff_fkey" FOREIGN KEY ("assigned_staff") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."market_research_requests"
    ADD CONSTRAINT "market_research_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."market_research_samples"
    ADD CONSTRAINT "market_research_samples_reservation_number_fkey" FOREIGN KEY ("reservation_number") REFERENCES "public"."inspection_applications"("reservation_number");



ALTER TABLE ONLY "public"."market_research_suppliers"
    ADD CONSTRAINT "market_research_suppliers_reservation_number_fkey" FOREIGN KEY ("reservation_number") REFERENCES "public"."inspection_applications"("reservation_number");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_assigned_staff_fkey" FOREIGN KEY ("assigned_staff") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."price_calculations"
    ADD CONSTRAINT "price_calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."process_logs"
    ADD CONSTRAINT "process_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_items"
    ADD CONSTRAINT "purchase_items_purchasing_order_id_fkey" FOREIGN KEY ("purchasing_order_id") REFERENCES "public"."purchasing_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchasing_orders"
    ADD CONSTRAINT "purchasing_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sample_items"
    ADD CONSTRAINT "sample_items_sample_order_id_fkey" FOREIGN KEY ("sample_order_id") REFERENCES "public"."sample_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sample_orders"
    ADD CONSTRAINT "sample_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sampling_orders"
    ADD CONSTRAINT "sampling_orders_market_research_id_fkey" FOREIGN KEY ("market_research_id") REFERENCES "public"."market_research_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sampling_orders"
    ADD CONSTRAINT "sampling_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_addresses"
    ADD CONSTRAINT "shipping_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_agency_orders"
    ADD CONSTRAINT "shipping_agency_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_items"
    ADD CONSTRAINT "shipping_items_shipping_order_id_fkey" FOREIGN KEY ("shipping_order_id") REFERENCES "public"."shipping_agency_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."uploaded_files"
    ADD CONSTRAINT "uploaded_files_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."uploaded_files"
    ADD CONSTRAINT "uploaded_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_shipping_addresses"
    ADD CONSTRAINT "user_shipping_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_events"
    ADD CONSTRAINT "workflow_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_events"
    ADD CONSTRAINT "workflow_events_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins can update all applications" ON "public"."market_research_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'korean_team'::character varying])::"text"[]))))));



CREATE POLICY "Admins can view all applications" ON "public"."market_research_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'korean_team'::character varying])::"text"[]))))));



CREATE POLICY "Allow public read access" ON "public"."hs_code_aliases" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."hs_codes" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."hs_codes_hierarchy" FOR SELECT USING (true);



CREATE POLICY "Anon users can view costs for development" ON "public"."market_research_costs" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anon users can view products for development" ON "public"."market_research_products" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anon users can view samples for development" ON "public"."market_research_samples" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anon users can view suppliers for development" ON "public"."market_research_suppliers" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can insert contact inquiries" ON "public"."contact_inquiries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read exchange rates" ON "public"."exchange_rates" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can send messages" ON "public"."chat_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Chinese staff can manage assigned orders" ON "public"."bulk_orders" USING ((("auth"."uid"() = "assigned_staff_id") OR (EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = 'chinese_staff'::"text"))))));



CREATE POLICY "Chinese staff can update assigned sampling orders" ON "public"."sampling_orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = 'chinese_staff'::"text")))));



CREATE POLICY "Chinese staff can view assigned sampling orders" ON "public"."sampling_orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = 'chinese_staff'::"text")))));



CREATE POLICY "Customers can create applications" ON "public"."inspection_applications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Customers can create orders" ON "public"."bulk_orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Customers can update own applications" ON "public"."inspection_applications" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("status" = 'submitted'::"text")));



CREATE POLICY "Customers can update own submitted orders" ON "public"."bulk_orders" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("status" = 'submitted'::"text")));



CREATE POLICY "Customers can view own applications" ON "public"."inspection_applications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Customers can view own orders" ON "public"."bulk_orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Korean team can update all sampling orders" ON "public"."sampling_orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "Korean team can view all messages" ON "public"."chat_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "Korean team can view all sampling orders" ON "public"."sampling_orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "Korean team full access" ON "public"."bulk_orders" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "Korean team full access" ON "public"."inspection_applications" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "Public read access" ON "public"."search_cache" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."search_feedback" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."tariff_cache" FOR SELECT USING (true);



CREATE POLICY "Service role write" ON "public"."tariff_cache" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can delete own shipping addresses" ON "public"."shipping_addresses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own shipping addresses" ON "public"."user_shipping_addresses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own applications" ON "public"."market_research_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own factory contact requests" ON "public"."factory_contact_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own inspection applications" ON "public"."inspection_applications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own market research requests" ON "public"."market_research_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own sampling orders" ON "public"."sampling_orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own shipping addresses" ON "public"."shipping_addresses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own shipping addresses" ON "public"."user_shipping_addresses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own company addresses" ON "public"."company_addresses" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own factory contact requests" ON "public"."factory_contact_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = ANY ((ARRAY['pending'::character varying, 'submitted'::character varying])::"text"[]))));



CREATE POLICY "Users can update own inspection applications" ON "public"."inspection_applications" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("status" = ANY (ARRAY['pending'::"text", 'submitted'::"text"]))));



CREATE POLICY "Users can update own market research requests" ON "public"."market_research_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = ANY ((ARRAY['pending'::character varying, 'submitted'::character varying])::"text"[]))));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own sampling orders" ON "public"."sampling_orders" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("payment_status" = 'pending'::"text")));



CREATE POLICY "Users can update own shipping addresses" ON "public"."shipping_addresses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own shipping addresses" ON "public"."user_shipping_addresses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view messages for their applications" ON "public"."chat_messages" FOR SELECT USING ((("reservation_number")::"text" IN ( SELECT "market_research_requests"."reservation_number"
   FROM "public"."market_research_requests"
  WHERE ("market_research_requests"."user_id" = "auth"."uid"())
UNION
 SELECT "inspection_applications"."reservation_number"
   FROM "public"."inspection_applications"
  WHERE ("inspection_applications"."user_id" = "auth"."uid"())
UNION
 SELECT "factory_contact_requests"."reservation_number"
   FROM "public"."factory_contact_requests"
  WHERE ("factory_contact_requests"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own applications" ON "public"."market_research_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own contact inquiries" ON "public"."contact_inquiries" FOR SELECT USING (((("auth"."jwt"() ->> 'email'::"text") = ("email")::"text") OR (("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" = ("contact_inquiries"."email")::"text")))))));



CREATE POLICY "Users can view own factory contact requests" ON "public"."factory_contact_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own inspection applications" ON "public"."inspection_applications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own market research requests" ON "public"."market_research_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own messages" ON "public"."chat_messages" FOR SELECT USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own sampling orders" ON "public"."sampling_orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own shipping addresses" ON "public"."shipping_addresses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own shipping addresses" ON "public"."user_shipping_addresses" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_translation_cache" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "auth_users_all" ON "public"."chat_participants" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "authenticated_upload" ON "public"."uploaded_files" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "authorized_insert_process_logs" ON "public"."process_logs" FOR INSERT TO "authenticated", "service_role" WITH CHECK ((("public"."get_auth_role"() = 'service_role'::"text") OR ("public"."is_staff_cached"() AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "process_logs"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))))));



CREATE POLICY "authorized_insert_workflow_events" ON "public"."workflow_events" FOR INSERT TO "authenticated", "service_role" WITH CHECK ((("public"."get_auth_role"() = 'service_role'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "workflow_events"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"()))))));



ALTER TABLE "public"."bulk_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."china_business_trips" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chinese_staff_assigned_orders" ON "public"."orders" TO "authenticated" USING ((("public"."get_user_role_cached"() = 'chinese_staff'::"text") AND (( SELECT "auth"."uid"() AS "uid") = "assigned_staff")));



CREATE POLICY "chinese_staff_view_unassigned" ON "public"."orders" FOR SELECT TO "authenticated" USING ((("public"."get_user_role_cached"() = 'chinese_staff'::"text") AND ("assigned_staff" IS NULL)));



ALTER TABLE "public"."company_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."confirmation_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_inquiries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_create_inquiries" ON "public"."customer_inquiries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



ALTER TABLE "public"."customer_inquiries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_own_inquiries" ON "public"."customer_inquiries" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "customer_id") OR (( SELECT "auth"."uid"() AS "uid") = "assigned_to") OR "public"."is_korean_team_cached"()));



CREATE POLICY "customers_create_orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND ("public"."get_user_role_cached"() = 'customer'::"text")));



CREATE POLICY "customers_own_orders" ON "public"."orders" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "delete_own_files" ON "public"."uploaded_files" FOR UPDATE USING (("auth"."uid"() = "uploaded_by")) WITH CHECK (("auth"."uid"() = "uploaded_by"));



ALTER TABLE "public"."exchange_rates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."factory_contact_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faqs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "guest_token_access_orders" ON "public"."orders" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."guest_tokens"
  WHERE (("guest_tokens"."order_id" = "orders"."id") AND (("guest_tokens"."token")::"text" = "current_setting"('app.guest_token'::"text", true)) AND ("guest_tokens"."expires_at" > "now"())))));



ALTER TABLE "public"."guest_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hs_code_aliases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hs_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hs_codes_hierarchy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inspection_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inspection_reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "korean_team_all_orders" ON "public"."orders" TO "authenticated" USING ("public"."is_korean_team_cached"());



CREATE POLICY "korean_team_all_profiles" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ("public"."is_korean_team_cached"());



COMMENT ON POLICY "korean_team_all_profiles" ON "public"."user_profiles" IS '한국팀은 모든 프로필 조회 가능';



CREATE POLICY "korean_team_approve_profiles" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ("public"."is_korean_team_cached"()) WITH CHECK ("public"."is_korean_team_cached"());



COMMENT ON POLICY "korean_team_approve_profiles" ON "public"."user_profiles" IS '한국팀은 승인 상태 업데이트 가능';



CREATE POLICY "korean_team_manage_participants" ON "public"."chat_participants" TO "authenticated" USING ("public"."is_korean_team_cached"()) WITH CHECK ("public"."is_korean_team_cached"());



ALTER TABLE "public"."market_research_costs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "market_research_costs_modify" ON "public"."market_research_costs" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "market_research_costs_view" ON "public"."market_research_costs" FOR SELECT USING (true);



ALTER TABLE "public"."market_research_products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "market_research_products_modify" ON "public"."market_research_products" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "market_research_products_view" ON "public"."market_research_products" FOR SELECT USING (true);



ALTER TABLE "public"."market_research_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."market_research_samples" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "market_research_samples_modify" ON "public"."market_research_samples" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "market_research_samples_view" ON "public"."market_research_samples" FOR SELECT USING (true);



ALTER TABLE "public"."market_research_suppliers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "market_research_suppliers_modify" ON "public"."market_research_suppliers" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[]))))));



CREATE POLICY "market_research_suppliers_view" ON "public"."market_research_suppliers" FOR SELECT USING (true);



ALTER TABLE "public"."notices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_based_logs" ON "public"."process_logs" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "process_logs"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))) AND ((NOT "is_internal") OR "public"."is_staff_cached"())));



CREATE POLICY "order_based_purchasing" ON "public"."purchasing_orders" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "purchasing_orders"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



CREATE POLICY "order_based_reports" ON "public"."inspection_reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "inspection_reports"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



CREATE POLICY "order_based_samples" ON "public"."sample_orders" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "sample_orders"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



CREATE POLICY "order_based_shipping" ON "public"."shipping_agency_orders" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "shipping_agency_orders"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



CREATE POLICY "order_based_trips" ON "public"."china_business_trips" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "china_business_trips"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "user_profiles"."user_id"
           FROM "public"."user_profiles"
          WHERE (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[])))))))));



CREATE POLICY "order_based_workflow" ON "public"."workflow_events" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "workflow_events"."order_id") AND (("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("orders"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_calculations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_visible_faqs" ON "public"."faqs" FOR SELECT USING (("is_visible" = true));



CREATE POLICY "public_read_visible_notices" ON "public"."notices" FOR SELECT USING (("is_visible" = true));



ALTER TABLE "public"."purchase_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "purchasing_based_items" ON "public"."purchase_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."purchasing_orders" "po"
     JOIN "public"."orders" "o" ON (("o"."id" = "po"."order_id")))
  WHERE (("po"."id" = "purchase_items"."purchasing_order_id") AND (("o"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("o"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."purchasing_orders" "po"
     JOIN "public"."orders" "o" ON (("o"."id" = "po"."order_id")))
  WHERE (("po"."id" = "purchase_items"."purchasing_order_id") AND (("o"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("o"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



ALTER TABLE "public"."purchasing_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sample_based_items" ON "public"."sample_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."sample_orders" "so"
     JOIN "public"."orders" "o" ON (("o"."id" = "so"."order_id")))
  WHERE (("so"."id" = "sample_items"."sample_order_id") AND (("o"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("o"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



ALTER TABLE "public"."sample_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sample_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sampling_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_feedback" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_insert_activity_logs" ON "public"."activity_logs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "service_role_manage_guest_tokens" ON "public"."guest_tokens" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_write_translation_cache" ON "public"."ai_translation_cache" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."shipping_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shipping_agency_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shipping_based_items" ON "public"."shipping_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."shipping_agency_orders" "sao"
     JOIN "public"."orders" "o" ON (("o"."id" = "sao"."order_id")))
  WHERE (("sao"."id" = "shipping_items"."shipping_order_id") AND (("o"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("o"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."shipping_agency_orders" "sao"
     JOIN "public"."orders" "o" ON (("o"."id" = "sao"."order_id")))
  WHERE (("sao"."id" = "shipping_items"."shipping_order_id") AND (("o"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("o"."assigned_staff" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_korean_team_cached"())))));



ALTER TABLE "public"."shipping_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "staff_all_access_faqs" ON "public"."faqs" USING (("auth"."uid"() IN ( SELECT "user_profiles"."user_id"
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'korean_team'::character varying, 'chinese_staff'::character varying])::"text"[])))));



CREATE POLICY "staff_all_access_notices" ON "public"."notices" USING (("auth"."uid"() IN ( SELECT "user_profiles"."user_id"
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'korean_team'::character varying, 'chinese_staff'::character varying])::"text"[])))));



ALTER TABLE "public"."tariff_cache" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_own_files" ON "public"."uploaded_files" FOR UPDATE USING (("auth"."uid"() = "uploaded_by")) WITH CHECK (("auth"."uid"() = "uploaded_by"));



ALTER TABLE "public"."uploaded_files" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_own_activity" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."is_korean_team_cached"()));



CREATE POLICY "user_own_calculations" ON "public"."price_calculations" TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."is_korean_team_cached"()));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_shipping_addresses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_own_activity_logs" ON "public"."activity_logs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users_insert_own_profile" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



COMMENT ON POLICY "users_insert_own_profile" ON "public"."user_profiles" IS '사용자는 자신의 프로필을 생성 가능 (OAuth 로그인용)';



CREATE POLICY "users_insert_participants" ON "public"."chat_participants" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users_own_profile" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



COMMENT ON POLICY "users_own_profile" ON "public"."user_profiles" IS '사용자는 자신의 프로필만 조회 가능';



CREATE POLICY "users_read_participants" ON "public"."chat_participants" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users_read_translation_cache" ON "public"."ai_translation_cache" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users_update_own_participants" ON "public"."chat_participants" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users_update_own_profile" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



COMMENT ON POLICY "users_update_own_profile" ON "public"."user_profiles" IS '사용자는 자신의 프로필만 수정 가능';



CREATE POLICY "view_files_for_own_applications" ON "public"."uploaded_files" FOR SELECT USING ((("auth"."uid"() = "uploaded_by") OR ("reservation_number" IN ( SELECT "market_research_requests"."reservation_number"
   FROM "public"."market_research_requests"
  WHERE ("market_research_requests"."user_id" = "auth"."uid"())
UNION
 SELECT "inspection_applications"."reservation_number"
   FROM "public"."inspection_applications"
  WHERE ("inspection_applications"."user_id" = "auth"."uid"())
UNION
 SELECT "factory_contact_requests"."reservation_number"
   FROM "public"."factory_contact_requests"
  WHERE ("factory_contact_requests"."user_id" = "auth"."uid"())
UNION
 SELECT "sampling_orders"."reservation_number"
   FROM "public"."sampling_orders"
  WHERE ("sampling_orders"."user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND (("user_profiles"."role")::"text" = ANY ((ARRAY['korean_team'::character varying, 'admin'::character varying])::"text"[])))))));



ALTER TABLE "public"."workflow_events" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



















































GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";























































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."auto_create_chat_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_chat_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_chat_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_guest_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_guest_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_guest_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_translations"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_translations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_translations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_shipping_address_with_default_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_shipping_address_with_default_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_shipping_address_with_default_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_guest_token"("p_order_id" "uuid", "p_role" character varying, "p_guest_name" character varying, "p_guest_email" character varying, "p_expires_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_guest_token"("p_order_id" "uuid", "p_role" character varying, "p_guest_name" character varying, "p_guest_email" character varying, "p_expires_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_guest_token"("p_order_id" "uuid", "p_role" character varying, "p_guest_name" character varying, "p_guest_email" character varying, "p_expires_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_reservation_number"("prefix" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_reservation_number"("prefix" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_reservation_number"("prefix" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_simple_reservation_number"("service_prefix" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_simple_reservation_number"("service_prefix" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_simple_reservation_number"("service_prefix" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auth_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_auth_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auth_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_today_exchange_rate"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_today_exchange_rate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_today_exchange_rate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role_cached"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_cached"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_cached"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_application"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_application"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_application"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invoke_translate_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."invoke_translate_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."invoke_translate_function"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_korean_team_cached"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_korean_team_cached"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_korean_team_cached"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff_cached"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff_cached"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff_cached"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_hs_codes"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_hs_codes"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_hs_codes"("search_term" "text") TO "service_role";






GRANT ALL ON FUNCTION "public"."send_translation_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_translation_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_translation_request"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_default_shipping_address"("p_user_id" "uuid", "p_address_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_default_shipping_address"("p_user_id" "uuid", "p_address_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_default_shipping_address"("p_user_id" "uuid", "p_address_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_guest_uploaded_by"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_guest_uploaded_by"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_guest_uploaded_by"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_chat_translation"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_chat_translation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_chat_translation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_chat_participants_on_staff_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_chat_participants_on_staff_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chat_participants_on_staff_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_chinese_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_chinese_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chinese_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sampling_orders_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sampling_orders_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sampling_orders_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile_from_sampling"("p_user_id" "uuid", "p_shipping_method" "text", "p_customs_type" "text", "p_business_name" "text", "p_business_number" "text", "p_korea_shipping_address" "text", "p_korea_receiver_name" "text", "p_korea_receiver_phone" "text", "p_personal_name" "text", "p_personal_customs_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile_from_sampling"("p_user_id" "uuid", "p_shipping_method" "text", "p_customs_type" "text", "p_business_name" "text", "p_business_number" "text", "p_korea_shipping_address" "text", "p_korea_receiver_name" "text", "p_korea_receiver_phone" "text", "p_personal_name" "text", "p_personal_customs_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile_from_sampling"("p_user_id" "uuid", "p_shipping_method" "text", "p_customs_type" "text", "p_business_name" "text", "p_business_number" "text", "p_korea_shipping_address" "text", "p_korea_receiver_name" "text", "p_korea_receiver_phone" "text", "p_personal_name" "text", "p_personal_customs_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";




































GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_translation_cache" TO "anon";
GRANT ALL ON TABLE "public"."ai_translation_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_translation_cache" TO "service_role";



GRANT ALL ON TABLE "public"."bulk_orders" TO "anon";
GRANT ALL ON TABLE "public"."bulk_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."bulk_orders" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."chat_participants" TO "anon";
GRANT ALL ON TABLE "public"."chat_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_participants" TO "service_role";



GRANT ALL ON TABLE "public"."china_business_trips" TO "anon";
GRANT ALL ON TABLE "public"."china_business_trips" TO "authenticated";
GRANT ALL ON TABLE "public"."china_business_trips" TO "service_role";



GRANT ALL ON TABLE "public"."company_addresses" TO "anon";
GRANT ALL ON TABLE "public"."company_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."company_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."confirmation_requests" TO "anon";
GRANT ALL ON TABLE "public"."confirmation_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."confirmation_requests" TO "service_role";



GRANT ALL ON TABLE "public"."contact_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."contact_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."customer_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."customer_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_inquiries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customer_inquiries_inquiry_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customer_inquiries_inquiry_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customer_inquiries_inquiry_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exchange_rates" TO "anon";
GRANT ALL ON TABLE "public"."exchange_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."exchange_rates" TO "service_role";



GRANT ALL ON TABLE "public"."factory_contact_requests" TO "anon";
GRANT ALL ON TABLE "public"."factory_contact_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."factory_contact_requests" TO "service_role";



GRANT ALL ON TABLE "public"."faqs" TO "anon";
GRANT ALL ON TABLE "public"."faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."faqs" TO "service_role";



GRANT ALL ON TABLE "public"."guest_tokens" TO "anon";
GRANT ALL ON TABLE "public"."guest_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."guest_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."hs_code_aliases" TO "anon";
GRANT ALL ON TABLE "public"."hs_code_aliases" TO "authenticated";
GRANT ALL ON TABLE "public"."hs_code_aliases" TO "service_role";



GRANT ALL ON TABLE "public"."hs_codes" TO "anon";
GRANT ALL ON TABLE "public"."hs_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."hs_codes" TO "service_role";



GRANT ALL ON TABLE "public"."hs_codes_hierarchy" TO "anon";
GRANT ALL ON TABLE "public"."hs_codes_hierarchy" TO "authenticated";
GRANT ALL ON TABLE "public"."hs_codes_hierarchy" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hs_codes_hierarchy_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hs_codes_hierarchy_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hs_codes_hierarchy_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hs_codes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hs_codes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hs_codes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."hs_search_logs" TO "anon";
GRANT ALL ON TABLE "public"."hs_search_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."hs_search_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hs_search_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hs_search_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hs_search_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inspection_applications" TO "anon";
GRANT ALL ON TABLE "public"."inspection_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."inspection_applications" TO "service_role";



GRANT ALL ON TABLE "public"."inspection_reports" TO "anon";
GRANT ALL ON TABLE "public"."inspection_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."inspection_reports" TO "service_role";



GRANT ALL ON TABLE "public"."market_research_costs" TO "anon";
GRANT ALL ON TABLE "public"."market_research_costs" TO "authenticated";
GRANT ALL ON TABLE "public"."market_research_costs" TO "service_role";



GRANT ALL ON TABLE "public"."market_research_products" TO "anon";
GRANT ALL ON TABLE "public"."market_research_products" TO "authenticated";
GRANT ALL ON TABLE "public"."market_research_products" TO "service_role";



GRANT ALL ON TABLE "public"."market_research_requests" TO "anon";
GRANT ALL ON TABLE "public"."market_research_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."market_research_requests" TO "service_role";



GRANT ALL ON TABLE "public"."market_research_samples" TO "anon";
GRANT ALL ON TABLE "public"."market_research_samples" TO "authenticated";
GRANT ALL ON TABLE "public"."market_research_samples" TO "service_role";



GRANT ALL ON TABLE "public"."market_research_suppliers" TO "anon";
GRANT ALL ON TABLE "public"."market_research_suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."market_research_suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."notices" TO "anon";
GRANT ALL ON TABLE "public"."notices" TO "authenticated";
GRANT ALL ON TABLE "public"."notices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."price_calculations" TO "anon";
GRANT ALL ON TABLE "public"."price_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."price_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."process_logs" TO "anon";
GRANT ALL ON TABLE "public"."process_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."process_logs" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_items" TO "anon";
GRANT ALL ON TABLE "public"."purchase_items" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_items" TO "service_role";



GRANT ALL ON TABLE "public"."purchasing_orders" TO "anon";
GRANT ALL ON TABLE "public"."purchasing_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."purchasing_orders" TO "service_role";



GRANT ALL ON TABLE "public"."sample_items" TO "anon";
GRANT ALL ON TABLE "public"."sample_items" TO "authenticated";
GRANT ALL ON TABLE "public"."sample_items" TO "service_role";



GRANT ALL ON TABLE "public"."sample_orders" TO "anon";
GRANT ALL ON TABLE "public"."sample_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."sample_orders" TO "service_role";



GRANT ALL ON TABLE "public"."sampling_orders" TO "anon";
GRANT ALL ON TABLE "public"."sampling_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."sampling_orders" TO "service_role";



GRANT ALL ON TABLE "public"."search_cache" TO "anon";
GRANT ALL ON TABLE "public"."search_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."search_cache" TO "service_role";



GRANT ALL ON TABLE "public"."search_feedback" TO "anon";
GRANT ALL ON TABLE "public"."search_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."search_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_addresses" TO "anon";
GRANT ALL ON TABLE "public"."shipping_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_agency_orders" TO "anon";
GRANT ALL ON TABLE "public"."shipping_agency_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_agency_orders" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_items" TO "anon";
GRANT ALL ON TABLE "public"."shipping_items" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_items" TO "service_role";



GRANT ALL ON TABLE "public"."tariff_cache" TO "anon";
GRANT ALL ON TABLE "public"."tariff_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."tariff_cache" TO "service_role";



GRANT ALL ON TABLE "public"."uploaded_files" TO "anon";
GRANT ALL ON TABLE "public"."uploaded_files" TO "authenticated";
GRANT ALL ON TABLE "public"."uploaded_files" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_shipping_addresses" TO "anon";
GRANT ALL ON TABLE "public"."user_shipping_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_shipping_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_events" TO "anon";
GRANT ALL ON TABLE "public"."workflow_events" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_events" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
