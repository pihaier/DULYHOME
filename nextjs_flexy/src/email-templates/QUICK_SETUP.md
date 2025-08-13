# 🚀 빠른 SMTP 설정 가이드 - system@duly.co.kr

## ✅ 현재 상황

- **생성 완료**: system@duly.co.kr 계정
- **SMTP 릴레이**: Google Workspace Admin에서 설정 중

## 📋 남은 설정 단계

### 1. Google 계정에서 앱 비밀번호 생성

1. https://myaccount.google.com 접속
2. **system@duly.co.kr**로 로그인
3. 보안 → 2단계 인증 활성화
4. 보안 → 앱 비밀번호 → 새로 만들기
5. "메일" 선택 → 생성
6. 16자리 비밀번호 복사 (띄어쓰기 제거)

### 2. Supabase Dashboard 설정

1. Supabase 프로젝트 → Authentication → Email Templates
2. "Enable Custom SMTP" 켜기
3. 다음 정보 입력:

```
Sender email: system@duly.co.kr
Sender name: 두리무역
Host: smtp-relay.gmail.com
Port number: 587
Username: system@duly.co.kr
Password: ypcjypfijeebcjwp
```

### 3. 환경변수 설정 (.env.local)

```bash
# SMTP 설정
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_USER=system@duly.co.kr
SMTP_PASS=abcd efgh ijkl mnop  # 실제 앱 비밀번호로 교체 (띄어쓰기 제거)
SMTP_FROM_EMAIL=system@duly.co.kr
SMTP_FROM_NAME=두리무역
```

### 4. 테스트

Supabase Dashboard에서:

1. Authentication → Users
2. "Invite User" 클릭
3. 테스트 이메일 주소 입력
4. 이메일 수신 확인

## 🎯 체크리스트

- [x] system@duly.co.kr 계정 생성
- [x] Google Admin에서 SMTP 릴레이 설정
- [ ] 2단계 인증 활성화
- [ ] 앱 비밀번호 생성
- [ ] Supabase SMTP 설정
- [ ] 테스트 이메일 발송

## 💡 팁

- 앱 비밀번호는 한 번만 표시되니 안전한 곳에 저장
- 띄어쓰기 없이 16자리 모두 입력
- 테스트 후 정상 작동하면 프로덕션 환경변수도 업데이트

---

설정 완료까지 약 10분 소요
