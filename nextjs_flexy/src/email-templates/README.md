# 이메일 템플릿 설정 가이드

## 📧 Supabase 이메일 템플릿 설정 방법

### 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** 클릭

### 2. Email Templates 설정

1. **Authentication** → **Email Templates** 이동
2. **Magic Link** 템플릿 선택
3. `otp-template.html` 파일의 내용 복사
4. 템플릿 에디터에 붙여넣기
5. **Save** 클릭

### 3. Email Provider 설정

1. **Authentication** → **Providers** → **Email** 이동
2. 다음 설정 적용:
   - ✅ Enable Email provider
   - Email OTP Expiration: `600` (10분)
   - Email OTP Length: `6` (6자리)

### 4. SMTP 설정 (선택사항)

고급 이메일 설정을 원한다면:

1. **Settings** → **Auth** 이동
2. **SMTP Settings** 섹션에서:
   ```
   SMTP Host: smtp.gmail.com (예시)
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Pass: app-specific-password
   Sender email: noreply@duly.co.kr
   Sender name: 두리무역
   ```

## 📝 템플릿 파일 설명

### otp-template.html

- **용도**: OTP(6자리 인증번호) 이메일 템플릿
- **특징**:
  - 홈페이지와 동일한 디자인 언어 사용
  - 모바일 최적화
  - 스팸 필터 회피를 위한 인라인 CSS
  - 두리무역 브랜드 컬러 적용 (#1976d2)

## 🎨 템플릿 커스터마이징

### 색상 변경

```html
<!-- 메인 컬러 -->
color: #1976d2; → 원하는 색상으로 변경

<!-- 배경 그라데이션 -->
background: linear-gradient(135deg, rgba(25,118,210,0.1) 0%, ...);
```

### 로고 추가

```html
<!-- 텍스트 대신 이미지 로고 사용 -->
<img src="https://your-cdn.com/logo.png" alt="두리무역" style="height: 40px;" />
```

### 문구 수정

- `{{ .Token }}`: Supabase가 자동으로 6자리 코드로 대체
- `{{ .ConfirmationURL }}`: Magic Link URL (숨김 처리됨)

## ⚠️ 주의사항

1. **인라인 CSS 유지**: 외부 스타일시트는 많은 이메일 클라이언트에서 지원 안 됨
2. **이미지 최소화**: 텍스트 위주로 작성하여 스팸 필터 회피
3. **테스트 필수**: 다양한 이메일 클라이언트에서 테스트
   - Gmail, Outlook, Apple Mail, 모바일 등

## 🧪 테스트 방법

```typescript
// 테스트 코드
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'test@example.com',
  options: {
    shouldCreateUser: false,
  },
});
```

테스트 후 이메일이 정상적으로 도착하는지 확인하세요.
