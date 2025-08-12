# Supabase 전체 스키마 분석 보고서
생성일: 2025-01-12

## 📊 데이터베이스 규모
- 테이블: 44개
- 함수: 60개
- 트리거: 19개
- RLS 정책: 112개

## 🔍 핵심 문제 분석

### 1. user_profiles 테이블 문제
#### RLS 정책 충돌
- INSERT 정책 2개 (중복): public/authenticated 모두 `auth.uid() = user_id` 체크
- SELECT 정책 3개 (2개 중복)
- UPDATE 정책 3개 (2개 중복)
- **문제**: 트리거가 INSERT할 때 RLS 정책이 차단

#### 트리거 함수 오류
- `handle_new_user()` 함수가 이메일 가입을 처리하지 않음
- OAuth만 처리하도록 잘못된 조건문 사용

### 2. 중복 및 혼란스러운 구조
- public/authenticated 역할에 동일한 정책 중복
- 너무 많은 정책으로 관리 어려움

## 다음 단계: 전체 스키마 덤프 필요