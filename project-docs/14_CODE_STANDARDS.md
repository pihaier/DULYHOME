# 📏 코드 규범 (Code Standards)
**두리무역 디지털 전환 플랫폼**

문서 버전: v2.0  
작성일: 2025-01-27  
수정일: 2025-01-31 (Material UI v7 + Flexy 전환 반영)  
작성자: 개발팀 리드  
기반문서: 08_TECH_ARCHITECTURE.md, 09_FRONTEND_DESIGN.md

---

## 📑 목차
1. [개요](#1-개요)
2. [일반 원칙](#2-일반-원칙)
3. [TypeScript 코딩 표준](#3-typescript-코딩-표준)
4. [React/Next.js 베스트 프랙티스](#4-reactnextjs-베스트-프랙티스)
5. [스타일 가이드](#5-스타일-가이드)
6. [Git 워크플로우](#6-git-워크플로우)
7. [코드 리뷰 가이드](#7-코드-리뷰-가이드)
8. [문서화 표준](#8-문서화-표준)

---

## 1. 개요

### 1.1 목적
- 일관된 코드 품질 유지
- 유지보수성 향상
- 팀 협업 효율성 증대
- 버그 발생 가능성 감소

### 1.2 적용 범위
- 모든 TypeScript/JavaScript 코드
- React 컴포넌트 및 훅
- API 라우트 및 서버 코드
- 테스트 코드
- 설정 파일

### 1.3 도구 및 설정
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off"
  }
}
```

---

## 2. 일반 원칙

### 2.1 SOLID 원칙
1. **Single Responsibility**: 하나의 클래스/함수는 하나의 책임
2. **Open/Closed**: 확장에는 열려있고 수정에는 닫혀있게
3. **Liskov Substitution**: 하위 타입은 상위 타입을 대체 가능
4. **Interface Segregation**: 작고 구체적인 인터페이스
5. **Dependency Inversion**: 추상화에 의존

### 2.2 DRY (Don't Repeat Yourself)
```typescript
// ❌ 나쁜 예
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const checkEmailFormat = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ✅ 좋은 예
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};
```

### 2.3 KISS (Keep It Simple, Stupid)
```typescript
// ❌ 나쁜 예
const getDiscount = (price: number, type: string, member: boolean) => {
  return member ? (type === 'vip' ? price * 0.2 : price * 0.1) : 
         (type === 'vip' ? price * 0.1 : 0);
};

// ✅ 좋은 예
const DISCOUNT_RATES = {
  vip: { member: 0.2, nonMember: 0.1 },
  regular: { member: 0.1, nonMember: 0 }
};

const getDiscount = (price: number, type: string, isMember: boolean): number => {
  const rate = DISCOUNT_RATES[type]?.[isMember ? 'member' : 'nonMember'] ?? 0;
  return price * rate;
};
```

---

## 3. TypeScript 코딩 표준

### 3.1 타입 정의
```typescript
// ✅ 인터페이스 우선 사용
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ✅ 유니온 타입 활용
type UserRole = 'customer' | 'chinese_staff' | 'korean_team' | 'admin';

// ✅ 제네릭 활용
interface ApiResponse<T> {
  data: T;
  error: string | null;
  timestamp: number;
}

// ❌ any 타입 사용 금지
const processData = (data: any) => { // 나쁜 예
  return data.someProperty;
};
```

### 3.2 함수 작성
```typescript
// ✅ 명시적 반환 타입
const calculatePrice = (days: number, type: ServiceType): PriceResult => {
  const baseRate = getBaseRate(days);
  const totalAmount = baseRate * days;
  
  return {
    dailyRate: baseRate,
    totalAmount,
    currency: 'KRW'
  };
};

// ✅ 함수형 프로그래밍 선호
const filterActiveApplications = (applications: Application[]): Application[] => {
  return applications
    .filter(app => app.status !== 'cancelled')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// ✅ 에러 처리
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user data', { userId, error });
    throw new UserNotFoundError(`User ${userId} not found`);
  }
};
```

### 3.3 클래스와 열거형
```typescript
// ✅ 클래스 작성
class ApplicationService {
  constructor(
    private readonly repository: ApplicationRepository,
    private readonly emailService: EmailService
  ) {}

  async createApplication(data: CreateApplicationDto): Promise<Application> {
    const application = await this.repository.create(data);
    await this.emailService.sendConfirmation(application);
    return application;
  }
}

// ✅ 열거형 사용
enum ApplicationStatus {
  Submitted = 'submitted',
  Quoted = 'quoted',
  Paid = 'paid',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}
```

### 3.4 비동기 처리
```typescript
// ✅ async/await 사용
const processApplication = async (id: string): Promise<void> => {
  const application = await getApplication(id);
  const quote = await generateQuote(application);
  await sendQuoteEmail(application.email, quote);
};

// ✅ 병렬 처리
const loadDashboardData = async (userId: string): Promise<DashboardData> => {
  const [applications, notifications, stats] = await Promise.all([
    getApplications(userId),
    getNotifications(userId),
    getStatistics(userId)
  ]);

  return { applications, notifications, stats };
};

// ✅ 에러 경계
const safeApiCall = async <T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logger.error('API call failed', error);
    return fallback;
  }
};
```

---

## 4. React/Next.js 베스트 프랙티스

### 4.1 컴포넌트 구조
```typescript
// ✅ 함수형 컴포넌트 + TypeScript
interface ApplicationCardProps {
  application: Application;
  onUpdate: (id: string, data: Partial<Application>) => void;
  className?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onUpdate,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const handleStatusChange = useCallback(async (newStatus: ApplicationStatus) => {
    setIsLoading(true);
    try {
      await onUpdate(application.id, { status: newStatus });
      toast.success('상태가 업데이트되었습니다');
    } catch (error) {
      toast.error('업데이트 실패');
    } finally {
      setIsLoading(false);
    }
  }, [application.id, onUpdate]);

  return (
    <Card className={cn('p-4', className)}>
      {/* 컴포넌트 내용 */}
    </Card>
  );
};
```

### 4.2 커스텀 훅
```typescript
// ✅ 커스텀 훅 작성
export const useApplication = (reservationNumber: string) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        const data = await api.getApplication(reservationNumber);
        setApplication(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [reservationNumber]);

  return { application, isLoading, error, refetch: fetchApplication };
};
```

### 4.3 상태 관리
```typescript
// ✅ Context API 활용
interface GlobalState {
  user: User | null;
  isAuthenticated: boolean;
  language: 'ko' | 'zh';
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>({
    user: null,
    isAuthenticated: false,
    language: 'ko'
  });

  return (
    <GlobalContext.Provider value={state}>
      {children}
    </GlobalContext.Provider>
  );
};

// ✅ 훅으로 사용
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
};
```

### 4.4 성능 최적화
```typescript
// ✅ React.memo 활용
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* 복잡한 렌더링 */}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});

