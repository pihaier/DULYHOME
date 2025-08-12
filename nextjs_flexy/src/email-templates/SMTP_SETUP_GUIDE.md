# Google Workspace SMTP 설정 가이드 - 두리무역

## 📧 현재 상황
- **현재 이메일**: duly@duly.co.kr (Google Workspace 그룹 메일)
- **필요사항**: 자동 이메일 발송을 위한 SMTP 설정

## 🎯 권장 솔루션

### 1. **전용 서비스 계정 생성 (권장)**
Google Workspace에서 자동 이메일 전용 계정을 생성하는 것이 가장 안전하고 관리하기 쉽습니다.

```
예시: noreply@duly.co.kr 또는 system@duly.co.kr
비용: 기본 사용자당 $6/월 (약 8,000원)
```

**장점:**
- 그룹 메일과 별도로 관리
- 앱 비밀번호 설정 가능
- 일일 2,000건 발송 가능
- 보안 강화

### 2. **Google Workspace SMTP Relay 설정**

#### 설정 단계:
1. Google Admin Console 접속
2. 앱 → Google Workspace → Gmail → 라우팅
3. SMTP 릴레이 서비스 구성

#### SMTP 서버 정보:
```env
# Supabase .env.local 설정
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587  # TLS 사용 시
SMTP_USER=noreply@duly.co.kr
SMTP_PASS=앱_비밀번호
SMTP_FROM=두리무역 <noreply@duly.co.kr>
```

#### 발송 한도:
- **SMTP Relay**: 일일 10,000건
- **Gmail SMTP**: 일일 2,000건

### 3. **무료 대안 (제한적)**

#### A. Resend (https://resend.com)
```env
# 무료: 매월 3,000건, 일일 100건
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**장점:**
- 빠른 설정
- React Email 템플릿 지원
- 상세한 분석

#### B. SendGrid (https://sendgrid.com)
```env
# 무료: 일일 100건
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

**장점:**
- 높은 전달률
- 상세한 로그

## 🛠️ Supabase 설정 방법

### 1. Supabase Dashboard에서 설정
```sql
-- 1. 인증 → 이메일 템플릿 → SMTP 설정 활성화
-- 2. 다음 정보 입력:

Host: smtp-relay.gmail.com
Port: 587
Username: noreply@duly.co.kr
Password: [앱 비밀번호]
Sender email: noreply@duly.co.kr
Sender name: 두리무역
```

### 2. Google Workspace 앱 비밀번호 생성
1. Google 계정 설정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. "메일" 선택 후 생성

### 3. 환경변수 설정 (Next.js)
```typescript
// /src/lib/email/sendEmail.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(to: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: '두리무역 <noreply@duly.co.kr>',
    to,
    subject: '두리무역 인증번호',
    html: /* 템플릿 HTML */
  });
}
```

## 💰 비용 비교

| 서비스 | 무료 한도 | 유료 요금 | 권장 사용 |
|--------|----------|-----------|-----------|
| Google Workspace 추가 계정 | - | $6/월 | ✅ 권장 (안정적) |
| Resend | 3,000/월 | $20/월 (10,000건) | 소규모 시작 |
| SendGrid | 100/일 | $19.95/월 (50,000건) | 대량 발송 |
| Amazon SES | 62,000/월 (EC2) | $0.10/1,000건 | 개발자 친화적 |

## 🚨 보안 권장사항

1. **전용 계정 사용**: 메인 이메일과 분리
2. **앱 비밀번호**: 일반 비밀번호 대신 사용
3. **SPF/DKIM 설정**: 스팸 방지
4. **발송 한도 모니터링**: 일일 한도 추적
5. **로그 기록**: 모든 이메일 발송 기록

## 📋 체크리스트

- [ ] Google Workspace 전용 계정 생성 (noreply@duly.co.kr)
- [ ] 2단계 인증 활성화
- [ ] 앱 비밀번호 생성
- [ ] Supabase SMTP 설정
- [ ] SPF/DKIM 레코드 설정
- [ ] 테스트 이메일 발송
- [ ] 프로덕션 환경변수 설정

## 🎯 추천 설정

**즉시 시작 (무료):**
1. Resend 가입 → API 키 발급
2. Supabase에서 Resend 연동
3. 월 3,000건까지 무료 사용

**장기적 안정성 (유료):**
1. Google Workspace에 noreply@duly.co.kr 추가
2. SMTP Relay 설정
3. 일일 10,000건까지 발송 가능

---

*참고: 그룹 메일(duly@duly.co.kr)은 SMTP 인증에 직접 사용할 수 없으므로, 전용 계정 생성을 권장합니다.*