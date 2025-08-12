# 🔧 백엔드 설계 문서 (Backend Design Document)
**두리무역 디지털 전환 플랫폼**

문서 버전: v1.0  
작성일: 2025-01-26  
작성자: 백엔드 아키텍트  
표준: Next.js 15 API Routes + Supabase + TypeScript

---

## 📑 목차
1. [설계 개요](#1-설계-개요)
2. [아키텍처 패턴](#2-아키텍처-패턴)
3. [API 라우트 구조](#3-api-라우트-구조)
4. [데이터 접근 계층](#4-데이터-접근-계층)
5. [비즈니스 로직 계층](#5-비즈니스-로직-계층)
6. [보안 및 인증](#6-보안-및-인증)
7. [실시간 처리](#7-실시간-처리)
8. [외부 서비스 통합](#8-외부-서비스-통합)

---

## 1. 설계 개요

### 1.1 핵심 설계 원칙
- **Layered Architecture**: 명확한 계층 분리
- **Domain-Driven Design**: 서비스별 도메인 모델
- **Type Safety**: 완전한 타입 안전성
- **Security First**: RLS + API 보안
- **Real-time Ready**: 실시간 기능 내장

### 1.2 기술 스택
```typescript
// 핵심 기술
- Next.js 15 App Router (API Routes)
- TypeScript 5.x (Strict Mode)
- Supabase (PostgreSQL + Realtime + Auth)
- React Query v5 (서버 상태 관리)
- Zod (런타임 검증)
```

### 1.3 디렉토리 구조
```
nextjs/
├── src/
│   ├── app/api/              # API Routes
│   │   ├── auth/             # 인증 관련
│   │   ├── applications/     # 신청 관리
│   │   ├── chat/             # 채팅
│   │   ├── reports/          # 보고서
│   │   ├── admin/            # 관리자
│   │   ├── webhooks/         # 웹훅
│   │   ├── workflow/         # 워크플로우 엔진
│   │   └── ai-translate/     # AI 번역 API
│   │
│   ├── lib/                  # 핵심 라이브러리
│   │   ├── supabase/         # DB 클라이언트
│   │   ├── services/         # 비즈니스 로직
│   │   ├── validators/       # 스키마 검증
│   │   ├── utils/            # 유틸리티
│   │   ├── types/            # TypeScript 타입
│   │   ├── queue/            # BullMQ 작업 큐
│   │   └── ai/               # AI SDK 통합
│   │
│   └── middleware.ts         # 미들웨어
│
├── supabase/
│   └── functions/            # Edge Functions
│       ├── translate/        # 번역 처리
│       ├── workflow-engine/  # 워크플로우 처리
│       └── document-convert/ # Word-HTML 변환
```

---

## 2. 아키텍처 패턴

### 2.1 계층 구조
```
┌─────────────────────────────────────┐
│        API Routes (Controller)       │
├─────────────────────────────────────┤
│      Business Logic (Service)        │
├─────────────────────────────────────┤
│     Data Access Layer (Repository)   │
├─────────────────────────────────────┤
│         Supabase (Database)          │
└─────────────────────────────────────┘
```

### 2.2 도메인 모델
```typescript
// Domain Models
interface DomainModel {
  // 검품/감사 도메인
  InspectionDomain: {
    ChinaBusinessTrip,
    InspectionApplication,
    InspectionReport
  },
  
  // 시장조사 도메인
  MarketResearchDomain: {
    MarketResearchRequest,
    MarketResearchSupplier,
    PriceCalculation
  },
  
  // 샘플링 도메인
  SamplingDomain: {
    SampleOrder,
    SampleItem,
    CustomsInfo
  },
  
  // 구매대행 도메인
  PurchasingDomain: {
    PurchasingOrder,
    PurchaseItem,
    WarehouseInfo
  },
  
  // 배송대행 도메인
  ShippingDomain: {
    ShippingAgencyOrder,
    ShippingItem,
    ConsolidationInfo
  }
}
```

---

## 3. API 라우트 구조

### 3.1 인증 API (/api/auth)
```typescript
// /api/auth/register/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const validated = CustomerRegistrationSchema.parse(body)
  
  // 1. Supabase Auth 사용자 생성
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: { role: 'customer' }
    }
  })
  
  // 2. user_profiles 생성
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: authUser.user.id,
      company_name: validated.company_name,
      company_name_chinese: validated.company_name_chinese,
      contact_person: validated.contact_person,
      phone: validated.phone,
      language_preference: 'ko'
    })
    
  return NextResponse.json({ success: true, user: authUser.user })
}

// /api/auth/login/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const validated = LoginSchema.parse(body)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password
  })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
  
  // JWT 토큰은 Supabase가 자동 관리
  return NextResponse.json({ 
    user: data.user,
    session: data.session 
  })
}
```

### 3.2 신청 관리 API (/api/applications)
```typescript
// /api/applications/route.ts
export async function GET(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // RLS가 자동으로 권한 필터링
  const { data: applications, error } = await supabase
    .from('inspection_applications')
    .select(`
      *,
      user:users!user_id(email),
      assigned_staff:users!assigned_chinese_staff(email, name)
    `)
    .order('created_at', { ascending: false })
    
  return NextResponse.json({ applications })
}

export async function POST(request: Request) {
  const body = await request.json()
  const validated = ApplicationSchema.parse(body)
  
  // 서비스 타입별 처리
  switch (validated.service_type) {
    case 'quality_inspection':
    case 'factory_audit':
    case 'loading_inspection':
      return createInspectionApplication(validated)
      
    case 'market_research':
      return createMarketResearchRequest(validated)
      
    case 'purchasing_agency':
      return createPurchasingOrder(validated)
      
    case 'shipping_agency':
      return createShippingOrder(validated)
  }
}

// 검품 신청 생성
async function createInspectionApplication(data: InspectionInput) {
  const supabase = createServerClient()
  
  // 트랜잭션 처리
  const { data: application, error } = await supabase.rpc(
    'create_inspection_application',
    {
      p_data: {
        ...data,
        reservation_number: generateReservationNumber(),
        status: 'submitted',
        payment_status: 'pending'
      }
    }
  )
  
  // 중국직원 자동 배정
  await assignChineseStaff(application.id)
  
  // 알림 발송
  await sendNotification({
    type: 'new_application',
    recipient: application.assigned_chinese_staff,
    data: application
  })
  
  return NextResponse.json({ application })
}
```

### 3.3 채팅 API (/api/chat)
```typescript
// /api/chat/[reservationNumber]/messages/route.ts
export async function GET(
  request: Request,
  { params }: { params: { reservationNumber: string } }
) {
  const supabase = createServerClient()
  
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('reservation_number', params.reservationNumber)
    .order('created_at', { ascending: true })
    
  return NextResponse.json({ messages })
}

export async function POST(
  request: Request,
  { params }: { params: { reservationNumber: string } }
) {
  const body = await request.json()
  const { message, files } = body
  
  // 1. 언어 감지
  const detectedLanguage = await detectLanguage(message)
  
  // 2. GPT-4 번역
  const translation = await translateMessage(
    message,
    detectedLanguage,
    detectedLanguage === 'ko' ? 'zh' : 'ko'
  )
  
  // 3. 메시지 저장
  const { data: savedMessage, error } = await supabase
    .from('chat_messages')
    .insert({
      reservation_number: params.reservationNumber,
      sender_id: user.id,
      sender_name: userProfile.contact_person,
      sender_role: userProfile.role,
      original_message: message,
      original_language: detectedLanguage,
      translated_message: translation.text,
      translated_language: translation.targetLanguage,
      message_type: files ? 'file' : 'text',
      file_url: files?.[0]?.url,
      file_name: files?.[0]?.name,
      file_size: files?.[0]?.size
    })
    .select()
    .single()
    
  // 4. Realtime 브로드캐스트는 Supabase가 자동 처리
  
  return NextResponse.json({ message: savedMessage })
}
```

### 3.4 보고서 API (/api/reports)
```typescript
// /api/reports/[reservationNumber]/upload/route.ts
export async function POST(
  request: Request,
  { params }: { params: { reservationNumber: string } }
) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // 1. 파일 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('reports')
    .upload(`${params.reservationNumber}/${Date.now()}_${file.name}`, file)
    
  // 2. DB 레코드 생성
  const { data: report, error: dbError } = await supabase
    .from('inspection_reports')
    .insert({
      reservation_number: params.reservationNumber,
      original_filename: file.name,
      file_path: uploadData.path,
      report_type: detectReportType(file.name),
      status: 'uploaded',
      uploaded_by: user.id
    })
    .select()
    .single()
    
  // 3. AI 분석 트리거
  await analyzeReport(report.id)
  
  return NextResponse.json({ report })
}

// /api/reports/[reservationNumber]/translate/route.ts
export async function POST(
  request: Request,
  { params }: { params: { reservationNumber: string } }
) {
  const { reportId } = await request.json()
  
  // 1. 보고서 내용 추출
  const content = await extractReportContent(reportId)
  
  // 2. GPT-4 번역 및 분석
  const analysis = await analyzeWithGPT4({
    content,
    task: 'translate_and_analyze',
    targetLanguage: 'ko'
  })
  
  // 3. 결과 저장
  const { data: updated, error } = await supabase
    .from('inspection_reports')
    .update({
      translated_content: analysis,
      status: 'completed'
    })
    .eq('id', reportId)
    
  return NextResponse.json({ analysis })
}
```

---

## 4. 데이터 접근 계층

### 4.1 Repository 패턴
```typescript
// lib/repositories/application.repository.ts
export class ApplicationRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('inspection_applications')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) throw new ApplicationNotFoundError(id)
    return data
  }
  
  async findByReservationNumber(reservationNumber: string) {
    const { data, error } = await this.supabase
      .from('inspection_applications')
      .select(`
        *,
        user:users!user_id(email, user_profiles(*)),
        assigned_staff:users!assigned_chinese_staff(email, name)
      `)
      .eq('reservation_number', reservationNumber)
      .single()
      
    if (error) throw new ApplicationNotFoundError(reservationNumber)
    return data
  }
  
  async create(data: CreateApplicationDto) {
    const { data: created, error } = await this.supabase
      .from('inspection_applications')
      .insert(data)
      .select()
      .single()
      
    if (error) throw new DatabaseError(error.message)
    return created
  }
  
  async updateStatus(id: string, status: OrderStatus) {
    const { data, error } = await this.supabase
      .from('inspection_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw new DatabaseError(error.message)
    return data
  }
}
```

### 4.2 Query Builder 패턴
```typescript
// lib/queries/application.query.ts
export class ApplicationQuery {
  private query = this.supabase.from('inspection_applications').select()
  
  constructor(private supabase: SupabaseClient) {}
  
  byUser(userId: string) {
    this.query = this.query.eq('user_id', userId)
    return this
  }
  
  byStatus(status: OrderStatus | OrderStatus[]) {
    if (Array.isArray(status)) {
      this.query = this.query.in('status', status)
    } else {
      this.query = this.query.eq('status', status)
    }
    return this
  }
  
  byDateRange(start: Date, end: Date) {
    this.query = this.query
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
    return this
  }
  
  withRelations() {
    this.query = this.query.select(`
      *,
      user:users!user_id(
        email,
        user_profiles(*)
      ),
      assigned_staff:users!assigned_chinese_staff(
        email,
        name,
        user_profiles(*)
      ),
      chat_messages(count),
      inspection_reports(*)
    `)
    return this
  }
  
  async execute() {
    const { data, error } = await this.query
    if (error) throw new DatabaseError(error.message)
    return data
  }
}

// 사용 예시
const applications = await new ApplicationQuery(supabase)
  .byUser(userId)
  .byStatus(['submitted', 'quoted'])
  .byDateRange(startDate, endDate)
  .withRelations()
  .execute()
```

---

## 5. 비즈니스 로직 계층

### 5.1 서비스 계층 구조
```typescript
// lib/services/inspection.service.ts
export class InspectionService {
  constructor(
    private applicationRepo: ApplicationRepository,
    private notificationService: NotificationService,
    private translationService: TranslationService,
    private pricingService: PricingService
  ) {}
  
  async createApplication(input: CreateApplicationInput) {
    // 1. 입력 검증
    const validated = ApplicationSchema.parse(input)
    
    // 2. 예약번호 생성
    const reservationNumber = this.generateReservationNumber()
    
    // 3. 가격 계산
    const pricing = await this.pricingService.calculate({
      serviceType: validated.service_type,
      days: validated.inspection_days,
      method: validated.inspection_method
    })
    
    // 4. 번역 처리
    const translations = await this.translationService.translateBatch([
      { text: validated.product_name, to: 'zh' },
      { text: validated.special_requirements, to: 'zh' }
    ])
    
    // 5. 신청서 생성
    const application = await this.applicationRepo.create({
      ...validated,
      reservation_number: reservationNumber,
      product_name_translated: translations[0],
      special_requirements_translated: translations[1],
      total_amount: pricing.total,
      margin_amount: pricing.margin,
      status: 'submitted',
      payment_status: 'pending'
    })
    
    // 6. 직원 배정
    const assignedStaff = await this.assignStaff(application.id)
    
    // 7. 알림 발송
    await this.notificationService.send({
      type: 'new_application',
      recipient: assignedStaff.id,
      data: application
    })
    
    return application
  }
  
  private async assignStaff(applicationId: string) {
    // 업무량 기반 자동 배정
    const { data: staff } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        assigned_applications:inspection_applications(count)
      `)
      .eq('role', 'chinese_staff')
      .order('assigned_applications.count', { ascending: true })
      .limit(1)
      .single()
      
    await this.applicationRepo.update(applicationId, {
      assigned_chinese_staff: staff.user_id
    })
    
    return staff
  }
  
  private generateReservationNumber(): string {
    const date = new Date()
    const dateStr = format(date, 'yyyyMMdd')
    const sequence = this.getNextSequence(dateStr)
    return `DL-${dateStr}-${sequence.toString().padStart(6, '0')}`
  }
}
```

### 5.2 가격 계산 서비스
```typescript
// lib/services/pricing.service.ts
export class PricingService {
  private readonly RATES = {
    quality_inspection: {
      base: 290000,
      discounts: [
        { minDays: 5, rate: 270000 },
        { minDays: 10, rate: 250000 }
      ]
    },
    factory_audit: { fixed: 3000000 },
    loading_inspection: { fixed: 500000 },
    market_research: { fixed: 50000 },
    sample_order: { base: 200000 },
    purchasing_agency: { percentage: 0.05 },
    shipping_agency: { base: 5000 }
  }
  
  calculate(params: PricingParams): PricingResult {
    const { serviceType, days, amount } = params
    
    switch (serviceType) {
      case 'quality_inspection':
        return this.calculateInspection(days)
        
      case 'purchasing_agency':
        return this.calculatePercentage(amount, 0.05)
        
      default:
        return this.calculateFixed(serviceType)
    }
  }
  
  private calculateInspection(days: number) {
    const rates = this.RATES.quality_inspection
    let dailyRate = rates.base
    
    // 할인 적용
    for (const discount of rates.discounts) {
      if (days >= discount.minDays) {
        dailyRate = discount.rate
      }
    }
    
    const subtotal = dailyRate * days
    const margin = subtotal * 0.5 // 50% 마진
    
    return {
      subtotal,
      margin,
      total: subtotal + margin,
      breakdown: {
        dailyRate,
        days,
        marginRate: 0.5
      }
    }
  }
}
```

### 5.3 번역 서비스
```typescript
// lib/services/translation.service.ts
export class TranslationService {
  private openai: OpenAI
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  
  async translateMessage(
    text: string,
    from: Language,
    to: Language
  ): Promise<TranslationResult> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional Korean-Chinese translator for trade business. 
                   Translate the following ${from} text to ${to}.
                   Preserve technical terms and product names.
                   Context: International trade between Korea and China.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
    
    return {
      original: text,
      translated: completion.choices[0].message.content,
      from,
      to,
      confidence: 0.95
    }
  }
  
  async analyzeReport(content: string): Promise<ReportAnalysis> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are analyzing a quality inspection report.
                   Extract key information and summarize in Korean.
                   Focus on: total quantity, pass rate, defect types, recommendations.`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
    
    return JSON.parse(completion.choices[0].message.content)
  }
}
```

---

## 6. 보안 및 인증

### 6.1 미들웨어 설정
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // 세션 확인
  const { data: { session } } = await supabase.auth.getSession()
  
  // API 보호
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (!session && !isPublicAPI(req.nextUrl.pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  // 역할 기반 접근 제어
  if (req.nextUrl.pathname.startsWith('/api/admin/')) {
    const userRole = await getUserRole(session?.user?.id)
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }
  
  return res
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 6.2 RLS 정책
```sql
-- 고객은 자신의 신청만 조회
CREATE POLICY "customers_own_applications" ON inspection_applications
FOR SELECT USING (auth.uid() = user_id);

-- 중국직원은 배정된 신청만 조회
CREATE POLICY "staff_assigned_applications" ON inspection_applications
FOR SELECT USING (
  auth.uid() = assigned_chinese_staff OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'chinese_staff'
  )
);

-- 한국팀은 모든 신청 조회
CREATE POLICY "korean_team_all_applications" ON inspection_applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() 
    AND role IN ('korean_team', 'admin')
  )
);

-- 채팅 메시지 접근 권한
CREATE POLICY "chat_participants_only" ON chat_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE reservation_number = chat_messages.reservation_number
    AND user_id = auth.uid()
  )
);
```

### 6.3 입력 검증
```typescript
// lib/validators/application.validator.ts
import { z } from 'zod'

export const ApplicationSchema = z.object({
  // 기본 정보
  company_name: z.string().min(2).max(100),
  company_name_chinese: z.string().min(2).max(100).optional(),
  contact_person: z.string().min(2).max(50),
  contact_phone: z.string().regex(/^[0-9-]+$/),
  contact_email: z.string().email(),
  
  // 서비스 정보
  service_type: z.enum([
    'quality_inspection',
    'factory_audit',
    'loading_inspection',
    'market_research',
    'import_shipping',
    'purchasing_agency',
    'shipping_agency'
  ]),
  
  // 제품 정보 (검품 서비스)
  product_name: z.string().min(2).max(200),
  production_quantity: z.number().int().positive(),
  inspection_method: z.enum(['standard', 'full']),
  
  // 공장 정보
  factory_name: z.string().min(2).max(100),
  factory_contact_person: z.string().min(2).max(50),
  factory_contact_phone: z.string().regex(/^[0-9-]+$/),
  factory_address: z.string().min(10).max(500),
  
  // 일정 정보
  inspection_start_date: z.string().datetime().optional(),
  inspection_days: z.number().int().min(1).max(30),
  
  // 추가 정보
  special_requirements: z.string().max(2000).optional(),
  file_uploads: z.array(z.string()).max(5).optional()
})

// 런타임 검증 미들웨어
export function validateRequest(schema: z.ZodSchema) {
  return async (req: Request) => {
    try {
      const body = await req.json()
      const validated = schema.parse(body)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      }
      throw error
    }
  }
}
```

---

## 7. 실시간 처리

### 7.1 Supabase Realtime 구성
```typescript
// lib/realtime/chat.realtime.ts
export class ChatRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  
  subscribeToChat(
    reservationNumber: string,
    onMessage: (message: ChatMessage) => void
  ) {
    const channel = supabase
      .channel(`chat:${reservationNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `reservation_number=eq.${reservationNumber}`
        },
        (payload) => {
          onMessage(payload.new as ChatMessage)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        this.updateOnlineUsers(state)
      })
      .subscribe()
      
    this.channels.set(reservationNumber, channel)
    return channel
  }
  
  async sendTypingIndicator(reservationNumber: string, userId: string) {
    const channel = this.channels.get(reservationNumber)
    if (channel) {
      await channel.track({
        user_id: userId,
        typing: true,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  unsubscribe(reservationNumber: string) {
    const channel = this.channels.get(reservationNumber)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(reservationNumber)
    }
  }
}
```

### 7.2 상태 변경 브로드캐스트
```typescript
// lib/realtime/status.realtime.ts
export class StatusRealtimeService {
  async broadcastStatusChange(
    reservationNumber: string,
    newStatus: OrderStatus,
    metadata?: any
  ) {
    // DB 업데이트는 자동으로 Realtime 이벤트 트리거
    const { data, error } = await supabase
      .from('inspection_applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('reservation_number', reservationNumber)
      
    // 추가 메타데이터 브로드캐스트
    await supabase
      .channel(`status:${reservationNumber}`)
      .send({
        type: 'broadcast',
        event: 'status_changed',
        payload: {
          reservation_number: reservationNumber,
          new_status: newStatus,
          metadata,
          timestamp: new Date().toISOString()
        }
      })
  }
}
```

---

## 8. Edge Functions 구조

### 8.1 번역 Edge Function
```typescript
// supabase/functions/translate/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from 'https://esm.sh/openai@4'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})

serve(async (req) => {
  try {
    const { text, from, to, context } = await req.json()
    
    // 캐시 확인
    const cacheKey = `translate:${from}:${to}:${text.substring(0, 50)}`
    const cached = await getCachedTranslation(cacheKey)
    if (cached) return new Response(JSON.stringify(cached))
    
    // GPT-4 번역
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Professional Korean-Chinese trade translator.
                   Context: ${context || 'General trade communication'}`
        },
        {
          role: "user", 
          content: `Translate from ${from} to ${to}: ${text}`
        }
      ],
      temperature: 0.3
    })
    
    const result = {
      original: text,
      translated: completion.choices[0].message.content,
      from,
      to,
      timestamp: new Date().toISOString()
    }
    
    // 캐시 저장
    await saveCacheTranslation(cacheKey, result)
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

### 8.2 워크플로우 엔진 Edge Function
```typescript
// supabase/functions/workflow-engine/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createMachine, interpret } from 'https://esm.sh/xstate@5'

// 검품 신청 워크플로우 상태머신
const inspectionMachine = createMachine({
  id: 'inspection',
  initial: 'submitted',
  states: {
    submitted: {
      on: {
        ASSIGN_STAFF: 'assigned',
        REJECT: 'rejected'
      }
    },
    assigned: {
      on: {
        SEND_QUOTE: 'quoted'
      }
    },
    quoted: {
      on: {
        CONFIRM_PAYMENT: 'paid',
        TIMEOUT: 'cancelled'
      }
    },
    paid: {
      on: {
        START_INSPECTION: 'in_progress'
      }
    },
    in_progress: {
      on: {
        UPLOAD_REPORT: 'report_uploaded'
      }
    },
    report_uploaded: {
      on: {
        APPROVE_REPORT: 'completed'
      }
    },
    completed: {
      type: 'final'
    },
    rejected: {
      type: 'final'
    },
    cancelled: {
      type: 'final'
    }
  }
})

serve(async (req) => {
  try {
    const { reservationNumber, event, metadata } = await req.json()
    
    // 현재 상태 조회
    const currentState = await getWorkflowState(reservationNumber)
    
    // 상태머신 실행
    const service = interpret(inspectionMachine)
      .start(currentState)
    
    // 이벤트 전송
    service.send(event, metadata)
    
    // 새 상태 저장
    const newState = service.getSnapshot()
    await saveWorkflowState(reservationNumber, newState)
    
    // 워크플로우 이벤트 기록
    await recordWorkflowEvent({
      reservation_number: reservationNumber,
      event_type: event,
      from_state: currentState,
      to_state: newState.value,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    // 상태 변경에 따른 액션 실행
    await executeStateActions(reservationNumber, newState.value)
    
    return new Response(JSON.stringify({
      success: true,
      currentState: newState.value,
      nextEvents: newState.nextEvents
    }))
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

### 8.3 문서 변환 Edge Function
```typescript
// supabase/functions/document-convert/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import mammoth from 'https://esm.sh/mammoth@1.6.0'

serve(async (req) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file || !file.name.match(/\.(docx?)$/i)) {
      throw new Error('Invalid file format. Only Word documents are supported.')
    }
    
    // Word 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    
    // Mammoth.js로 HTML 변환
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2",
          "p[style-name='Title'] => h1.title",
          "table => table.inspection-table"
        ],
        convertImage: mammoth.images.imgElement(async (image) => {
          const base64 = await image.read('base64')
          return {
            src: `data:${image.contentType};base64,${base64}`
          }
        })
      }
    )
    
    // 검품 보고서 특화 후처리
    const processedHtml = postProcessInspectionReport(result.value)
    
    return new Response(JSON.stringify({
      html: processedHtml,
      messages: result.messages,
      metadata: {
        originalName: file.name,
        size: file.size,
        convertedAt: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})

function postProcessInspectionReport(html: string): string {
  // 검품 보고서 특화 처리
  return html
    .replace(/검품일자[:：]\s*(\d{4}-\d{2}-\d{2})/g, 
      '<div class="inspection-date">검품일자: <strong>$1</strong></div>')
    .replace(/합격률[:：]\s*(\d+%)/g,
      '<div class="pass-rate">합격률: <span class="rate">$1</span></div>')
    .replace(/불량[:：]\s*(\d+)/g,
      '<div class="defect-count">불량: <span class="count">$1</span></div>')
}
```

---

## 9. Redis Queue (BullMQ) 구조

### 9.1 Queue 설정
```typescript
// lib/queue/config.ts
import { Queue, Worker, QueueScheduler } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
})

// Queue 정의
export const queues = {
  translation: new Queue('translation', { connection }),
  notification: new Queue('notification', { connection }),
  report: new Queue('report-processing', { connection }),
  workflow: new Queue('workflow', { connection }),
  email: new Queue('email', { connection })
}

// Scheduler (반복 작업용)
new QueueScheduler('translation', { connection })
new QueueScheduler('workflow', { connection })
```

### 9.2 번역 작업 Queue
```typescript
// lib/queue/workers/translation.worker.ts
import { Worker, Job } from 'bullmq'
import { TranslationService } from '@/lib/services/translation.service'

const translationService = new TranslationService()

export const translationWorker = new Worker(
  'translation',
  async (job: Job) => {
    const { text, from, to, priority } = job.data
    
    try {
      // 진행률 업데이트
      await job.updateProgress(10)
      
      // 번역 실행
      const result = await translationService.translateMessage(text, from, to)
      
      await job.updateProgress(90)
      
      // 결과 저장
      await saveTranslationResult(job.id, result)
      
      await job.updateProgress(100)
      
      return result
    } catch (error) {
      // 재시도 로직
      if (job.attemptsMade < job.opts.attempts) {
        throw error // BullMQ가 자동 재시도
      }
      
      // 최종 실패 처리
      await handleTranslationFailure(job.data, error)
      throw error
    }
  },
  {
    connection,
    concurrency: 5, // 동시 처리 수
    limiter: {
      max: 100,
      duration: 60000 // 분당 100개 제한
    }
  }
)

// 이벤트 핸들러
translationWorker.on('completed', (job, result) => {
  console.log(`Translation completed: ${job.id}`)
})

translationWorker.on('failed', (job, error) => {
  console.error(`Translation failed: ${job.id}`, error)
})
```

### 9.3 보고서 처리 Queue
```typescript
// lib/queue/workers/report.worker.ts
import { Worker, Job } from 'bullmq'
import { FileService } from '@/lib/services/file.service'

export const reportWorker = new Worker(
  'report-processing',
  async (job: Job) => {
    const { reportId, filePath, type } = job.data
    
    const steps = [
      { name: 'download', weight: 20 },
      { name: 'convert', weight: 30 },
      { name: 'analyze', weight: 30 },
      { name: 'save', weight: 20 }
    ]
    
    let progress = 0
    
    try {
      // 1. 파일 다운로드
      await job.updateProgress(progress)
      const file = await downloadFile(filePath)
      progress += steps[0].weight
      
      // 2. HTML 변환
      await job.updateProgress(progress)
      const html = await convertToHtml(file)
      progress += steps[1].weight
      
      // 3. AI 분석
      await job.updateProgress(progress)
      const analysis = await analyzeReport(html)
      progress += steps[2].weight
      
      // 4. 결과 저장
      await job.updateProgress(progress)
      await saveReportAnalysis(reportId, {
        html,
        analysis,
        processedAt: new Date()
      })
      progress += steps[3].weight
      
      await job.updateProgress(100)
      
      return { reportId, status: 'completed' }
    } catch (error) {
      await markReportFailed(reportId, error.message)
      throw error
    }
  },
  {
    connection,
    concurrency: 3 // 무거운 작업이므로 동시 처리 수 제한
  }
)
```

### 9.4 워크플로우 자동화 Queue
```typescript
// lib/queue/workers/workflow.worker.ts
import { Worker, Job } from 'bullmq'
import { WorkflowService } from '@/lib/services/workflow.service'

const workflowService = new WorkflowService()

export const workflowWorker = new Worker(
  'workflow',
  async (job: Job) => {
    const { reservationNumber, trigger, context } = job.data
    
    try {
      // 워크플로우 상태 확인
      const currentState = await workflowService.getState(reservationNumber)
      
      // 자동 전이 규칙 확인
      const transitions = await workflowService.getAutoTransitions(
        currentState,
        trigger
      )
      
      // 전이 실행
      for (const transition of transitions) {
        await workflowService.executeTransition(
          reservationNumber,
          transition,
          context
        )
        
        // 부가 작업 트리거
        if (transition.sideEffects) {
          for (const effect of transition.sideEffects) {
            await triggerSideEffect(effect, { reservationNumber, context })
          }
        }
      }
      
      return {
        reservationNumber,
        previousState: currentState,
        newState: await workflowService.getState(reservationNumber)
      }
    } catch (error) {
      await logWorkflowError(reservationNumber, error)
      throw error
    }
  },
  {
    connection,
    concurrency: 10
  }
)

// 반복 작업 설정 (예: 타임아웃 체크)
export async function setupWorkflowSchedules() {
  // 매 시간 결제 대기 타임아웃 체크
  await queues.workflow.add(
    'check-payment-timeout',
    { trigger: 'PAYMENT_TIMEOUT_CHECK' },
    {
      repeat: {
        pattern: '0 * * * *' // 매 시간
      }
    }
  )
  
  // 매일 자정 상태 정리
  await queues.workflow.add(
    'daily-cleanup',
    { trigger: 'DAILY_CLEANUP' },
    {
      repeat: {
        pattern: '0 0 * * *' // 매일 자정
      }
    }
  )
}
```

### 9.5 Queue 모니터링
```typescript
// lib/queue/monitor.ts
import { Queue } from 'bullmq'
import Bull from 'bull'

export class QueueMonitor {
  async getQueueStats(queueName: string) {
    const queue = queues[queueName]
    
    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount()
    ])
    
    return {
      name: queueName,
      counts: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused
      },
      throughput: await this.calculateThroughput(queue),
      health: this.calculateHealth({ waiting, failed, active })
    }
  }
  
  private async calculateThroughput(queue: Queue) {
    const jobs = await queue.getCompleted(0, 100)
    if (jobs.length < 2) return 0
    
    const timeRange = jobs[0].finishedOn - jobs[jobs.length - 1].finishedOn
    return Math.round((jobs.length / timeRange) * 1000 * 60) // jobs per minute
  }
  
  private calculateHealth(counts: any) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const failureRate = counts.failed / total
    
    if (failureRate > 0.1) return 'critical'
    if (failureRate > 0.05) return 'warning'
    if (counts.waiting > 1000) return 'warning'
    return 'healthy'
  }
}

// Queue 대시보드 API
export async function GET(request: Request) {
  const monitor = new QueueMonitor()
  const stats = await Promise.all(
    Object.keys(queues).map(name => monitor.getQueueStats(name))
  )
  
  return NextResponse.json({ queues: stats })
}
```

---

## 10. 외부 서비스 통합

### 10.1 이메일 서비스
```typescript
// lib/services/email.service.ts
export class EmailService {
  private transporter: Transporter
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }
  
  async sendApplicationConfirmation(
    to: string,
    application: Application
  ) {
    const template = await this.loadTemplate('application-confirmation')
    const html = await this.renderTemplate(template, {
      reservationNumber: application.reservation_number,
      productName: application.product_name,
      companyName: application.company_name,
      status: application.status
    })
    
    await this.transporter.sendMail({
      from: '"두리무역" <noreply@duly.co.kr>',
      to,
      subject: `[두리무역] 신청 확인 - ${application.reservation_number}`,
      html
    })
  }
  
  async sendQuotation(
    to: string,
    quotation: Quotation
  ) {
    // PDF 생성
    const pdfBuffer = await this.generateQuotationPDF(quotation)
    
    await this.transporter.sendMail({
      from: '"두리무역" <noreply@duly.co.kr>',
      to,
      subject: `[두리무역] 견적서 - ${quotation.reservation_number}`,
      html: await this.renderTemplate('quotation', quotation),
      attachments: [
        {
          filename: `견적서_${quotation.reservation_number}.pdf`,
          content: pdfBuffer
        }
      ]
    })
  }
}
```

### 8.2 파일 처리 서비스
```typescript
// lib/services/file.service.ts
export class FileService {
  async uploadFile(
    file: File,
    path: string
  ): Promise<UploadResult> {
    // 1. 파일 검증
    this.validateFile(file)
    
    // 2. 이미지/동영상 압축
    let processedFile = file
    if (this.shouldCompress(file)) {
      processedFile = await this.compressFile(file)
    }
    
    // 3. Supabase Storage 업로드
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, processedFile, {
        cacheControl: '3600',
        upsert: false
      })
      
    if (error) throw new UploadError(error.message)
    
    // 4. 메타데이터 저장
    await this.saveFileMetadata({
      path: data.path,
      originalName: file.name,
      size: processedFile.size,
      mimeType: file.type,
      uploadedAt: new Date()
    })
    
    return {
      url: this.getPublicUrl(data.path),
      path: data.path,
      size: processedFile.size
    }
  }
  
  private async compressFile(file: File): Promise<File> {
    if (file.type.startsWith('image/')) {
      return this.compressImage(file)
    } else if (file.type.startsWith('video/')) {
      return this.compressVideo(file)
    }
    return file
  }
  
  private async compressImage(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // 최대 크기 제한
    const maxSize = 1920
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    
    canvas.width = bitmap.width * scale
    canvas.height = bitmap.height * scale
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        0.85 // 품질 85%
      )
    })
    
    return new File([blob], file.name, { type: 'image/jpeg' })
  }
}
```

### 8.3 알림 서비스
```typescript
// lib/services/notification.service.ts
export class NotificationService {
  async send(notification: Notification) {
    // 1. 알림 타입별 처리
    switch (notification.type) {
      case 'new_application':
        await this.sendNewApplicationNotification(notification)
        break
        
      case 'status_changed':
        await this.sendStatusChangeNotification(notification)
        break
        
      case 'payment_reminder':
        await this.sendPaymentReminder(notification)
        break
    }
    
    // 2. 알림 기록 저장
    await this.saveNotificationLog(notification)
  }
  
  private async sendNewApplicationNotification(
    notification: Notification
  ) {
    const { recipient, data } = notification
    
    // 이메일 발송
    await this.emailService.send({
      to: recipient.email,
      subject: '새로운 신청이 접수되었습니다',
      template: 'new-application',
      data: {
        reservationNumber: data.reservation_number,
        companyName: data.company_name,
        productName: data.product_name
      }
    })
    
    // 인앱 알림
    await supabase
      .from('notifications')
      .insert({
        user_id: recipient.id,
        type: 'new_application',
        title: '새로운 신청',
        message: `${data.company_name}에서 새로운 신청이 접수되었습니다`,
        data: { reservation_number: data.reservation_number },
        read: false
      })
  }
}
```

---

## 📊 성능 최적화

### 데이터베이스 최적화
```typescript
// 1. 인덱스 생성
CREATE INDEX idx_applications_status ON inspection_applications(status);
CREATE INDEX idx_applications_user ON inspection_applications(user_id);
CREATE INDEX idx_applications_staff ON inspection_applications(assigned_chinese_staff);
CREATE INDEX idx_messages_reservation ON chat_messages(reservation_number);

// 2. 쿼리 최적화
const applications = await supabase
  .from('inspection_applications')
  .select('id, reservation_number, status, created_at') // 필요한 필드만
  .eq('status', 'submitted')
  .order('created_at', { ascending: false })
  .limit(20) // 페이지네이션

// 3. 캐싱 전략
const cached = await redis.get(`application:${id}`)
if (cached) return JSON.parse(cached)

const data = await fetchApplication(id)
await redis.set(`application:${id}`, JSON.stringify(data), 'EX', 300)
```

### API 응답 최적화
```typescript
// 1. 응답 압축
app.use(compression())

// 2. 부분 응답
const fields = request.query.fields?.split(',')
const selected = fields ? pick(data, fields) : data

// 3. 스트리밍 응답
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const data = await fetchLargeData()
      for (const chunk of data) {
        controller.enqueue(JSON.stringify(chunk))
      }
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

---

## 🔄 에러 처리

### 전역 에러 핸들러
```typescript
// lib/errors/handler.ts
export function errorHandler(error: Error): NextResponse {
  console.error(error)
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    )
  }
  
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // 기본 에러
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// API Route에서 사용
export async function GET(request: Request) {
  try {
    const data = await someOperation()
    return NextResponse.json({ data })
  } catch (error) {
    return errorHandler(error)
  }
}
```

---

## 🧪 테스트 전략

### 단위 테스트
```typescript
// __tests__/services/pricing.test.ts
describe('PricingService', () => {
  const service = new PricingService()
  
  it('should calculate inspection price with discount', () => {
    const result = service.calculate({
      serviceType: 'quality_inspection',
      days: 7
    })
    
    expect(result.dailyRate).toBe(270000) // 5-9일 할인
    expect(result.total).toBe(2835000) // 마진 포함
  })
})
```

### 통합 테스트
```typescript
// __tests__/api/applications.test.ts
describe('POST /api/applications', () => {
  it('should create new application', async () => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockApplicationData)
    })
    
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.application.reservation_number).toMatch(/^DL-\d{8}-\d{6}$/)
  })
})
```

---

*본 문서는 두리무역 디지털 전환 프로젝트의 백엔드 설계를 담은 공식 문서입니다.*