// ✅ useMemo와 useCallback
const ApplicationList: React.FC<Props> = ({ applications }) => {
  const sortedApplications = useMemo(() => {
    return applications.sort((a, b) => b.createdAt - a.createdAt);
  }, [applications]);

  const handleClick = useCallback((id: string) => {
    router.push(`/applications/${id}`);
  }, [router]);

  return (
    <div>
      {sortedApplications.map(app => (
        <ApplicationCard key={app.id} onClick={() => handleClick(app.id)} />
      ))}
    </div>
  );
};
```

---

## 5. 스타일 가이드 (Material UI v7 + Emotion + Flexy)

### 5.1 Material UI v7 + Emotion 기반 스타일링 ✅ 완료
```typescript
// ✅ Material UI 컴포넌트 사용
import { Button, TextField, Box, Alert, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// ✅ 조건부 스타일링 - sx prop 사용
<Box
  sx={{
    p: 2,
    borderRadius: 2,
    transition: 'all 0.3s',
    bgcolor: status === 'pending' ? 'primary.50' : 
             status === 'completed' ? 'success.50' : 'error.50',
    borderColor: status === 'pending' ? 'primary.main' : 
                 status === 'completed' ? 'success.main' : 'error.main',
    borderWidth: 1,
    borderStyle: 'solid'
  }}
>

// ✅ Flexy 커스텀 컴포넌트 활용
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomButton from '@/app/components/forms/theme-elements/CustomButton';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';

// ✅ Flexy 기반 폼 작성
<Box component="form" onSubmit={handleSubmit}>
  <CustomFormLabel htmlFor="email">이메일</CustomFormLabel>
  <CustomTextField 
    id="email" 
    type="email"
    variant="outlined" 
    fullWidth 
    required
  />
  <CustomButton 
    type="submit"
    variant="contained"
    color="primary"
    fullWidth
  >
    제출
  </CustomButton>
</Box>
```

### 5.2 Flexy 기반 컴포넌트 스타일링
```typescript
// ✅ Flexy 테마 시스템 사용
import { useTheme } from '@mui/material/styles';
import { useCustomizer } from '@/store/customizer/CustomizerContext';

const theme = useTheme();
const customizer = useCustomizer();

// ✅ 반응형 디자인 (MUI 표준)
<Box
  sx={{
    width: {
      xs: '100%',    // mobile
      sm: '50%',     // tablet
      md: '33.33%'   // desktop
    },
    p: { xs: 2, sm: 3, md: 4 }
  }}
/>

// ✅ Flexy 테마 색상 활용
const FLEXY_COLORS = {
  primary: theme.palette.primary.main,
  secondary: theme.palette.secondary.main,
  success: theme.palette.success.main,
  error: theme.palette.error.main,
  warning: theme.palette.warning.main,
  info: theme.palette.info.main,
} as const;

// ✅ 두리무역 서비스별 색상 시스템
const SERVICE_COLORS = {
  inspection: '#1565C0',      // DLKP - 파란색 (신뢰감)
  import_agency: '#2E7D32',   // DLSY - 초록색 (성장)
  purchase: '#ED6C02',        // DLGM - 주황색 (활동성)
  shipping: '#9C27B0'         // DLBS - 보라색 (프리미엄)
} as const;
```

### 5.3 Flexy + Material UI 코딩 규칙

#### 5.3.1 컴포넌트 임포트 우선순위
```typescript
// 1순위: Flexy 커스텀 컴포넌트 사용
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomButton from '@/app/components/forms/theme-elements/CustomButton';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';

// 2순위: 표준 MUI 컴포넌트 (Flexy에 없는 경우)
import { Card, CardContent, Divider, Alert } from '@mui/material';

// 3순위: 스타일링 도구
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// ❌ 나쁜 예 - 전체 임포트
import * as MUI from '@mui/material';

// ❌ 나쁜 예 - Flexy 커스텀이 있는데 표준 MUI 사용
import { TextField } from '@mui/material'; // CustomTextField 사용 권장
```

#### 5.3.2 스타일링 우선순위
```typescript
// 1순위: props 사용
<Button variant="contained" color="primary" size="large">

// 2순위: sx prop (일회성 스타일)
<Button sx={{ borderRadius: 2, textTransform: 'none' }}>

// 3순위: styled 컴포넌트 (재사용)
const CustomButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
}));

