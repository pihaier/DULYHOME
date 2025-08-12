# 🚀 배포 문서 (Deployment Guide)
**두리무역 디지털 전환 플랫폼**

문서 버전: v2.0  
작성일: 2025-01-27  
수정일: 2025-01-31 (Material UI v7 + Flexy 빌드 최적화 반영)  
작성자: DevOps팀  
관련문서: 08_TECH_ARCHITECTURE.md, 14_CODE_STANDARDS.md

---

## 📑 목차
1. [배포 아키텍처 개요](#1-배포-아키텍처-개요)
2. [환경 구성](#2-환경-구성)
3. [Vercel 배포 설정](#3-vercel-배포-설정)
4. [Supabase 연동](#4-supabase-연동)
5. [환경변수 관리](#5-환경변수-관리)
6. [CI/CD 파이프라인](#6-cicd-파이프라인)
7. [배포 절차](#7-배포-절차)
8. [모니터링 및 로깅](#8-모니터링-및-로깅)
9. [롤백 전략](#9-롤백-전략)
10. [보안 체크리스트](#10-보안-체크리스트)

---

## 1. 배포 아키텍처 개요

### 1.1 인프라 구성
```
┌─────────────────────────────────────────────────────────┐
│                     Production Environment               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐     ┌─────────────┐    ┌────────────┐ │
│  │   Vercel    │────▶│  Supabase   │────▶│  OpenAI   │ │
│  │  (Next.js)  │     │ (Database)  │    │  (GPT-4)  │ │
│  └─────────────┘     └─────────────┘    └────────────┘ │
│         │                    │                          │
│         │                    │                          │
│  ┌─────────────┐     ┌─────────────┐    ┌────────────┐ │
│  │   Vercel    │     │  Supabase   │    │   Email    │ │
│  │    Edge     │     │  Storage    │    │  Service   │ │
│  └─────────────┘     └─────────────┘    └────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택
- **호스팅**: Vercel (Next.js 15 최적화)
- **데이터베이스**: Supabase (PostgreSQL 15)
- **실시간**: Supabase Realtime
- **스토리지**: Supabase Storage
- **CDN**: Vercel Edge Network
- **모니터링**: Vercel Analytics + Supabase Dashboard

### 1.3 환경 구분
| 환경 | 용도 | URL | 브랜치 |
|------|------|-----|--------|
| Development | 개발 | http://localhost:3000 | feature/* |
| Staging | 테스트 | https://staging.duly-erp.vercel.app | develop |
| Production | 운영 | https://erp.duly.co.kr | main |

---

## 2. 환경 구성

### 2.1 사전 요구사항
```bash
# 필수 도구
- Node.js 20.x LTS
- Yarn 1.22.x
- Git 2.x
- Vercel CLI
- Supabase CLI

# 설치 명령어
npm install -g vercel
npm install -g supabase
```

### 2.2 프로젝트 구조
```
erp-custom/
├── nextjs/              # Next.js 애플리케이션
│   ├── src/            # 소스 코드
│   ├── public/         # 정적 파일
│   ├── package.json    # 의존성
│   └── next.config.ts  # Next.js 설정
├── supabase/           # Supabase 설정
│   ├── migrations/     # DB 마이그레이션
│   ├── functions/      # Edge Functions
│   └── config.toml     # Supabase 설정
└── .github/            # GitHub Actions
    └── workflows/      # CI/CD 워크플로우
```

---

## 3. Vercel 배포 설정

### 3.1 초기 설정
```bash
# 1. Vercel 로그인
vercel login

# 2. 프로젝트 연결
cd nextjs
vercel link

# 3. 프로젝트 설정
vercel --prod
```

### 3.2 vercel.json 설정
```json
{
  "framework": "nextjs",
  "buildCommand": "yarn build",
  "devCommand": "yarn dev",
  "installCommand": "yarn install",
  "outputDirectory": ".next",
  "regions": ["icn1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### 3.3 Next.js 설정 (Material UI v7 + Flexy 최적화)
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Material UI v7 최적화
  compiler: {
    emotion: true, // Emotion CSS-in-JS 최적화
  },
  
  // 이미지 최적화
  images: {
    domains: [
      'your-project-id.supabase.co',
      'lh3.googleusercontent.com', // Google OAuth
      'k.kakaocdn.net' // Kakao OAuth
    ],
    formats: ['image/avif', 'image/webp']
  },
  
  // Material UI + Flexy 성능 최적화
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled'
    ]
  },
  
  // 번들 최적화 (Material UI tree-shaking)
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@tabler/icons-react': {
      transform: '@tabler/icons-react/dist/esm/icons/{{member}}',
    },
  },
  
  // Flexy 커스텀 컴포넌트 경로 매핑
  async rewrites() {
    return [
      {
        source: '/components/:path*',
        destination: '/app/components/:path*',
      },
    ]
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Material UI 폰트 최적화
          {
            key: 'Link',
            value: '</fonts/Plus_Jakarta_Sans.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

---

## 4. Supabase 연동

### 4.1 프로젝트 연결 ✅ **해결 완료** (2025-01-27)

✅ **배포 성공**: https://nextjs-xi-sandy-93.vercel.app
- Vercel과 Supabase 연동 완료 및 검증 완료
- 62개 페이지 빌드 성공 (모든 API 라우트 정상 작동)
- 환경변수 동기화 완료 (Vercel-Supabase Integration 활용)
- 빌드 시간: 37초 완료

⚠️ **중요**: Vercel과 Supabase는 완전히 연동되어 정상 작동중입니다!
- Vercel Integration을 통해 자동으로 환경변수가 동기화됩니다
- 수동으로 환경변수를 중복 설정하지 마세요
- MCP 도구를 통해 시스템 통합 검증 완료

```bash
# Supabase CLI로 프로젝트 확인
supabase projects list

# 현재 연결 상태 확인 (정상 작동 확인됨)
supabase status
```

### 4.2 Vercel Integration 확인
1. Vercel Dashboard → Settings → Integrations
2. Supabase Integration 확인
3. 연동된 프로젝트 확인

### 4.3 데이터베이스 마이그레이션
```bash
# 로컬에서 마이그레이션 생성
supabase migration new create_tables

# 마이그레이션 적용
supabase db push

# 프로덕션 마이그레이션
supabase db push --linked
```

### 4.4 RLS 정책 확인
```sql
-- RLS 활성화 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 정책 테스트
SET ROLE authenticated;
SELECT * FROM inspection_applications;
```

---

## 5. 환경변수 관리

### 5.1 Vercel-Supabase 통합 환경변수 🎛️

**자동 동기화되는 환경변수:**
```
# Supabase Integration에서 자동 제공
NEXT_PUBLIC_SUPABASE_URL       ✅ 자동 동기화
NEXT_PUBLIC_SUPABASE_ANON_KEY  ✅ 자동 동기화
SUPABASE_SERVICE_ROLE_KEY      ✅ 자동 동기화
SUPABASE_JWT_SECRET            ✅ 자동 동기화
```

**수동 설정 필요 환경변수:**
```bash
# Vercel Dashboard에서 직접 설정
OPENAI_API_KEY=sk-...
EMAIL_SERVICE_API_KEY=...
EMAIL_FROM_ADDRESS=noreply@duly.co.kr

# 애플리케이션 설정
DAILY_RATE=290000
MARGIN_PERCENTAGE=50
MAX_FILE_SIZE=1073741824
ALLOWED_FILE_TYPES=image/*,application/pdf,application/msword,video/*
```

### 5.2 환경변수 설정 방법

#### Vercel Dashboard에서 설정
```bash
# CLI로 설정
vercel env add OPENAI_API_KEY production
vercel env add EMAIL_SERVICE_API_KEY production

# 혹은 Dashboard UI 사용:
# Settings → Environment Variables → Add New
```

#### 로컬 개발 환경
```bash
# .env.local 파일
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

### 5.3 환경변수 타입 정의
```typescript
// src/lib/types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase (자동 동기화)
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      
      // 외부 API
      OPENAI_API_KEY: string
      EMAIL_SERVICE_API_KEY: string
      EMAIL_FROM_ADDRESS: string
      
      // 애플리케이션 설정
      DAILY_RATE: string
      MARGIN_PERCENTAGE: string
      MAX_FILE_SIZE: string
      ALLOWED_FILE_TYPES: string
    }
  }
}
```

---

## 6. CI/CD 파이프라인

### 6.1 GitHub Actions 워크플로우 (Material UI 최적화)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production (Material UI + Flexy)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      
      - name: Install dependencies
        working-directory: ./nextjs_flexy
        run: yarn install --frozen-lockfile
      
      - name: Run linter
        working-directory: ./nextjs_flexy
        run: yarn lint
      
      - name: Type check
        working-directory: ./nextjs_flexy
        run: yarn type-check
      
      - name: Material UI component tests
        working-directory: ./nextjs_flexy
        run: yarn test:components
      
      - name: Run tests
        working-directory: ./nextjs_flexy
        run: yarn test:ci
      
      - name: Bundle size analysis
        working-directory: ./nextjs_flexy
        run: |
          yarn build
          yarn analyze-bundle
        env:
          NEXT_BUNDLE_ANALYZE: true
      
      - name: Check for unused Material UI components
        working-directory: ./nextjs_flexy
        run: yarn check-unused-deps

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      
      - name: Install dependencies
        working-directory: ./nextjs_flexy
        run: yarn install --frozen-lockfile
      
      - name: Build with Material UI optimization
        working-directory: ./nextjs_flexy
        run: |
          yarn build
        env:
          NEXT_BUNDLE_ANALYZE: false
          NODE_ENV: production
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./nextjs_flexy
      
      - name: Performance audit
        working-directory: ./nextjs_flexy
        run: yarn lighthouse:ci
        continue-on-error: true
```

### 6.2 브랜치 전략
```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/inspection-service
  │     ├── feature/import-agency
  │     └── feature/chat-system
  │
  └── hotfix/critical-bug
```

### 6.3 자동 배포 규칙
| 브랜치 | 환경 | 자동 배포 | URL |
|---------|------|-----------|-----|
| main | Production | ✅ | erp.duly.co.kr |
| develop | Staging | ✅ | staging.duly-erp.vercel.app |
| feature/* | Preview | ✅ | [branch].duly-erp.vercel.app |

---

## 7. 배포 절차

### 7.1 프로덕션 배포 체크리스트

#### 배포 전 확인
- [ ] 모든 테스트 통과
- [ ] 빌드 성공
- [ ] 환경변수 확인
- [ ] DB 마이그레이션 준비
- [ ] 백업 수행

#### 배포 명령
```bash
# 1. 코드 동기화
git checkout main
git pull origin main

# 2. 테스트 실행
cd nextjs
yarn test
yarn build

# 3. DB 마이그레이션
supabase db push --linked

# 4. 배포
vercel --prod

# 5. 배포 확인
vercel ls
vercel inspect [deployment-url]
```

### 7.2 배포 후 확인
- [ ] 사이트 접속 테스트
- [ ] 핵심 기능 동작 확인
- [ ] 성능 모니터링
- [ ] 에러 로그 확인
- [ ] 사용자 피드백 수집

### 7.3 긴급 롤백 절차
```bash
# 1. 이전 배포 확인
vercel ls

# 2. 롤백 실행
vercel rollback [deployment-url]

# 3. DB 롤백 (필요시)
supabase db reset --linked
supabase migrations up [previous-version] --linked
```

---

## 8. 모니터링 및 로깅

### 8.1 Vercel Analytics
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 8.2 에러 트래킹 (Sentry)
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // 민감한 정보 필터링
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  }
})
```

### 8.3 로그 수집
```typescript
// src/lib/monitoring/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data)
    // Vercel Logs에 자동 수집
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
    // Sentry로 자동 전송
    Sentry.captureException(error)
  },
  
  metric: (name: string, value: number) => {
    // Vercel Analytics 커스텀 메트릭
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', name, { value })
    }
  }
}
```

### 8.4 상태 모니터링 대시보드
| 메트릭 | 임계치 | 알림 |
|--------|---------|------|
| 응답 시간 | > 3s | Slack |
| 에러율 | > 1% | Email |
| CPU 사용률 | > 80% | Slack |
| 메모리 | > 90% | Email |

---

## 9. 롤백 전략

### 9.1 배포 전략
```
프로덕션 배포 프로세스:
1. Canary Deployment (10% 트래픽)
   │
   ├── 30분 모니터링
   │
2. 점진적 롤아웃 (50% → 100%)
   │
   ├── 1시간 모니터링
   │
3. 완전 배포
```

### 9.2 롤백 트리거
- 에러율 5% 초과
- 응답시간 50% 증가
- 크리티컬 에러 발생
- 비즈니스 로직 오류

### 9.3 롤백 체크리스트
- [ ] 에러 원인 파악
- [ ] 영향 범위 확인
- [ ] 롤백 결정
- [ ] 롤백 실행
- [ ] 사용자 공지
- [ ] 사후 분석

---

## 10. 보안 체크리스트

### 10.1 배포 전 보안 확인
- [ ] 환경변수 노출 검사
- [ ] API 키 로테이션
- [ ] 의존성 취약점 스캔
- [ ] HTTPS 강제
- [ ] CORS 설정 확인

### 10.2 보안 헤더 설정
```typescript
// 보안 헤더 미들웨어
export function securityHeaders(req: Request) {
  const headers = new Headers()
  
  // HSTS
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  
  // CSP
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )
  
  // XSS Protection
  headers.set('X-XSS-Protection', '1; mode=block')
  
  return headers
}
```

### 10.3 비밀 관리
```bash
# GitHub Secrets 설정
- VERCEL_TOKEN
- VERCEL_ORG_ID  
- VERCEL_PROJECT_ID
- OPENAI_API_KEY
- EMAIL_SERVICE_API_KEY

# 비밀 로테이션 주기
- API 키: 3개월
- 데이터베이스 비밀번호: 1개월
- OAuth 클라이언트 시크릿: 6개월
```

---

## 11. 배포 성공 및 검증 완료 🎉 (2025-01-27)

### 11.1 배포 성공 확인
✅ **프로덕션 배포 URL**: https://nextjs-xi-sandy-93.vercel.app

#### 배포 성공 지표
- **빌드 상태**: ✅ 성공 (62개 페이지)
- **빌드 시간**: 37초 (최적화됨)
- **API 라우트**: ✅ 모든 엔드포인트 정상 작동
- **환경변수**: ✅ Vercel-Supabase Integration으로 동기화 완료
- **데이터베이스**: ✅ 21개 테이블, 34개 마이그레이션 적용 완료

#### 시스템 통합 검증 (MCP 도구 활용)
- **Git 연동**: ✅ main 브랜치 최신 동기화
- **Vercel 연동**: ✅ 자동 배포 파이프라인 정상 작동  
- **Supabase 연동**: ✅ 데이터베이스 및 인증 서비스 정상 연결
- **GitHub 저장소**: ✅ https://github.com/pihaier/dulyerp-custom.git 정상 연결

### 11.2 Sprint 2 준비 완료
#### 개발 환경 안정화 (100% 완료)
- [x] 프로덕션 배포 성공
- [x] 모든 시스템 통합 완료
- [x] 개발 문서 정리 (project-docs 외부 MD 파일 정리)
- [ ] 환경변수 설정 완료
- [ ] 개발 준비 상태 검증

#### 다음 단계 계획
**Sprint 2 (2/10-2/21) 개발 목표:**
1. 인증 시스템 완성 (OAuth, MFA, 사용자 승인)
2. 검품 서비스 3종 구현 (품질검품, 공장감사, 로딩검품)
3. 기본 UI 컴포넌트 라이브러리 (shadcn/ui 기반 통합)

---

## 12. 프로덕션 배포 체크리스트 ⭐ (2025-01-27 추가)

### 11.1 성능 최적화
- [ ] RLS 정책 최적화 적용 (`SELECT auth.uid()` 래핑)
- [ ] 데이터베이스 인덱스 생성 완료
- [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] 코드 스플리팅 및 lazy loading 구현
- [ ] API 응답 캐싱 설정

### 11.2 보안 강화
- [ ] Rate Limiting 구현 및 테스트
- [ ] CSRF 보호 활성화
- [ ] 파일 업로드 검증 로직 구현
- [ ] SQL Injection 방지 확인
- [ ] XSS 방지 확인
- [ ] 환경 변수 암호화
- [ ] 보안 헤더 설정

### 11.3 모니터링 설정
- [ ] Sentry 에러 트래킹 설정
- [ ] Vercel Analytics 활성화
- [ ] Uptime 모니터링 설정
- [ ] 로그 수집 및 분석 도구 설정
- [ ] 성능 모니터링 대시보드 구성

### 11.4 백업 및 복구
- [ ] 데이터베이스 자동 백업 설정
- [ ] 백업 복구 테스트 완료
- [ ] 재해 복구 계획 문서화
- [ ] RTO/RPO 목표 설정

### 11.5 테스트
- [ ] 모든 단위 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 부하 테스트 완료
- [ ] 보안 취약점 스캔 완료
- [ ] 모바일 반응형 테스트

### 11.6 문서화
- [ ] API 문서 최신화
- [ ] 운영 매뉴얼 완료
- [ ] 장애 대응 매뉴얼 작성
- [ ] 변경 로그 업데이트

### 11.7 배포 준비
- [ ] 프로덕션 환경 변수 설정
- [ ] DNS 설정 완료
- [ ] SSL 인증서 설정
- [ ] CDN 구성
- [ ] 스테이징 환경 최종 테스트

---

## 📦 부록

### A. 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment process..."

# 1. 테스트 실행
echo "🧪 Running tests..."
cd nextjs
yarn test:ci

# 2. 빌드
echo "🏗️ Building application..."
yarn build

# 3. 마이그레이션
echo "🗄️ Applying database migrations..."
cd ..
supabase db push --linked

# 4. 배포
echo "🚀 Deploying to Vercel..."
cd nextjs
vercel --prod

echo "✅ Deployment completed!"
```

### B. 트러블슈팅 가이드

#### 배포 실패
```bash
# 빌드 로그 확인
vercel logs --output raw

# 환경변수 확인
vercel env ls

# 이전 배포로 롤백
vercel rollback
```

#### 성능 문제
```bash
# 함수 로그 확인
vercel logs --output json | jq '.[] | select(.level=="error")'

# 메트릭 확인
vercel inspect [deployment-url]
```

### C. 유용한 명령어
```bash
# Vercel
vercel --version          # 버전 확인
vercel whoami            # 로그인 확인
vercel ls                # 배포 목록
vercel logs             # 로그 확인
vercel env ls           # 환경변수 목록
vercel domains ls       # 도메인 목록

# Supabase
supabase status         # 연결 상태
supabase db diff       # DB 변경사항
supabase db push       # 마이그레이션 적용
supabase functions list # Edge Functions
```

---

**문서 승인**

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 작성 | DevOps팀 | | 2025-01-27 |
| 검토 | Tech Lead | | |
| 승인 | CTO | | |

---

## 13. Material UI v7 + Flexy 빌드 최적화 ⭐ NEW

### 13.1 Material UI 번들 최적화 전략
```json
// package.json - 번들 분석 스크립트
{
  "scripts": {
    "analyze": "ANALYZE=true yarn build",
    "analyze-bundle": "npx @next/bundle-analyzer",
    "check-unused-deps": "npx depcheck --ignore-bin-package",
    "lighthouse:ci": "lhci autorun"
  }
}
```

### 13.2 Emotion CSS-in-JS 빌드 최적화
```typescript
// next.config.ts - Emotion 최적화 설정
const nextConfig: NextConfig = {
  compiler: {
    emotion: {
      sourceMap: process.env.NODE_ENV === 'development',
      autoLabel: process.env.NODE_ENV === 'development' ? 'dev-only' : 'never',
      labelFormat: '[local]',
      importMap: {
        '@mui/material': {
          styled: {
            canonicalImport: ['@emotion/styled', 'default'],
            styledBaseImport: ['@mui/material', 'styled']
          }
        }
      }
    }
  }
}
```

### 13.3 Flexy 커스텀 컴포넌트 Tree-shaking
```typescript
// 자동 tree-shaking을 위한 import 최적화
// babel.config.js
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      'import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'core',
    ],
    [
      'import',
      {
        libraryName: '@mui/icons-material',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'icons',
    ],
  ],
}
```

### 13.4 성능 모니터링 (Material UI 특화)
```typescript
// 런타임 성능 측정
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Material UI 렌더링 성능 측정
export function measureMUIPerformance() {
  getCLS(console.log) // Cumulative Layout Shift
  getFID(console.log) // First Input Delay  
  getFCP(console.log) // First Contentful Paint
  getLCP(console.log) // Largest Contentful Paint
  getTTFB(console.log) // Time to First Byte
}

// MUI 테마 로딩 성능
performance.mark('mui-theme-start')
// 테마 적용
performance.mark('mui-theme-end')
performance.measure('mui-theme-duration', 'mui-theme-start', 'mui-theme-end')
```

### 13.5 빌드 최적화 체크리스트
- [ ] **번들 크기 분석**: Material UI 컴포넌트 사용량 확인
- [ ] **Tree-shaking 검증**: 사용하지 않는 MUI 컴포넌트 제거
- [ ] **Emotion 캐싱**: CSS-in-JS 스타일 캐싱 최적화
- [ ] **폰트 최적화**: Plus Jakarta Sans 폰트 프리로드
- [ ] **아이콘 최적화**: Tabler Icons tree-shaking 적용
- [ ] **테마 최적화**: 다크/라이트 모드 동적 로딩
- [ ] **코드 스플리팅**: Flexy 커스텀 컴포넌트 lazy loading

### 13.6 프로덕션 빌드 검증
```bash
# Material UI 빌드 검증 스크립트
#!/bin/bash

echo "🔍 Material UI 빌드 분석 시작..."

# 1. 번들 크기 분석
yarn analyze

# 2. 사용하지 않는 MUI 컴포넌트 검사
yarn check-unused-deps

# 3. Lighthouse 성능 테스트
yarn lighthouse:ci

# 4. 빌드 결과 검증
if [ -f ".next/static/chunks/pages/_app-*.js" ]; then
  echo "✅ Material UI 청크 생성 성공"
else
  echo "❌ Material UI 청크 생성 실패"
  exit 1
fi

echo "✅ Material UI 빌드 검증 완료"
```

---

## 📌 주요 변경사항 (v2.0 - 2025-01-31)

### Material UI v7 + Flexy 빌드 최적화 반영
1. **빌드 시스템 변경**:
   - Tailwind PostCSS 빌드 → Emotion CSS-in-JS 컴파일
   - Material UI Tree-shaking 최적화 추가
   - Flexy 커스텀 컴포넌트 번들링 최적화

2. **성능 최적화**:
   - `modularizeImports` 설정으로 MUI 컴포넌트 tree-shaking
   - Emotion 컴파일러 최적화로 런타임 성능 향상
   - Plus Jakarta Sans 폰트 프리로드

3. **CI/CD 개선**:
   - Material UI 컴포넌트 테스트 추가
   - 번들 크기 분석 자동화
   - Lighthouse 성능 감사 통합

4. **배포 경로 변경**:
   - `./nextjs` → `./nextjs_flexy` (Flexy 프로젝트)
   - MUI 특화 빌드 명령어 추가
   - 성능 모니터링 강화

5. **최적화 전략**:
   - CSS-in-JS 빌드타임 최적화
   - 12개 Flexy 커스텀 컴포넌트 lazy loading
   - 서비스별 색상 테마 동적 로딩

---

*본 문서는 두리무역 디지털 전환 플랫폼의 배포 가이드입니다.*  
*최종 수정: 2025-01-31 (Material UI v7 + Flexy 빌드 최적화 반영)*