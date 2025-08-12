# 🔧 운영 매뉴얼 (Operations Manual)
**두리무역 디지털 전환 플랫폼**

문서 버전: v1.0  
작성일: 2025-01-27  
작성자: 운영팀  
대상: 시스템 관리자, 운영팀

---

## 📑 목차
1. [운영 개요](#1-운영-개요)
2. [일상 운영 업무](#2-일상-운영-업무)
3. [시스템 모니터링](#3-시스템-모니터링)
4. [백업 및 복구](#4-백업-및-복구)
5. [성능 관리](#5-성능-관리)
6. [보안 관리](#6-보안-관리)
7. [문제 해결 가이드](#7-문제-해결-가이드)
8. [업데이트 및 패치](#8-업데이트-및-패치)
9. [재해 복구](#9-재해-복구)
10. [운영 체크리스트](#10-운영-체크리스트)

---

## 1. 운영 개요

### 1.1 시스템 구성
```
┌─────────────────────────────────────────────────┐
│             두리무역 ERP 시스템                    │
├─────────────────────────────────────────────────┤
│  Frontend: Next.js 15 on Vercel                │
│  Backend: Supabase (PostgreSQL + Realtime)     │
│  AI: OpenAI GPT-4                              │
│  Storage: Supabase Storage                     │
│  Monitoring: Vercel Analytics + Sentry         │
└─────────────────────────────────────────────────┘
```

### 1.2 운영팀 역할
| 역할 | 담당자 | 주요 업무 | 연락처 |
|------|--------|-----------|--------|
| 시스템 관리자 | 김OO | 인프라 관리 | 010-xxxx-xxxx |
| DB 관리자 | 이OO | 데이터베이스 | 010-xxxx-xxxx |
| 보안 담당자 | 박OO | 보안 모니터링 | 010-xxxx-xxxx |
| 운영 매니저 | 최OO | 전체 총괄 | 010-xxxx-xxxx |

### 1.3 운영 시간
- **정규 운영**: 평일 09:00 - 18:00
- **긴급 대응**: 24/7 (온콜 당직)
- **정기 점검**: 매주 일요일 02:00 - 06:00

---

## 2. 일상 운영 업무

### 2.1 일일 점검 사항
```bash
# 시스템 상태 확인
□ Vercel 대시보드 확인
□ Supabase 대시보드 확인
□ 에러 로그 확인
□ 성능 메트릭 확인
□ 백업 상태 확인
□ 디스크 용량 확인
□ API 응답 시간 확인
□ 실시간 채팅 동작 확인
```

### 2.2 주간 점검 사항
```bash
# 주간 리포트
□ 트래픽 분석
□ 에러 트렌드 분석
□ 성능 개선 사항 도출
□ 보안 이벤트 검토
□ 용량 계획 검토
□ 업데이트 계획 수립
```

### 2.3 월간 점검 사항
```bash
# 월간 종합 점검
□ SLA 달성률 확인
□ 용량 증설 필요성 검토
□ 보안 감사 수행
□ 백업 복구 테스트
□ 재해 복구 훈련
□ 운영 문서 업데이트
```

---

## 3. 시스템 모니터링

### 3.1 모니터링 대시보드

#### Vercel Dashboard
```
URL: https://vercel.com/[team]/[project]

주요 확인 사항:
- Function 실행 시간
- Edge 네트워크 상태
- 빌드 상태
- 에러율
- 트래픽 패턴
```

#### Supabase Dashboard
```
URL: https://app.supabase.com/project/[project-id]

주요 확인 사항:
- 데이터베이스 연결 수
- 쿼리 성능
- 스토리지 사용량
- Realtime 연결 상태
- API 요청 수
```

### 3.2 알림 설정
```yaml
# 알림 규칙
alerts:
  - name: "High Error Rate"
    condition: error_rate > 5%
    action: 
      - slack: "#ops-alerts"
      - email: "ops@duly.co.kr"
    
  - name: "Slow Response"
    condition: response_time > 3s
    action:
      - slack: "#ops-alerts"
      - sms: "on-call"
    
  - name: "Database Connection"
    condition: db_connections > 80%
    action:
      - email: "dba@duly.co.kr"
      - scale: "auto"
```

### 3.3 로그 관리
```bash
# 로그 수집 위치
- Application Logs: Vercel Functions Logs
- Database Logs: Supabase Dashboard > Logs
- Error Logs: Sentry Dashboard
- Access Logs: Vercel Analytics

# 로그 보관 정책
- 실시간 로그: 7일
- 에러 로그: 30일
- 감사 로그: 1년
- 보안 로그: 3년
```

---

## 4. 백업 및 복구

### 4.1 백업 정책
```bash
# 백업 스케줄
데이터베이스:
- 전체 백업: 매일 03:00
- 증분 백업: 매 4시간
- 트랜잭션 로그: 실시간

파일 스토리지:
- 전체 백업: 매주 일요일
- 증분 백업: 매일

코드 저장소:
- Git 자동 백업
- 태그별 아카이빙
```

### 4.2 백업 절차
```bash
# Supabase 데이터베이스 백업
# 1. 수동 백업 생성
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 백업 확인
ls -la *.sql

# 3. 안전한 저장소로 이동
aws s3 cp backup_*.sql s3://duly-backups/db/

# 4. 백업 무결성 검증
pg_restore --list backup_*.sql
```

### 4.3 복구 절차
```bash
# 데이터베이스 복구
# 1. 서비스 중단 공지
echo "Maintenance mode ON"

# 2. 현재 상태 백업
supabase db dump -f current_state.sql

# 3. 복구 실행
supabase db reset
psql -f backup_20250127.sql

# 4. 데이터 검증
SELECT COUNT(*) FROM inspection_applications;

# 5. 서비스 재개
echo "Maintenance mode OFF"
```

### 4.4 복구 시간 목표 (RTO/RPO)
| 구분 | RTO | RPO | 비고 |
|------|-----|-----|------|
| 전체 시스템 | 4시간 | 1시간 | 재해 복구 |
| 데이터베이스 | 2시간 | 15분 | 트랜잭션 로그 |
| 파일 스토리지 | 1시간 | 4시간 | 증분 백업 |
| 애플리케이션 | 30분 | 0분 | 코드 재배포 |

---

## 5. 성능 관리

### 5.1 성능 모니터링
```typescript
// 성능 메트릭 수집
const performanceMetrics = {
  // 페이지 로드 시간
  pageLoad: {
    target: 2000, // 2초
    warning: 3000, // 3초
    critical: 5000 // 5초
  },
  
  // API 응답 시간
  apiResponse: {
    target: 500, // 500ms
    warning: 1000, // 1초
    critical: 3000 // 3초
  },
  
  // 데이터베이스 쿼리
  dbQuery: {
    target: 100, // 100ms
    warning: 500, // 500ms
    critical: 1000 // 1초
  }
}
```

### 5.2 성능 최적화

#### 데이터베이스 최적화
```sql
-- 인덱스 상태 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- 느린 쿼리 확인
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- 인덱스 추가
CREATE INDEX idx_applications_status 
ON inspection_applications(status, created_at);
```

#### 캐싱 전략
```typescript
// Redis 캐싱 설정
const cacheConfig = {
  // 정적 데이터
  staticData: {
    ttl: 86400, // 24시간
    keys: ['company_list', 'service_types']
  },
  
  // 사용자 세션
  session: {
    ttl: 3600, // 1시간
    keys: ['user_profile', 'permissions']
  },
  
  // API 응답
  apiResponse: {
    ttl: 300, // 5분
    keys: ['dashboard_stats', 'recent_applications']
  }
}
```

### 5.3 용량 계획
```yaml
# 월별 증가율 모니터링
capacity_metrics:
  users:
    current: 1000
    growth_rate: 10% # 월
    threshold: 80%
    
  storage:
    current: 500GB
    growth_rate: 50GB # 월
    threshold: 90%
    
  database:
    current: 100GB
    growth_rate: 20GB # 월
    threshold: 85%
```

---

## 6. 보안 관리

### 6.1 보안 점검 항목
```bash
# 일일 보안 점검
□ 비정상 로그인 시도 확인
□ API 키 사용 패턴 분석
□ 파일 업로드 로그 검토
□ 권한 변경 이력 확인
□ 보안 패치 확인

# 주간 보안 점검
□ 취약점 스캔 실행
□ SSL 인증서 만료일 확인
□ 방화벽 규칙 검토
□ 접근 권한 감사
□ 보안 로그 분석
```

### 6.2 접근 제어
```typescript
// IP 화이트리스트 관리
const allowedIPs = {
  office: ['211.xxx.xxx.0/24'],
  admin: ['1.2.3.4', '5.6.7.8'],
  api: ['api.partner.com']
}

// 역할별 권한 매트릭스
const permissions = {
  admin: ['*'],
  korean_team: ['read', 'write', 'delete'],
  chinese_staff: ['read', 'write'],
  customer: ['read:own', 'write:own']
}
```

### 6.3 보안 사고 대응
```
보안 사고 대응 절차:

1. 탐지 (5분)
   └─ 알림 확인 → 심각도 판단

2. 격리 (15분)
   └─ 영향 범위 차단 → 증거 보존

3. 분석 (30분)
   └─ 원인 파악 → 대응 방안 수립

4. 복구 (1시간)
   └─ 시스템 복구 → 정상 확인

5. 사후 조치 (24시간)
   └─ 보고서 작성 → 재발 방지
```

---

## 7. 문제 해결 가이드

### 7.1 일반적인 문제와 해결

#### 서비스 접속 불가
```bash
# 1. Vercel 상태 확인
curl -I https://erp.duly.co.kr

# 2. DNS 확인
nslookup erp.duly.co.kr

# 3. SSL 인증서 확인
openssl s_client -connect erp.duly.co.kr:443

# 4. Vercel 배포 상태
vercel ls
vercel inspect [url]
```

#### 데이터베이스 연결 오류
```sql
-- 1. 연결 수 확인
SELECT count(*) FROM pg_stat_activity;

-- 2. 장기 실행 쿼리 확인
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- 3. 연결 종료
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid();
```

#### 성능 저하
```bash
# 1. CPU/메모리 사용률 확인
# Vercel Dashboard에서 확인

# 2. 느린 API 엔드포인트 확인
# Vercel Analytics에서 확인

# 3. 데이터베이스 쿼리 최적화
# Supabase Dashboard > Query Performance

# 4. 캐시 초기화
# Vercel Edge Cache 초기화
```

### 7.2 긴급 대응 연락망
```
1차 대응: 운영팀 당직자 (010-xxxx-xxxx)
2차 대응: 운영 매니저 (010-xxxx-xxxx)
3차 대응: CTO (010-xxxx-xxxx)

외부 지원:
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
```

---

## 8. 업데이트 및 패치

### 8.1 업데이트 정책
```yaml
update_policy:
  security_patches:
    schedule: "즉시 적용"
    approval: "운영팀장"
    
  minor_updates:
    schedule: "주간 점검 시"
    approval: "운영팀"
    
  major_updates:
    schedule: "월간 점검 시"
    approval: "CTO"
```

### 8.2 업데이트 절차
```bash
# 1. 업데이트 준비
git pull origin main
cd nextjs
yarn outdated

# 2. 의존성 업데이트
yarn upgrade-interactive

# 3. 테스트 실행
yarn test
yarn build

# 4. 스테이징 배포
vercel --target staging

# 5. 검증 후 프로덕션 배포
vercel --prod
```

### 8.3 롤백 계획
```bash
# 빠른 롤백 (Vercel)
vercel rollback [deployment-url]

# 데이터베이스 롤백
supabase migrations down
supabase migrations up [previous-version]
```

---

## 9. 재해 복구

### 9.1 재해 시나리오
| 시나리오 | 영향도 | RTO | 대응 절차 |
|---------|--------|-----|-----------|
| Vercel 장애 | 높음 | 30분 | 대체 리전 활성화 |
| Supabase 장애 | 치명적 | 2시간 | 백업 DB 활성화 |
| DDoS 공격 | 중간 | 15분 | WAF 규칙 적용 |
| 데이터 유실 | 치명적 | 4시간 | 백업 복구 |

### 9.2 재해 복구 절차
```
1. 상황 파악 (10분)
   ├─ 영향 범위 확인
   ├─ 심각도 결정
   └─ 대응팀 소집

2. 임시 조치 (30분)
   ├─ 서비스 격리
   ├─ 공지사항 게시
   └─ 대체 경로 활성화

3. 복구 작업 (2시간)
   ├─ 백업 데이터 준비
   ├─ 시스템 복구
   └─ 데이터 검증

4. 서비스 재개 (30분)
   ├─ 기능 테스트
   ├─ 점진적 오픈
   └─ 모니터링 강화

5. 사후 처리 (24시간)
   ├─ 원인 분석
   ├─ 개선 사항 도출
   └─ 문서 업데이트
```

---

## 10. 운영 체크리스트

### 10.1 일일 체크리스트
```markdown
## 오전 점검 (09:00)
- [ ] 야간 알림 확인
- [ ] 시스템 상태 대시보드 확인
- [ ] 백업 완료 여부 확인
- [ ] 에러 로그 검토
- [ ] 성능 메트릭 확인

## 오후 점검 (14:00)
- [ ] 실시간 모니터링
- [ ] 사용자 문의 대응
- [ ] 리소스 사용률 확인
- [ ] 보안 이벤트 확인

## 퇴근 전 점검 (18:00)
- [ ] 일일 리포트 작성
- [ ] 야간 당직 인수인계
- [ ] 예정된 작업 확인
- [ ] 알림 설정 확인
```

### 10.2 주간 체크리스트
```markdown
## 월요일
- [ ] 주말 이벤트 분석
- [ ] 주간 계획 수립

## 화요일
- [ ] 보안 패치 확인
- [ ] 성능 분석 리포트

## 수요일
- [ ] 백업 테스트
- [ ] 용량 사용률 점검

## 목요일
- [ ] 업데이트 계획 검토
- [ ] 문서 업데이트

## 금요일
- [ ] 주간 리포트 작성
- [ ] 차주 준비사항 점검
```

---

## 11. 성능 모니터링 전략 ⭐ (2025-01-27 추가)

### 11.1 핵심 성능 지표 (KPI)

#### 애플리케이션 성능
```typescript
// 목표 지표
const performanceTargets = {
  // 응답 시간
  api: {
    p50: 200,  // ms
    p95: 500,  // ms
    p99: 1000, // ms
  },
  // 페이지 로드
  web: {
    FCP: 1.5,  // First Contentful Paint (초)
    LCP: 2.5,  // Largest Contentful Paint (초)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1,  // Cumulative Layout Shift
  },
  // 가용성
  uptime: 99.9,  // %
};
```

#### 데이터베이스 성능
```sql
-- RLS 성능 모니터링
SELECT 
  schemaname,
  tablename,
  policyname,
  avg_time,
  calls
FROM pg_stat_statements
JOIN pg_policies ON true
WHERE query LIKE '%' || tablename || '%'
ORDER BY avg_time DESC
LIMIT 10;

-- 느린 쿼리 확인
SELECT 
  query,
  mean_time,
  calls,
  total_time
FROM pg_stat_statements
WHERE mean_time > 100  -- 100ms 이상
ORDER BY mean_time DESC;
```

### 11.2 실시간 모니터링 설정

#### Sentry 구성
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  
  // 성능 모니터링
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],
  
  // 민감한 정보 필터링
  beforeSend(event, hint) {
    // 개인정보 제거
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

#### Custom Metrics
```typescript
// lib/monitoring.ts
export function trackPerformance(
  metricName: string,
  value: number,
  tags?: Record<string, string>
) {
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(metricName, {
      value,
      ...tags,
    });
  }
  
  // Sentry
  const transaction = Sentry.getCurrentHub()
    .getScope()
    .getTransaction();
    
  if (transaction) {
    transaction.setMeasurement(metricName, value, 'millisecond');
  }
}

// 사용 예시
export async function fetchWithMetrics(url: string) {
  const start = performance.now();
  
  try {
    const response = await fetch(url);
    const duration = performance.now() - start;
    
    trackPerformance('api.response_time', duration, {
      endpoint: url,
      status: response.status.toString(),
    });
    
    return response;
  } catch (error) {
    trackPerformance('api.error', 1, {
      endpoint: url,
      error: error.message,
    });
    throw error;
  }
}
```

### 11.3 알림 설정

#### 임계값 기반 알림
```yaml
# monitoring-alerts.yml
alerts:
  - name: High API Response Time
    condition: api.p95 > 1000ms
    duration: 5m
    channels: [slack, email]
    
  - name: Database Connection Pool Exhausted
    condition: db.connections.active >= db.connections.max * 0.9
    duration: 1m
    channels: [slack, pagerduty]
    
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 3m
    channels: [slack, email, sms]
    
  - name: Low Disk Space
    condition: disk.usage > 90%
    duration: 10m
    channels: [email]
```

### 11.4 대시보드 구성

#### Grafana 대시보드 예시
```json
{
  "dashboard": {
    "title": "Duly ERP Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "targets": [{
          "expr": "histogram_quantile(0.95, api_response_time)"
        }]
      },
      {
        "title": "Active Users",
        "targets": [{
          "expr": "count(distinct(user_id))"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(http_requests_total{status=~'5..'}[5m])"
        }]
      },
      {
        "title": "Database Performance",
        "targets": [{
          "expr": "avg(pg_stat_statements_mean_time)"
        }]
      }
    ]
  }
}
```

---

## 📎 부록

### A. 유용한 스크립트
```bash
#!/bin/bash
# health-check.sh
# 시스템 상태 종합 점검

echo "=== 시스템 상태 점검 ==="
echo "시간: $(date)"

# API 상태
echo -n "API 상태: "
curl -s -o /dev/null -w "%{http_code}" https://erp.duly.co.kr/api/health

# 데이터베이스 상태
echo -n "DB 상태: "
supabase status | grep "API URL"

# 디스크 사용률
echo "스토리지: "
# Supabase Dashboard에서 확인

echo "=== 점검 완료 ==="
```

### B. 문제 해결 참고 자료
- Vercel 문서: https://vercel.com/docs
- Supabase 문서: https://supabase.com/docs
- Next.js 문서: https://nextjs.org/docs
- 내부 위키: https://wiki.duly.co.kr/ops

### C. 운영 도구
- 모니터링: Vercel Analytics, Supabase Dashboard
- 로그 분석: Sentry, Vercel Logs
- 알림: Slack, Email, SMS
- 문서: Notion, GitHub Wiki

---

**문서 승인**

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 작성 | 운영팀 | | 2025-01-27 |
| 검토 | 운영 매니저 | | |
| 승인 | CTO | | |

---

*본 문서는 두리무역 디지털 전환 플랫폼의 운영 가이드입니다.*