// 4순위: makeStyles (권장하지 않음 - MUI v5에서 deprecated)
```

#### 5.3.3 Flexy 테마 확장 및 커스터마이징
```typescript
// ✅ Flexy 기반 두리무역 테마 확장
import { createTheme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';

const dulyFlexyTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',        // Flexy 기본 primary
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',        // Flexy 기본 secondary
    },
    // 두리무역 서비스별 커스텀 색상
    custom: {
      inspection: '#1565C0',    // DLKP
      importAgency: '#2E7D32',  // DLSY  
      purchase: '#ED6C02',      // DLGM
      shipping: '#9C27B0'       // DLBS
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Pretendard", "Noto Sans KR", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    button: { textTransform: 'none' }, // 한글 대문자 방지
    body1: { fontSize: '1rem', lineHeight: 1.6 },
  },
  components: {
    // Flexy 기존 컴포넌트 오버라이드
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        contained: { boxShadow: 'none' }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }
      }
    }
  }
});

// ✅ 커스터마이저 컨텍스트 활용
import { useCustomizer } from '@/store/customizer/CustomizerContext';

const MyComponent = () => {
  const customizer = useCustomizer();
  
  return (
    <Box
      sx={{
        bgcolor: customizer.activeMode === 'dark' ? 'grey.900' : 'common.white',
        p: 3,
        borderRadius: 2
      }}
    >
      다크모드 대응 컴포넌트
    </Box>
  );
};
```

#### 5.3.4 Flexy 기반 반응형 디자인
```typescript
// ✅ Flexy 레이아웃 시스템 활용
import FullLayout from '@/app/(DashboardLayout)/layout/FullLayout';
import { Grid, Container } from '@mui/material';

// ✅ MUI Grid v2 시스템 (Flexy 표준)
<Grid container spacing={3}>
  <Grid xs={12} md={8}>
    <MainContent />
  </Grid>
  <Grid xs={12} md={4}>
    <Sidebar />
  </Grid>
</Grid>

// ✅ Flexy 반응형 패턴
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, sm: 3, md: 4 },
    p: { xs: 2, sm: 3, md: 4 },
    // Flexy 기본 container 스타일 준수
    maxWidth: 'lg',
    mx: 'auto'
  }}
