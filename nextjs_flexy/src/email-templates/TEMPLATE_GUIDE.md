# 📧 이메일 템플릿 가이드

## 📌 템플릿 파일 목록

1. **invite-user-template.html** - 사용자 초대
2. **confirm-signup-template.html** - 회원가입 확인 (OTP)
3. **magic-link-template.html** - 매직링크 로그인 (OTP)
4. **change-email-template.html** - 이메일 변경
5. **reset-password-template.html** - 비밀번호 재설정

## 🎨 각 템플릿 특징

### 1. 초대 이메일 (invite-user)
- **아이콘**: ✉️ (파란색 배경)
- **용도**: 관리자가 새 사용자를 초대할 때
- **변수**: `{{ .ConfirmationURL }}`

### 2. 회원가입 확인 (confirm-signup)
- **아이콘**: ✓ (초록색 배경)
- **용도**: 회원가입 시 이메일 인증
- **변수**: `{{ .Token }}` (6자리 인증번호)
- **특징**: OTP 방식 지원

### 3. 매직링크 로그인 (magic-link)
- **아이콘**: 🔮 (보라색 배경)
- **용도**: 비밀번호 없이 로그인
- **변수**: `{{ .Token }}` (6자리 인증번호)
- **특징**: OTP 방식 지원

### 4. 이메일 변경 (change-email)
- **아이콘**: 📧 (주황색 배경)
- **용도**: 이메일 주소 변경 확인
- **변수**: `{{ .Token }}` (6자리 인증번호)

### 5. 비밀번호 재설정 (reset-password)
- **아이콘**: 🔑 (빨간색 배경)
- **용도**: 비밀번호 찾기/재설정
- **변수**: `{{ .Token }}` (6자리 인증번호)

## 🚀 Supabase 적용 방법

### 1. Supabase Dashboard 접속
1. Authentication → Email Templates
2. 각 템플릿 유형 선택

### 2. 템플릿 복사
1. 해당 HTML 파일 내용 전체 복사
2. Supabase 템플릿 에디터에 붙여넣기
3. Save 클릭

### 3. 중요 변수 확인
```html
<!-- OTP 인증번호 -->
{{ .Token }}

<!-- 확인 URL (초대 이메일용) -->
{{ .ConfirmationURL }}

<!-- Supabase 필수 요소 (숨김 처리) -->
<div style="display: none;">
  <a href="{{ .ConfirmationURL }}">{{ .Token }}</a>
</div>
```

## ⚙️ OTP 설정

### Supabase에서 OTP 활성화
1. Authentication → Providers → Email
2. "Enable Email Provider" 체크
3. "Enable OTP" 옵션 활성화 ✅

### 코드 예시
```typescript
// OTP로 회원가입
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    shouldCreateUser: true, // 새 사용자 생성
  }
})

// OTP 확인
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456', // 6자리 인증번호
  type: 'signup' // 또는 'magiclink', 'recovery' 등
})
```

## 📝 템플릿 수정 시 주의사항

1. **변수 유지**: `{{ .Token }}`, `{{ .ConfirmationURL }}` 등 변수 삭제 금지
2. **인라인 CSS**: 이메일 클라이언트 호환성을 위해 인라인 스타일 사용
3. **이미지**: 외부 이미지 링크 대신 이모지 사용 권장
4. **폰트**: 시스템 폰트 사용 (웹폰트 미지원)
5. **너비**: 최대 600px 권장

## 🧪 테스트 방법

1. Supabase Dashboard → Authentication → Users
2. "Add user" → "Send invitation email"
3. 각 템플릿별 이메일 수신 확인
4. 스팸함 확인

---

*템플릿 업데이트: 2025-01-30*