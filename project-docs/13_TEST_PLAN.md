# 🧪 테스트 계획 (Test Plan)
**두리무역 디지털 전환 플랫폼**

문서 버전: v2.0  
작성일: 2025-01-27  
수정일: 2025-01-31 (Material UI v7 + Flexy 테스트 전략 반영)  
작성자: QA 팀  
기반문서: 07_REQUIREMENTS.md, 08_TECH_ARCHITECTURE.md, 14_CODE_STANDARDS.md

---

## 📑 목차
1. [테스트 개요](#1-테스트-개요)
2. [테스트 전략](#2-테스트-전략)
3. [테스트 범위](#3-테스트-범위)
4. [테스트 유형](#4-테스트-유형)
5. [테스트 환경](#5-테스트-환경)
6. [테스트 도구](#6-테스트-도구)
7. [테스트 시나리오](#7-테스트-시나리오)
8. [테스트 일정](#8-테스트-일정)
9. [리스크 및 대응](#9-리스크-및-대응)

---

## 1. 테스트 개요

### 1.1 목적
- 7개 서비스의 기능적 정확성 검증
- 다중 사용자 역할의 권한 체계 검증
- 실시간 기능의 안정성 확보
- 성능 및 보안 요구사항 충족 확인

### 1.2 테스트 목표
- **기능 커버리지**: 95% 이상
- **코드 커버리지**: 80% 이상
- **결함 밀도**: 1.0 이하/KLOC
- **테스트 자동화율**: 70% 이상

### 1.3 테스트 원칙
1. **Shift-Left**: 개발 초기부터 테스트 시작
2. **자동화 우선**: 반복 테스트는 자동화
3. **리스크 기반**: 중요도에 따른 우선순위
4. **지속적 통합**: CI/CD 파이프라인 통합

---

## 2. 테스트 전략

### 2.1 테스트 피라미드
```
         E2E 테스트 (10%)
        /             \
       통합 테스트 (30%)
      /               \
     단위 테스트 (60%)
    /                 \
```

### 2.2 테스트 접근법
| 테스트 수준 | 접근법 | 자동화 | 담당 |
|------------|--------|--------|------|
| 단위 | TDD | 100% | 개발자 |
| 통합 | API 우선 | 90% | 개발자 |
| E2E | 시나리오 기반 | 70% | QA |
| 성능 | 부하 테스트 | 80% | QA |
| 보안 | 취약점 스캔 | 60% | 보안팀 |

### 2.3 서비스별 중요도
| 서비스 | 중요도 | 테스트 집중도 | 이유 |
|--------|--------|--------------|------|
| 품질검품 | 최상 | 100% | 핵심 서비스 |
| 샘플/대량발주 | 최상 | 100% | 수익 직결 |
| 실시간 채팅 | 상 | 90% | 고객 소통 |
| 공장감사 | 상 | 90% | 품질 보증 |
| 시장조사 | 중 | 80% | 부가 서비스 |
| 구매대행 | 중 | 80% | 확장 서비스 |
| 배송대행 | 중 | 80% | 확장 서비스 |

---

## 3. 테스트 범위

### 3.1 포함 범위
#### 기능 테스트
- 7개 서비스 전체 워크플로우
- 6개 사용자 역할별 권한
- 실시간 채팅 및 번역
- 파일 업로드/다운로드
- 이메일 알림
- 보고서 생성

#### 비기능 테스트
- 성능 (응답시간, 처리량)
- 보안 (인증, 권한, 데이터 보호)
- 사용성 (UI/UX)
- 호환성 (브라우저, 디바이스)
- 신뢰성 (가용성, 복구)

### 3.2 제외 범위
- 타사 서비스 내부 로직 (OpenAI, Supabase)
- 레거시 시스템 마이그레이션
- 하드웨어 장애 테스트

---

## 4. 테스트 유형

### 4.1 단위 테스트 (Material UI v7 + Flexy)
```typescript
// Jest + React Testing Library + Material UI Testing Utils
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { dulyFlexyTheme } from '@/theme/dulyTheme';

// Flexy 커스텀 컴포넌트 테스트
describe('CustomTextField', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={dulyFlexyTheme}>
        {component}
      </ThemeProvider>
    );
  };

  it('should render with Flexy styling', () => {
    renderWithTheme(
      <CustomTextField 
        label="회사명"
        required
        data-testid="company-input"
      />
    );
    
    const input = screen.getByTestId('company-input');
    expect(input).toHaveClass('MuiTextField-root');
    expect(screen.getByText('회사명 *')).toBeInTheDocument();
  });

  it('should show validation error with MUI styling', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <ApplicationForm />
    );
    
    const submitButton = screen.getByRole('button', { name: '신청하기' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('필수 항목을 입력하세요')).toBeInTheDocument();
    });
  });
});

// Flexy 테마별 테스트
describe('Theme-based Components', () => {
  it('should render different colors for service types', () => {
    const { rerender } = renderWithTheme(
      <ServiceCard serviceType="inspection" />
    );
    expect(screen.getByTestId('service-card')).toHaveStyle({
      backgroundColor: '#1565C0' // DLKP 파란색
    });
    
    rerender(
      <ThemeProvider theme={dulyFlexyTheme}>
        <ServiceCard serviceType="import_agency" />
      </ThemeProvider>
    );
    expect(screen.getByTestId('service-card')).toHaveStyle({
      backgroundColor: '#2E7D32' // DLSY 초록색
    });
  });
});

// 비즈니스 로직 테스트 (기존 유지)
describe('Pricing Calculator', () => {
  it('should calculate correct pricing', () => {
    const result = calculatePrice(5, 'standard');
    expect(result.dailyRate).toBe(270000);
    expect(result.totalAmount).toBe(1350000);
  });
});
```

### 4.2 통합 테스트
```typescript
// API 통합 테스트
describe('Application API', () => {
  it('should create application with correct status', async () => {
    const response = await request(app)
      .post('/api/applications')
      .send(mockApplicationData)
      .expect(201);
    
    expect(response.body.status).toBe('submitted');
    expect(response.body.reservationNumber).toMatch(/^DL-\d{8}-\d{6}$/);
  });
});
```

### 4.3 E2E 테스트 (Flexy + Material UI)
```typescript
// Playwright E2E with Material UI selectors
test('complete inspection workflow with Flexy UI', async ({ page }) => {
  // 1. 고객 신청 (Flexy 폼 컴포넌트)
  await page.goto('/application/new');
  
  // Material UI TextField 선택자 사용
  await page.locator('[data-testid="company-input"] input').fill('테스트 회사');
  
  // MUI Select 컴포넌트 선택
  await page.locator('[data-testid="service-select"]').click();
  await page.locator('li[data-value="quality_inspection"]').click();
  
  // Flexy CustomButton 클릭
  await page.locator('button[type="submit"]:has-text("신청하기")').click();
  
  // 성공 스낵바 확인 (MUI Snackbar)
  await expect(page.locator('.MuiSnackbar-root')).toContainText('신청이 완료되었습니다');
  
  // 2. 직원 처리 (Flexy 대시보드)
  await page.goto('/dashboard');
  
  // Flexy DashboardCard 내 버튼 클릭
  await page.locator('[data-testid="dashboard-card"] button:has-text("새 신청 건")').click();
  
  // MUI Dialog에서 견적 발송
  await page.locator('button:has-text("견적 발송")').click();
  
  // 3. 결과 확인
  await expect(page).toHaveURL(/\/application\/DL-/);
  
  // MUI Chip 상태 확인
  await expect(page.locator('.MuiChip-root:has-text("견적발송")')).toBeVisible();
});

// Flexy 다크모드 E2E 테스트
test('dark mode functionality', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Flexy 커스터마이저 다크모드 토글
  await page.locator('[data-testid="theme-toggle"]').click();
  
  // 다크모드 적용 확인
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
  
  // MUI 컴포넌트 다크모드 스타일 확인
  const card = page.locator('[data-testid="dashboard-card"]');
  await expect(card).toHaveCSS('background-color', 'rgb(33, 37, 41)'); // 다크모드 배경색
});

// Flexy 반응형 테스트
test('responsive layout on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/dashboard');
  
  // 모바일에서 사이드바 토글 확인
  await page.locator('[data-testid="mobile-menu-toggle"]').click();
  await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
  
  // MUI Grid 반응형 확인
  const gridItem = page.locator('[data-testid="grid-item"]');
  await expect(gridItem).toHaveCSS('width', '100%'); // 모바일에서 전체 너비
});
```

### 4.4 성능 테스트
```javascript
// K6 부하 테스트
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const res = http.get('https://api.duly.co.kr/applications');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 4.5 Supabase RLS 테스트
```sql
-- pgTAP을 사용한 RLS 정책 테스트
begin;
select plan(5);

-- 테스트 헬퍼 설정
select tests.create_supabase_user('customer@test.com', 'customer');
select tests.create_supabase_user('staff@test.com', 'chinese_staff');

-- RLS 활성화 확인
select tests.rls_enabled('public');

-- 고객 권한 테스트
select tests.authenticate_as('customer@test.com');
select results_eq(
  'select count(*) from inspection_applications where user_id = auth.uid()',
  ARRAY[2::bigint],
  '고객은 자신의 신청만 볼 수 있다'
);

-- 직원 권한 테스트
select tests.authenticate_as('staff@test.com');
select lives_ok(
  $$update inspection_applications 
    set status = 'in_progress' 
    where assigned_chinese_staff = auth.uid()$$,
  '중국 직원은 배정된 신청을 업데이트할 수 있다'
);

-- 정책 확인
select policies_are(
  'public',
  'inspection_applications',
  ARRAY [
    'customers_own_data',
    'chinese_staff_assigned',
    'korean_team_all_access'
  ]
);

select * from finish();
rollback;
```

---

## 5. 테스트 환경

### 5.1 환경 구성
| 환경 | 용도 | 인프라 | 데이터 |
|------|------|--------|--------|
| Local | 개발 테스트 | Docker | Mock |
| Dev | 통합 테스트 | Vercel Preview | 테스트 데이터 |
| Staging | UAT | Vercel + Supabase | 실제 유사 |
| Production | 모니터링 | Vercel + Supabase | 실제 |

### 5.2 테스트 데이터
```typescript
// 테스트 데이터 생성
const testData = {
  users: {
    customer: { email: 'customer@test.com', role: 'customer' },
    chineseStaff: { email: 'staff@test.com', role: 'chinese_staff' },
    koreanTeam: { email: 'team@test.com', role: 'korean_team' },
  },
  applications: generateApplications(50),
  messages: generateChatMessages(200),
};
```

---

## 6. 테스트 도구

### 6.1 도구 스택 (Material UI v7 + Flexy 최적화)
| 카테고리 | 도구 | 용도 | Flexy 최적화 |
|----------|------|------|-------------|
| 단위 테스트 | Jest | JavaScript 테스트 | MUI 매처 추가 |
| 컴포넌트 테스트 | React Testing Library | React 컴포넌트 | MUI 컴포넌트 유틸 |
| UI 테스트 | @testing-library/jest-dom | DOM 매처 | MUI 스타일 검증 |
| 테마 테스트 | @mui/material/test-utils | MUI 테스트 유틸 | 테마 렌더링 |
| E2E 테스트 | Playwright | 브라우저 자동화 | MUI 선택자 최적화 |
| 시각적 테스트 | Percy/Chromatic | 시각적 회귀 | Flexy 컴포넌트 |
| API 테스트 | Supertest | HTTP 엔드포인트 | 기존 유지 |
| 성능 테스트 | K6 | 부하 테스트 | MUI 렌더링 성능 |
| 접근성 테스트 | @axe-core/playwright | a11y 검증 | MUI 접근성 |
| 보안 테스트 | OWASP ZAP | 취약점 스캔 | 기존 유지 |
| CI/CD | GitHub Actions | 자동화 파이프라인 | MUI 빌드 최적화 |

### 6.2 테스트 자동화 파이프라인 (Material UI v7 최적화)
```yaml
name: Test Pipeline (Flexy + MUI)
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Type checking
        run: yarn type-check
      
      - name: Unit tests (MUI 컴포넌트 포함)
        run: yarn test:unit --coverage
        env:
          NODE_ENV: test
      
      - name: Component tests (Flexy 커스텀 컴포넌트)
        run: yarn test:components
      
      - name: Integration tests
        run: yarn test:integration
      
      - name: Visual regression tests
        run: yarn test:visual
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
      
      - name: E2E tests (MUI 선택자)
        run: yarn test:e2e
        env:
          PLAYWRIGHT_BROWSERS_PATH: ~/.cache/ms-playwright
      
      - name: Accessibility tests
        run: yarn test:a11y
      
      - name: Bundle size analysis
        run: yarn analyze:bundle
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 7. 테스트 시나리오

### 7.1 핵심 시나리오

#### S01: 품질검품 신청 프로세스
```
1. 고객 로그인
2. 신규 검품 신청
3. 파일 업로드 (5개)
4. 중국 직원 자동 배정
5. 견적서 생성 및 발송
6. 고객 결제
7. 검품 일정 조율
8. 실시간 채팅 소통
9. 보고서 업로드
10. 최종 승인 및 전달
```

#### S02: 다국어 실시간 채팅
```
1. 한국 고객 입장 (한국어)
2. 중국 직원 입장 (중국어)
3. 메시지 자동 번역 확인
4. 파일 공유
5. 공장/검품원 초대 URL 생성
6. 게스트 접속 및 참여
```

#### S03: 권한 체계 검증
```
1. 각 역할별 로그인
2. 허용된 메뉴 접근 확인
3. 제한된 기능 차단 확인
4. 데이터 필터링 검증
```

### 7.2 서비스별 시나리오

| 서비스 | 시나리오 수 | 주요 검증 항목 |
|--------|------------|----------------|
| 품질검품 | 15 | 일정 조율, 보고서 품질 |
| 공장감사 | 12 | 체크리스트, 인증서 |
| 선적검품 | 10 | 수량 확인, 포장 상태 |
| 시장조사 | 8 | 리서치 품질, 데이터 정확성 |
| 샘플/대량발주 | 20 | 주문 프로세스, 결제 |
| 구매대행 | 10 | 공급업체 관리, 품질 보증 |
| 배송대행 | 8 | 물류 추적, 통관 |

---

## 8. 테스트 일정

### 8.1 스프린트별 테스트 활동
| 스프린트 | 주요 활동 | 산출물 |
|----------|-----------|--------|
| Sprint 1 | 테스트 환경 구축 | 테스트 인프라 |
| Sprint 2 | 단위 테스트 작성 | 80% 커버리지 |
| Sprint 3 | API 통합 테스트 | API 테스트 슈트 |
| Sprint 4 | E2E 시나리오 개발 | 자동화 스크립트 |
| Sprint 5 | 성능/보안 테스트 | 성능 보고서 |
| Sprint 6 | UAT 및 회귀 테스트 | 최종 승인 |

### 8.2 일일 테스트 활동
```
09:00 - 09:15: 테스트 스탠드업
09:15 - 12:00: 테스트 실행 및 결함 보고
13:00 - 15:00: 자동화 스크립트 개발
15:00 - 17:00: 테스트 결과 분석
17:00 - 18:00: 보고서 작성
```

---

## 9. 리스크 및 대응

### 9.1 테스트 리스크
| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|-----------|
| 테스트 데이터 부족 | 중 | 높음 | 자동 생성 도구 개발 |
| 실시간 기능 불안정 | 높음 | 높음 | Mock 서버 활용 |
| 브라우저 호환성 | 중 | 중 | 주요 브라우저 집중 |
| 테스트 자동화 지연 | 중 | 중 | 단계적 자동화 |

### 9.2 결함 관리
- **심각도 분류**: Critical > High > Medium > Low
- **우선순위**: P1 (즉시) > P2 (24시간) > P3 (스프린트 내) > P4 (다음 릴리즈)
- **종료 기준**: Critical 0개, High 5개 이하

### 9.3 테스트 메트릭
```typescript
// 주요 측정 지표
const metrics = {
  testCoverage: {
    unit: 85,      // 목표: 80%
    integration: 75, // 목표: 70%
    e2e: 65        // 목표: 60%
  },
  defectDensity: 0.8,  // 목표: 1.0 이하
  automationRate: 72,  // 목표: 70%
  passRate: 94        // 목표: 90%
};
```

---

## 📎 부록

### A. 테스트 케이스 템플릿
```markdown
**TC-001: 품질검품 신청**
- 전제조건: 승인된 고객 계정
- 테스트 단계:
  1. 로그인
  2. 신규 신청 클릭
  3. 필수 정보 입력
  4. 제출
- 예상 결과: 예약번호 생성, 상태 'submitted'
- 실제 결과: [기록]
- Pass/Fail: [결과]
```

### B. 결함 보고 템플릿
```markdown
**결함 ID**: BUG-001
**제목**: 채팅 메시지 번역 오류
**심각도**: High
**재현 단계**:
1. 중국어로 메시지 입력
2. 특수문자 포함
**예상 동작**: 정상 번역
**실제 동작**: 오류 발생
**환경**: Chrome 120, Windows 11
```

### C. 테스트 체크리스트
- [ ] 모든 API 엔드포인트 테스트
- [ ] 모든 사용자 역할 권한 검증
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 반응형 테스트
- [ ] 성능 목표 달성
- [ ] 보안 취약점 제거
- [ ] 접근성 표준 준수

---

**문서 승인**

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 작성 | QA Lead | | 2025-01-27 |
| 검토 | Dev Lead | | |
| 승인 | CTO | | |

---

## 10. Flexy + Material UI 특화 테스트 전략 ⭐ NEW

### 10.1 Flexy 커스텀 컴포넌트 테스트
```typescript
// 12개 Flexy 커스텀 컴포넌트 테스트 슈트
describe('Flexy Custom Components Suite', () => {
  const customComponents = [
    'CustomTextField', 'CustomButton', 'CustomCheckbox',
    'CustomRadio', 'CustomSelect', 'CustomSwitch',
    'CustomSlider', 'CustomRangeSlider', 'CustomFormLabel',
    'CustomOutlinedInput', 'CustomDisabledButton', 'CustomSocialButton'
  ];

  customComponents.forEach(componentName => {
    describe(componentName, () => {
      it('should render with Flexy theme', () => {
        // 컴포넌트별 개별 테스트
      });
      
      it('should respond to theme changes', () => {
        // 다크모드/라이트모드 전환 테스트
      });
    });
  });
});
```

### 10.2 서비스별 색상 테마 테스트
```typescript
// 두리무역 서비스별 색상 검증
describe('Service Color Themes', () => {
  const serviceColors = {
    inspection: '#1565C0',      // DLKP
    import_agency: '#2E7D32',   // DLSY
    purchase: '#ED6C02',        // DLGM
    shipping: '#9C27B0'         // DLBS
  };

  Object.entries(serviceColors).forEach(([service, color]) => {
    it(`should render ${service} with correct color ${color}`, () => {
      // 서비스별 색상 테마 검증
    });
  });
});
```

### 10.3 Flexy 레이아웃 테스트
```typescript
// Flexy 대시보드 레이아웃 테스트
describe('Flexy Dashboard Layout', () => {
  it('should render FullLayout correctly', () => {
    render(
      <FullLayout>
        <DashboardContent />
      </FullLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('should toggle mobile sidebar', async () => {
    const user = userEvent.setup();
    render(<MobileSidebar />);
    
    await user.click(screen.getByTestId('mobile-toggle'));
    expect(screen.getByTestId('mobile-sidebar')).toHaveClass('open');
  });
});
```

### 10.4 시각적 회귀 테스트 (Percy/Chromatic)
```typescript
// Flexy 컴포넌트 시각적 테스트
describe('Visual Regression Tests', () => {
  it('should match Flexy component snapshots', async () => {
    await page.goto('/storybook');
    
    // 각 Flexy 컴포넌트 스토리북 스냅샷
    const components = [
      'CustomTextField', 'CustomButton', 'DashboardCard'
    ];
    
    for (const component of components) {
      await page.locator(`[data-story="${component}"]`).click();
      await percySnapshot(page, `${component} - Default`);
      
      // 다크모드 스냅샷
      await page.locator('[data-testid="dark-mode-toggle"]').click();
      await percySnapshot(page, `${component} - Dark Mode`);
    }
  });
});
```

---

## 📌 주요 변경사항 (v2.0 - 2025-01-31)

### Material UI v7 + Flexy 테스트 전략 반영
1. **UI 테스트 업데이트**:
   - Tailwind CSS 클래스 선택자 → Material UI 데이터 속성 선택자
   - 12개 Flexy 커스텀 컴포넌트 테스트 슈트 추가
   - MUI 테마 기반 테스트 패턴 도입

2. **새로운 테스트 도구**:
   - @mui/material/test-utils 추가 (테마 테스트)
   - @testing-library/jest-dom MUI 매처 확장
   - Percy/Chromatic 시각적 회귀 테스트

3. **Flexy 특화 테스트**:
   - 서비스별 색상 테마 검증 (DLKP, DLSY, DLGM, DLBS)
   - 다크모드/라이트모드 전환 테스트
   - 반응형 레이아웃 및 모바일 사이드바 테스트

4. **CI/CD 파이프라인 최적화**:
   - MUI 번들 크기 분석 추가
   - 접근성 테스트 자동화 (@axe-core/playwright)
   - 시각적 회귀 테스트 통합

5. **E2E 테스트 개선**:
   - Material UI 컴포넌트 선택자 최적화
   - Flexy 대시보드 워크플로우 반영
   - MUI Snackbar, Dialog 등 상호작용 테스트

---

*본 문서는 두리무역 디지털 전환 프로젝트의 테스트 전략과 계획을 담은 공식 문서입니다.*  
*최종 수정: 2025-01-31 (Material UI v7 + Flexy 테스트 전략 반영)*