>

// ✅ useMediaQuery 훅 사용 (Flexy 호환)
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
```

### 5.4 Flexy 템플릿 활용 가이드

#### 5.4.1 Flexy 12개 커스텀 컴포넌트 활용
```typescript
// ✅ 폼 관련 커스텀 컴포넌트 (우선 사용)
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomButton from '@/app/components/forms/theme-elements/CustomButton';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import CustomRadio from '@/app/components/forms/theme-elements/CustomRadio';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomSwitch from '@/app/components/forms/theme-elements/CustomSwitch';
import CustomSlider from '@/app/components/forms/theme-elements/CustomSlider';
import CustomRangeSlider from '@/app/components/forms/theme-elements/CustomRangeSlider';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '@/app/components/forms/theme-elements/CustomOutlinedInput';
import CustomDisabledButton from '@/app/components/forms/theme-elements/CustomDisabledButton';
import CustomSocialButton from '@/app/components/forms/theme-elements/CustomSocialButton';

// ✅ ERP 신청 폼 표준 패턴
const ApplicationForm = () => {
  return (
    <Box component="form" sx={{ p: 3 }}>
      <CustomFormLabel htmlFor="company">회사명</CustomFormLabel>
      <CustomTextField
        id="company"
        fullWidth
        placeholder="회사명을 입력하세요"
        required
      />
      
      <CustomFormLabel htmlFor="service">서비스 유형</CustomFormLabel>
      <CustomSelect
        id="service"
        fullWidth
        options={SERVICE_OPTIONS}
        required
      />
      
      <CustomButton
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        sx={{ mt: 3 }}
      >
        신청하기
      </CustomButton>
    </Box>
  );
};
```

#### 5.4.2 Flexy 레이아웃 시스템
```typescript
// ✅ 대시보드 레이아웃 (Flexy 기본 구조)
import FullLayout from '@/app/(DashboardLayout)/layout/FullLayout';
import Container from '@/app/(DashboardLayout)/layout/container/Container';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

const DashboardPage = () => {
  return (
    <PageContainer title="대시보드" description="두리무역 ERP 대시보드">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* 메인 콘텐츠 */}
        </Grid>
      </Container>
    </PageContainer>
  );
};

// ✅ 카드 기반 콘텐츠 레이아웃
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';

<DashboardCard title="검품 현황">
  <InspectionStatusTable />
</DashboardCard>

<BlankCard>
  <CustomContent />
</BlankCard>
```

#### 5.4.3 Flexy 아이콘 시스템
```typescript
// ✅ Tabler Icons (Flexy 기본 아이콘 세트)
import {
  IconBrandTabler,
  IconCalendarStats,
  IconClipboardCheck,
  IconMail,
  IconUser,
  IconSettings
} from '@tabler/icons-react';

// ✅ 서비스별 아이콘 매핑
const SERVICE_ICONS = {
  inspection: IconClipboardCheck,
  import_agency: IconCalendarStats, 
  purchase: IconBrandTabler,
  shipping: IconMail
} as const;

// 사용 예시
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <ServiceIcon component={SERVICE_ICONS[serviceType]} />
  <Typography>{serviceName}</Typography>
</Box>
```

#### 5.4.4 Flexy 커스터마이저 활용
```typescript
// ✅ 다크모드 대응
import { useCustomizer } from '@/store/customizer/CustomizerContext';

const MyComponent = () => {
  const customizer = useCustomizer();
  
  return (
    <Card
      sx={{
        bgcolor: customizer.activeMode === 'dark' 
          ? 'grey.800' 
          : 'common.white',
        color: customizer.activeMode === 'dark'
          ? 'common.white'
          : 'text.primary'
      }}
    >
      다크모드 대응 콘텐츠
    </Card>
  );
};

// ✅ 사이드바 커스터마이징
const handleSidebarToggle = () => {
  customizer.setMobileSidebar(!customizer.isMobileSidebar);
};
```

---

## 6. Git 워크플로우

### 6.1 브랜치 전략
```bash
main
├── develop
│   ├── feature/JIRA-123-add-payment
│   ├── feature/JIRA-124-chat-system
│   └── feature/JIRA-125-report-generation
├── release/v1.0.0
└── hotfix/JIRA-126-critical-bug
```

### 6.2 커밋 컨벤션
```bash
# 형식: <type>(<scope>): <subject>

