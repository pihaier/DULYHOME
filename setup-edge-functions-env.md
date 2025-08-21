# Edge Functions 환경변수 설정 가이드

## 필요한 환경변수

Edge Functions가 작동하려면 Supabase 프로젝트에 다음 환경변수들이 설정되어야 합니다:

### 1. DAJI API 관련
```bash
DAJI_APP_KEY=your_daji_app_key
DAJI_APP_SECRET=your_daji_app_secret
```

### 2. OpenAI API (번역용)
```bash
OPENAI_API_KEY=your_openai_api_key
```

### 3. Alibaba Cloud (이미지 번역용)
```bash
ALIBABA_ACCESS_KEY_ID=your_alibaba_access_key
ALIBABA_ACCESS_KEY_SECRET=your_alibaba_secret
```

## 설정 방법

### 방법 1: Supabase Dashboard에서 설정
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (fzpyfzpmwyvqumvftfbr)
3. Settings → Edge Functions
4. Environment Variables 섹션에서 추가

### 방법 2: Supabase CLI로 설정
```bash
# 프로젝트 루트에서
npx supabase secrets set DAJI_APP_KEY=your_key
npx supabase secrets set DAJI_APP_SECRET=your_secret
npx supabase secrets set OPENAI_API_KEY=your_openai_key
```

## 현재 문제

500 에러가 발생하는 이유는 Edge Function에 DAJI API 키가 설정되지 않았기 때문입니다.
Edge Function 로그를 확인하면 다음과 같은 에러가 표시될 것입니다:
- "DAJI_APP_KEY is not defined"
- "DAJI_APP_SECRET is not defined"

## 해결 방법

1. DAJI API 키를 받아야 합니다 (https://openapi.dajisaas.com)
2. Supabase Dashboard에서 환경변수 설정
3. Edge Function 재배포 (자동으로 됨)

## 임시 해결책

개발 중에는 목업 데이터를 사용하도록 Edge Function을 수정할 수 있습니다.