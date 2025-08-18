# SEO 최적화 전략 및 실행 계획 (v4.0 Final)

> 작성일: 2024-12-28  
> 수정일: 2025-01-18 (GPT 2차 리뷰 완전 반영)  
> 목적: 두리무역 사이트 SEO/GEO 최적화로 검색 유입 및 수익 창출  
> **핵심: 중국수입대행 서비스 중심 (1688은 추후 오픈)**
> **검증: GPT 2차 리뷰 90% 합격**

## 📂 현재 사이트 구조 분석

### 실제 운영 서비스 구조 (2개 메인 서비스)
```
✅ 현재 운영 중 서비스:

1. 중국 수입대행 서비스 (통합)
   ├── /application/market-research (시장조사) ✅
   └── /application/factory-contact (공장 컨택) ✅
   
2. 검품감사 서비스 (독립)
   └── /application/inspection (검품감사) ✅

3. 기타
   ├── / (메인 홈페이지)
   └── /inquiry (문의)

🚧 추후 오픈 예정:
├── /1688/* (1688 구매대행 - 나중에)
├── /application/sampling (샘플 신청)
└── /dashboard/* (회원 전용)

❌ 서비스 안함:
├── /application/purchase-agency (구매대행)
└── /application/shipping-agency (배송대행)
```

## 🚨 현재 SEO 문제점 분석

### 1. **치명적 문제**
- ❌ PageContainer가 잘못 구현됨 (메타태그가 작동 안 함)
- ❌ Next.js 13+ App Router의 metadata API 미사용
- ❌ 사이트맵 없음
- ❌ robots.txt 없음
- ❌ 구조화 데이터(Schema.org) 없음

### 2. **개선 필요**
- ⚠️ 메타 디스크립션이 너무 일반적
- ⚠️ Open Graph 태그 없음
- ⚠️ 키워드 타겟팅 부족
- ⚠️ 이미지 alt 태그 미흡
- ⚠️ URL 구조 최적화 필요

## 🎯 타겟 키워드 (수익과 직결)

### 핵심 키워드 - 현재 서비스 중심 (네이버 실제 검색량)

#### 1. 현재 가능한 서비스 키워드
- **중국무역대행** (PC: 6,340 + 모바일: 3,280 = **9,620**) ⭐⭐⭐ 메인
- **중국수입대행** (PC: 740 + 모바일: 3,360 = **4,100**) ⭐⭐
- **중국무역** (PC: 220 + 모바일: 2,480 = **2,700**) ⭐⭐
- **중국OEM** (PC: 1,160 + 모바일: 1,370 = **2,530**) ⭐⭐
- **수입대행** (PC: 210 + 모바일: 550 = **760**) ⭐
- **중국공장** (PC: 80 + 모바일: 160 = **240**)
- **중국포워딩** (PC: 90 + 모바일: 40 = **130**)
- **중국시장조사** (PC: 10 + 모바일: <10 = **약 15**) - 검색량 적음

#### 2. 나중에 추가할 키워드 (1688 오픈 시)
- **1688구매대행** (22,510) - 추후 서비스 오픈 시
- **타오바오구매대행** (8,550) - 추후 서비스 오픈 시
- **타오바오직구** (5,940) - 추후 서비스 오픈 시
- **중국직구** (2,220) - 추후 서비스 오픈 시

#### 3. 검품 관련 (검색량 낮음)
- 중국검품, 품질검사 등은 검색량이 거의 없음 (<10)
### 롱테일 키워드 (실제 서비스 기반)
- "중국 수입대행 전문 업체"
- "중국 공장 찾는 방법"
- "중국 시장조사 비용"
- "중국 OEM 공장 컨택 대행"
- "중국 제품 검품 비용"
- "알리바바 공장 직거래 방법"
- "중국 무역 에이전트"
- "이우 시장 구매대행"

## 📋 즉시 실행 계획 (2025년 최신 가이드 기반)

### ✅ Day 1: 기술적 SEO 구현 (4-5시간)