feat(auth): 카카오 OAuth 로그인 추가
fix(chat): 실시간 메시지 동기화 오류 수정
docs(api): 신규 엔드포인트 문서 추가
style(ui): 버튼 컴포넌트 스타일 개선
refactor(db): 쿼리 성능 최적화
test(e2e): 결제 프로세스 E2E 테스트 추가
chore(deps): 패키지 의존성 업데이트
```

### 6.3 Pull Request 규칙
```markdown
## 변경 사항
- 기능 A 추가
- 버그 B 수정

## 테스트
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

## 체크리스트
- [ ] 코드 리뷰 요청
- [ ] 문서 업데이트
- [ ] CHANGELOG 추가
```

---

## 7. 코드 리뷰 가이드

### 7.1 리뷰 체크리스트
- [ ] 코드가 요구사항을 충족하는가?
- [ ] 테스트가 충분한가?
- [ ] 성능 이슈는 없는가?
- [ ] 보안 취약점은 없는가?
- [ ] 코드가 읽기 쉬운가?
- [ ] DRY 원칙을 지켰는가?
- [ ] 에러 처리가 적절한가?

### 7.2 리뷰 코멘트 예시
```typescript
// 💡 제안: 이 로직을 별도 함수로 분리하면 재사용성이 높아집니다
// ⚠️ 주의: null 체크가 필요합니다
// 🐛 버그: 배열이 비어있을 때 에러가 발생합니다
// 🎯 필수: 이 부분은 반드시 수정이 필요합니다
// 💬 질문: 이 접근 방식을 선택한 이유가 있나요?
```

---

## 8. 문서화 표준

### 8.1 JSDoc 사용
```typescript
/**
 * 검품 신청을 생성합니다
 * @param data - 신청 데이터
 * @returns 생성된 신청 정보
 * @throws {ValidationError} 입력 데이터가 유효하지 않은 경우
 * @example
 * const application = await createApplication({
 *   serviceType: 'quality_inspection',
 *   companyName: '테스트 회사',
 *   productName: '전자제품'
 * });
 */
export async function createApplication(
  data: CreateApplicationDto
): Promise<Application> {
  // 구현
}
```

### 8.2 README 작성
```markdown
# 프로젝트명

## 설치 및 실행
\`\`\`bash
yarn install
yarn dev
\`\`\`

## 환경 변수
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
\`\`\`

## 프로젝트 구조
\`\`\`
src/
├── app/          # Next.js 앱 라우터
├── components/   # React 컴포넌트
├── lib/          # 유틸리티 함수
└── types/        # TypeScript 타입 정의
\`\`\`
```

---

## 9. 보안 모범 사례 ⭐ (2025-01-27 추가)

### 9.1 인증 및 권한 관리

#### 역할 기반 접근 제어 (RBAC)
```typescript
// middleware/auth.ts
export function withAuth(allowedRoles: UserRole[]) {
  return async (req: Request) => {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new UnauthorizedError('인증이 필요합니다');
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!profile || !allowedRoles.includes(profile.role)) {
      throw new ForbiddenError('접근 권한이 없습니다');
    }
    
    return { user, profile };
  };
}

// 사용 예시
export async function POST(req: Request) {
  const { user } = await withAuth(['korean_team', 'admin'])(req);
  // 권한이 확인된 로직 실행
}
```

### 9.2 입력 검증 및 살균

#### Zod를 사용한 입력 검증
```typescript
import { z } from 'zod';

// 스키마 정의
const applicationSchema = z.object({
  service_type: z.enum(['quality_inspection', 'factory_audit', 'loading_inspection']),
  product_name: z.string().min(1).max(200),
  factory_name: z.string().min(1).max(100),
  inspection_start_date: z.string().datetime(),
  special_requirements: z.string().max(1000).optional(),
});

// API 핸들러에서 사용
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = applicationSchema.parse(body);
    
    // 검증된 데이터로 처리
    await createApplication(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### 9.3 SQL Injection 방지

#### 파라미터 바인딩 사용
```typescript
// ❌ 취약한 코드
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 안전한 코드
const { data } = await supabase
  .from('users')
  .select()
  .eq('email', email);

// Raw SQL 사용 시
const { data } = await supabase.rpc('search_users', {
  search_email: email // 파라미터 바인딩
});
```

### 9.4 파일 업로드 보안

```typescript
// lib/file-validation.ts
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateFile(file: File) {
  // 1. 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 10MB를 초과할 수 없습니다');
  }
  
  // 2. MIME 타입 검증
  if (!ALLOWED_FILE_TYPES[file.type]) {
    throw new Error('허용되지 않은 파일 형식입니다');
  }
  
  // 3. 파일 확장자 검증
  const extension = path.extname(file.name).toLowerCase();
  const allowedExtensions = ALLOWED_FILE_TYPES[file.type];
  
  if (!allowedExtensions.includes(extension)) {
    throw new Error('파일 확장자가 MIME 타입과 일치하지 않습니다');
  }
  
  // 4. 파일 내용 검증 (매직 넘버)
  const buffer = await file.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 4));
  
  if (!validateMagicNumber(header, file.type)) {
    throw new Error('파일 내용이 변조되었을 수 있습니다');
  }
  
  return true;
}
```

### 9.5 CSRF 보호

```typescript
// lib/csrf.ts
import { createHash } from 'crypto';

export function generateCSRFToken(sessionId: string): string {
  const secret = process.env.CSRF_SECRET!;
  return createHash('sha256')
    .update(`${sessionId}:${secret}`)
    .digest('hex');
}

export function validateCSRFToken(
  token: string,
  sessionId: string
): boolean {
  const expectedToken = generateCSRFToken(sessionId);
  return token === expectedToken;
}

// API 미들웨어
export async function validateCSRF(req: Request) {
  const token = req.headers.get('X-CSRF-Token');
  const sessionId = await getSessionId(req);
  
  if (!token || !validateCSRFToken(token, sessionId)) {
    throw new ForbiddenError('CSRF 토큰이 유효하지 않습니다');
  }
}
```

### 9.6 환경 변수 관리

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // 공개 환경 변수
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // 서버 전용 환경 변수
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  
  // 보안 키
  ENCRYPTION_KEY: z.string().length(32),
  JWT_SECRET: z.string().min(32),
});

// 환경 변수 검증
export const env = envSchema.parse(process.env);
```

### 9.7 에러 처리 및 로깅

```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
  }
}

export function errorHandler(error: unknown) {
  // 민감한 정보 제거
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }
  
  // 프로덕션에서는 일반 메시지만 반환
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled error:', error);
    return {
      code: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다',
    };
  }
  
  // 개발 환경에서만 상세 정보
  return {
    code: 'INTERNAL_ERROR',
    message: error?.message || '알 수 없는 오류',
    stack: error?.stack,
  };
}
```

### 9.8 보안 헤더 설정

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
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
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];
```

---

## 📎 부록

### A. 린터 설정
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### B. 추천 VS Code 확장
- ESLint
- Prettier
- TypeScript Error Translator
- GitLens
- Tailwind CSS IntelliSense

### C. 코드 스니펫
```json
// Next.js 컴포넌트 스니펫
{
  "Next.js Component": {
    "prefix": "nfc",
    "body": [
      "interface ${1:Component}Props {",
      "  ${2}",
      "}",
      "",
      "export const ${1:Component}: React.FC<${1:Component}Props> = ({",
      "  ${3}",
      "}) => {",
      "  return (",
      "    <div>",
      "      ${4}",
      "    </div>",
      "  );",
      "};"
    ]
  }
}
```

---

**문서 승인**

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 작성 | Tech Lead | | 2025-01-27 |
| 검토 | Senior Dev | | |
| 승인 | CTO | | |

---

## 📌 주요 변경사항 (v2.0 - 2025-01-31)

### Material UI v7 + Flexy 완전 전환 반영
1. **스타일 시스템 전환**:
   - Tailwind CSS → Material UI v7 + Emotion CSS-in-JS
   - 12개 Flexy 커스텀 컴포넌트 활용 가이드 추가
   - Flexy 테마 시스템 및 커스터마이저 활용법

2. **새로운 코딩 규칙**:
   - Flexy 컴포넌트 우선 사용 원칙 (CustomTextField > TextField)
   - 서비스별 색상 시스템 (DLKP, DLSY, DLGM, DLBS)
   - Tabler Icons 기반 아이콘 시스템

3. **레이아웃 표준화**:
   - FullLayout, DashboardCard, PageContainer 활용
   - Grid v2 시스템 기반 반응형 디자인
   - 다크모드 대응 패턴

4. **ERP 특화 가이드**:
   - 신청 폼 표준 패턴 정의
   - 역할별 접근 제어 구현 방법
   - 파일 업로드 보안 강화

---

*본 문서는 두리무역 디지털 전환 프로젝트의 코드 품질 표준을 정의한 공식 문서입니다.*  
*최종 수정: 2025-01-31 (Material UI v7 + Flexy 완전 전환 반영)*