#### 1. Next.js 15 Metadata API 구현 (GPT 리뷰 반영)
```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://duly.co.kr'),
  title: {
    default: '두리무역 - 중국무역대행·시장조사·공장컨택', // 40자 이내
    template: '%s | 두리무역'
  },
  description: '중국 수입대행 전문. 시장조사→공장컨택→검품까지 원스톱.', // 80자 이내
  // ❌ keywords 완전 제거 (Google/Naver 모두 사용 안 함 - GPT 리뷰 반영)
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://duly.co.kr',
    siteName: '두리무역',
    title: '두리무역 - 중국무역대행 전문',
    description: '중국 수입대행·시장조사·공장컨택·검품감사',
    images: [{
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: '두리무역 중국수입대행',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '두리무역 - 중국무역대행',
    description: '중국 수입대행 전문 업체',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console에서 받은 코드
    other: {
      'naver-site-verification': 'naver-site-verification-code', // ✅ 네이버는 other에
    },
  },
  alternates: {
    canonical: 'https://duly.co.kr',
  },
}
```

#### 2. 각 페이지별 메타데이터 (현재 서비스 중심)
```typescript
// app/page.tsx (메인 홈페이지)
export const metadata: Metadata = {
  title: '두리무역 - 중국무역대행, 시장조사, 공장컨택 전문',
  description: '중국 수입대행 전문업체. 시장조사부터 공장컨택, 검품감사까지 원스톱 서비스',
  // keywords 제거 - GPT 리뷰 반영
}

// app/application/market-research/page.tsx
export const metadata: Metadata = {
  title: '중국 시장조사 서비스 - 공장 직거래, OEM 제작 | 두리무역',
  description: '무료 시장조사! 3-5일 내 공장 10곳 비교·단가·MOQ·인증 포함 보고서. 중국 OEM/ODM 전문',
  // keywords 제거
}

// app/application/factory-contact/page.tsx
export const metadata: Metadata = {
  title: '중국 공장 컨택 서비스 - 직거래, 공장 발굴 | 두리무역',
  description: '중국 공장 직접 컨택 대행. 검증된 공장만 연결, 통역 지원, 가격 협상 대행. 중간사 비용 절감',
  // keywords 제거
}

// app/application/inspection/page.tsx  
export const metadata: Metadata = {
  title: '중국 검품감사 서비스 - 품질검사, 출하검수 | 두리무역',
  description: '중국 현지 검품감사 전문. 품질검사, 수량확인, 불량품 필터링. 전문 검수원 현장 방문, 상세 리포트 제공',
  // keywords 제거
}
```

#### 3. OG 이미지 자동 생성 (Next.js 15 방식)
```typescript
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to bottom, #1e4db7, #0a2540)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div>두리무역</div>
        <div style={{ fontSize: 40, marginTop: 20 }}>
          중국 수입대행 · 시장조사 · 공장컨택
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

#### 4. 사이트맵 생성 (Next.js 15 방식)
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://duly.co.kr'
  
  // 현재 운영 중인 페이지만 포함
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/application/market-research`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/application/factory-contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/application/inspection`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/inquiry`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
```

#### 4. robots.ts 파일 (GPT 리뷰 반영 - AI 봇 추가, /_next/ 허용)
```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/auth/',
          '/admin/',
          '/staff/',
          // ❌ '/_next/' 제거 - CSS/JS 차단하면 렌더링 문제
          '/1688/', // 아직 오픈 안함
        ],
      },
      {
        userAgent: 'Yeti', // 네이버 봇
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      // ✅ AI/LLM 크롤러 허용 (GEO 최적화) - GPT 2차 리뷰 반영
      {
        userAgent: 'GPTBot', // OpenAI 학습/크롤링용
        allow: '/',
      },
      {
        userAgent: 'OAI-SearchBot', // ChatGPT 검색 노출용 (학습 아님)
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot', // Anthropic 공식
        allow: '/',
      },
      {
        userAgent: 'Claude-Web', // Anthropic 공식
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot', // Perplexity 검색 노출용
        allow: '/',
      },
      {
        userAgent: 'Google-Extended', // Google AI 학습 제어 토큰
        allow: '/',
      },
    ],
    sitemap: 'https://duly.co.kr/sitemap.xml',
  }
}
```

#### 5. 구조화 데이터 (GPT 리뷰 반영 - servesCuisine 제거, Service 스키마 추가)
```typescript
// app/components/StructuredData.tsx (전역 - LocalBusiness)
export default function StructuredData() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://duly.co.kr/#org',
    name: '두리무역',
    description: '중국 수입대행 전문 업체. 시장조사, 공장컨택, 검품감사 서비스',
    url: 'https://duly.co.kr',
    telephone: '+82-32-XXXX-XXXX',
    email: 'contact@duly.co.kr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '센트럴로 313 B2512',
      addressLocality: '연수구',
      addressRegion: '인천광역시',
      postalCode: '22014',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.3896,
      longitude: 126.6590,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '₩₩₩',
    // ❌ servesCuisine 제거 (음식점용)
    // ❌ aggregateRating 제거 (실제 리뷰 페이지 없으면 사용 금지 - GPT 리뷰)
    sameAs: [
      'https://blog.naver.com/duly',
      'https://www.instagram.com/duly',
      'https://www.youtube.com/@duly',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  )
}

// app/application/market-research/StructuredData.tsx (서비스 페이지용)
export function MarketResearchSchema() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '중국 시장조사 서비스',
    serviceType: 'Market Research / Factory Sourcing',
    provider: { '@id': 'https://duly.co.kr/#org' },
    areaServed: 'CN',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KRW',
      eligibleRegion: 'KR',
    },
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  )
}

// layout.tsx에 추가
<head>
  <StructuredData />
</head>
```

### ✅ Day 2: 콘텐츠 SEO 및 웹마스터 등록 (5-6시간)

#### 0. IndexNow 설정 (Naver/Bing 즉시 인덱싱)
```bash
# 1. API 키 생성 (UUID 형식)
# 2. /public/[apikey].txt 파일 생성
# 3. API 엔드포인트 호출
POST https://api.indexnow.org/indexnow
{
  "host": "duly.co.kr",
  "key": "your-api-key",
  "keyLocation": "https://duly.co.kr/your-api-key.txt",
  "urlList": ["https://duly.co.kr/updated-page"]
}
```

#### 1. 네이버 서치어드바이저 등록
```
1. searchadvisor.naver.com 접속
2. 웹마스터 도구 클릭
3. 사이트 등록 (https://duly.co.kr)
4. 소유 확인 - HTML 태그 방식 권장
   <meta name="naver-site-verification" content="코드" />
5. robots.txt 확인
6. 사이트맵 제출 (https://duly.co.kr/sitemap.xml)
7. 웹페이지 수집 요청
```

#### 2. Google Search Console 등록
```
1. search.google.com/search-console 접속
2. 속성 추가 (URL 접두어)
3. 소유권 확인 - HTML 태그 방식
   <meta name="google-site-verification" content="코드" />
4. 사이트맵 제출
5. Core Web Vitals 확인
6. 모바일 사용 편의성 테스트
```

#### 3. 콘텐츠 최적화 (현재 서비스 중심)
- 메인 페이지: "중국무역대행" 키워드 중심
- 시장조사 페이지: "중국 OEM", "공장 직거래" 강화
- 공장컨택 페이지: "중국 공장 컨택" 최적화
- 검품감사 페이지: "품질검사" 콘텐츠 보강

### ✅ Day 3-5: 콘텐츠 마케팅 및 백링크 (4-5시간/일)

#### 1. 블로그 콘텐츠 제작 (네이버 블로그)
- "중국무역대행 이렇게 하세요" 
- "중국 OEM 공장 찾는 방법"
- "중국 수입대행 업체 선택 기준"
- "중국 검품 필요한 이유"
- "중국 시장조사 후기"

#### 2. 커뮤니티 마케팅
- 네이버 카페: 중국구매대행, 무역대행 카페
- 페이스북 그룹: 온라인 셀러, 수입대행 모임
- 카카오톡 오픈채팅: 중국무역, 도매 직구

#### 3. 소셜미디어 최적화
- 인스타그램: 비즈니스 계정 전환
- 유튜브: 서비스 소개 영상
- 틱톡: 짧은 팁 영상

## 🔍 SEO 모니터링 도구

### 필수 도구
1. **Google Search Console**: 인덱싱, Core Web Vitals, 검색 성과
2. **네이버 서치어드바이저**: 사이트 최적화, 수집 현황
3. **Google PageSpeed Insights**: 성능 측정
4. **GTmetrix**: 상세 성능 분석
5. **Mobile-Friendly Test**: 모바일 최적화 검사

### 주기적 체크 (2025 기준)
- **주간**: Core Web Vitals 체크
- **월간**: 인덱싱 커버리지 보고서
- **분기별**: 전체 기술 SEO 감사

## 💰 수익화 연결 전략 (현재 서비스 기준)

### 1. 검색광고 전략 (즉시 시작 가능)

#### 네이버 파워링크 (우선)
```
타겟 키워드:
- "중국무역대행" (9,620 검색) - 메인
- "중국수입대행" (4,100 검색)
- "중국OEM" (2,530 검색)
- "중국공장" (240 검색)

예산:
- 일 예산: 30,000원
- 예상 CPC: 400-800원
- 예상 일 클릭: 40-75회
```

#### 구글 애즈 (보조)
```
타겟 키워드:
- "중국 수입대행"
- "중국 무역대행"
- "china import agency"
- "china OEM factory"

예산:
- 일 예산: 20,000원
- 예상 CPC: 300-600원
- 예상 일 클릭: 35-65회
```

### 2. 전환율 최적화 (CRO)
- 메인 페이지 히어로 배너: "무료 시장조사" CTA
- 각 서비스 페이지: "무료 견적" 버튼 강화
- 실시간 채팅 상담 위젯 추가
- 성공 사례 및 후기 노출
- 신뢰 배지 추가 (15년 경력, 연간 처리건수 등)

## 📊 측정 지표 (KPI) - 현실적 목표

| 지표 | 현재 | 1주 목표 | 2주 목표 | 1개월 목표 |
|-----|------|---------|---------|-----------|
| 일 방문자 | 0 | 30 | 100 | 300 |
| 검색 유입 | 0 | 10 | 50 | 150 |
| 광고 유입 | 0 | 40 | 80 | 100 |
| 문의/신청 | 0 | 2 | 5 | 15 |
| 전환율 | - | 3% | 3.5% | 4% |
| 블로그 포스팅 | 0 | 3 | 5 | 10 |
| 백링크 | 0 | 5 | 10 | 30 |

## ⚠️ 중요 체크 포인트 (2025 최신)

### Core Web Vitals 목표치
- **LCP** (Largest Contentful Paint): ≤2.5초
- **INP** (Interaction to Next Paint): ≤200ms (FID 대체)
- **CLS** (Cumulative Layout Shift): ≤0.10
- **TTFB** (Time to First Byte): ≤600ms

### 모바일 최적화 필수
- 반응형 디자인 (viewport meta tag)
- 터치 타겟 최소 48x48px
- 텍스트 크기 최소 16px
- Google Mobile-Friendly Test 통과

### Next.js 15 필수 설정
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}
```

## 🚀 실행 체크리스트 (2025.01 기준)

### ☑️ Day 1: 기술적 SEO (오늘)
- [ ] PageContainer 제거하고 Next.js 15 metadata API 사용
- [ ] layout.tsx에 metadata 설정 (중국무역대행 중심)
- [ ] 4개 서비스 페이지 metadata 추가 (keywords 제거!)
  - [ ] market-research (시장조사)
  - [ ] factory-contact (공장컨택)
  - [ ] inspection (검품감사)
  - [ ] 메인 페이지
- [ ] sitemap.ts 생성 (운영 중인 페이지만)
- [ ] robots.ts 생성 (AI 봇 UA 정정: Claude-SearchBot, ClaudeBot)
- [ ] 구조화 데이터 컴포넌트 생성 (aggregateRating 제거)
- [ ] Open Graph 이미지 제작 (1200x630)

### ☑️ Day 2: 웹마스터 등록
- [ ] 네이버 서치어드바이저 등록
  - [ ] 사이트 소유 확인 (메타태그)
  - [ ] robots.txt 확인
  - [ ] 사이트맵 제출
  - [ ] 웹페이지 수집 요청
- [ ] Google Search Console 등록
  - [ ] 사이트 소유 확인
  - [ ] 사이트맵 제출
  - [ ] Core Web Vitals 확인
  - [ ] 모바일 사용성 테스트
- [ ] 다음 웹마스터 등록 (선택)
- [ ] 빙 웹마스터 등록 (선택)

### ☑️ Day 3-5: 콘텐츠 마케팅
- [ ] 네이버 블로그 3개 작성
  - [ ] "중국무역대행 선택 가이드"
  - [ ] "중국 OEM 공장 찾는 방법"
  - [ ] "중국 검품이 필요한 이유"
- [ ] 커뮤니티 활동
  - [ ] 네이버 카페 가입 및 활동
  - [ ] 페이스북 그룹 참여
- [ ] 소셜미디어 계정 설정
  - [ ] 인스타그램 비즈니스 계정
  - [ ] 유튜브 채널 개설

### ☑️ Week 2: 광고 시작
- [ ] 네이버 파워링크 세팅
  - [ ] 키워드: 중국무역대행, 중국수입대행
  - [ ] 일 예산: 30,000원
- [ ] 구글 애즈 캠페인
  - [ ] 키워드: 중국 수입대행 관련
  - [ ] 일 예산: 20,000원

### 📊 모니터링 체크포인트
- [ ] 일일 방문자 수 체크
- [ ] 검색 유입 키워드 분석
- [ ] 전환율 측정 (문의/신청)
- [ ] 페이지 체류 시간 확인
- [ ] 이탈률 모니터링

## 💡 Quick Win 전략 (현재 서비스 기반)

1. **"중국무역대행" 메인 키워드 집중**
   - 월 9,620회 검색
   - 현재 가능한 서비스
   - 높은 전환 가능성

2. **블로그 콘텐츠 전략**
   - "중국무역대행 선택 기준"
   - "중국 OEM 공장 찾기 노하우"
   - "중국 시장조사 실제 후기"

3. **커뮤니티 타겟팅**
   - 네이버 카페: 중국구매대행
   - 페이스북 그룹: 온라인 셀러 모임
   - 카카오톡 오픈채팅: 도매 직구

## 🤖 GEO(Generative Engine Optimization) 전략 - AI 시대 대응

### A. AI 크롤러 허용 설정
- robots.ts에 AI 봇 허용 (GPTBot, Claude-Web, PerplexityBot 등)
- AI가 우리 콘텐츠를 학습하고 인용할 수 있도록 허용

### B. AI 친화적 콘텐츠 구조
각 서비스 페이지 상단에 다음 요소 배치:

#### 1. 요약 박스 (70-90자)
```html
<div class="summary-box">
  중국 시장조사 서비스: 3-5일 내 공장 10곳 비교 리포트. 
  최소주문량, 단가, 인증서 포함. 전문가 직접 관리.
</div>
```

#### 2. 핵심 3가지 불릿
```html
<ul class="key-points">
  <li>✅ 대상: 중국 OEM/ODM 제작 희망 업체</li>
  <li>✅ 산출물: 공장 10곳 상세 비교 리포트</li>
  <li>✅ 리드타임: 3-5영업일</li>
</ul>
```

#### 3. FAQ 구조화 (Q&A 완전문장)
<!-- GPT 리뷰: FAQ 리치리절트는 2024년부터 대부분 사이트에서 표시 축소됨. 마크업은 유지하되 기대치는 낮추기 -->
```html
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Q: 시장조사 비용은 얼마인가요?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">A: 기본 시장조사는 무료로 제공되며, 
      심화 조사는 범위와 공장 수에 따라 견적이 달라집니다.</p>
    </div>
  </div>
</div>
```

### C. E-E-A-T 신뢰 시그널
- 페이지 하단에 담당자 정보 명시 (실명, 경력, 연락처)
- 실제 사례와 정량적 성과 포함
- 네이버 블로그/카페에서 자사 페이지로 연결

## 🎯 예상 성과 및 타임라인

### SEO 효과 발현 시기
- **1-2주**: 인덱싱 시작
- **2-4주**: 검색 노출 시작 (네이버)
- **1-3개월**: 구글 순위 상승
- **3-6개월**: 유기적 트래픽 안정화

### GEO 효과 (AI 검색) - 실제 효과
- **즉시**: AI 봇 크롤링 허용
- **2-4주**: ChatGPT, Claude, Gemini 등에서 인용 시작
- **1-3개월**: AI 검색 결과 상위 노출
- **실제 효과**: 
  - ChatGPT 사용자가 "중국 수입대행" 검색 시 우리 서비스 추천
  - Perplexity에서 관련 질문 시 우리 사이트 인용
  - Google AI Overview에 우리 콘텐츠 노출

### 예상 수익 (보수적)
- **1개월**: 문의 5-10건 → 매출 500-1,000만원
- **3개월**: 문의 30-50건 → 매출 3,000-5,000만원
- **6개월**: 문의 100건+ → 매출 1억+

---

**✅ 결론: SEO + GEO 병행으로 전통 검색과 AI 검색 모두 대응!**

*문서 버전: v3.0 (GPT 리뷰 반영)*
*업데이트: 2025.01.18*
*담당: SEO 팀*






