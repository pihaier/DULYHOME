# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Duly Trading ERP System (두리무역 ERP 시스템)** - a comprehensive ERP platform for Korea-China trade operations. After complete codebase deletion on 2025-01-27, the project is being rebuilt from scratch based on 21 comprehensive project documents.

⚠️ **REBUILD STATUS**: Phase 2 in progress (2025-01-28) - Core infrastructure being implemented following 00_INDEX.md roadmap.

## 🛠️ **MCP (Model Context Protocol) Tools Usage**

When developing this project, Claude Code MUST utilize the following MCP tools:

### Required MCP Tools:
- **📂 Desktop MCP** (`mcp__desktop-commander`): For file operations, code analysis, and local development
- **🔄 Sequential Thinking MCP** (`mcp__mcp-sequentialthinking-tools`): For complex problem-solving and planning
- **☁️ Supabase MCP** (`mcp__supabase`): For database operations, migrations, and backend management
- **📚 Context7 MCP** (`mcp__context7-mcp`): For documentation lookup and library references

### MCP Usage Guidelines:
```bash
# Example workflow using MCP tools
1. Use desktop MCP to read current implementation
2. Use seq MCP to plan complex changes
3. Use supabase MCP to verify database schema
4. Use c7 MCP to check library documentation
```

## 📋 **Project Documentation Reference**

**🎯 핵심 원칙: "문서 기반 개발" - 모든 코딩은 문서에 기반하여 진행**

### 📁 **프로젝트 문서 구조** (`/project-docs/`)
21개 표준 프로젝트 문서가 체계적으로 정리되어 있습니다:

- **📖 시작점**: [`00_INDEX.md`](./project-docs/00_INDEX.md) - 전체 문서 인덱스 및 진행 현황
- **🏢 기획 문서 (01-06)**: 프로젝트 헌장, 비즈니스 케이스, 전체 기획서 등
- **🔧 기술 문서 (07-12)**: 요구사항, 아키텍쳐, 프론트엔드/백엔드 설계 등  
- **✅ 품질 문서 (13-15)**: 테스트 계획, 코드 규범, 검수 기준
- **🚀 운영 문서 (16-18)**: 배포, 운영 매뉴얼, 사용자 가이드
- **📝 유지보수 (19-20)**: 변경 로그, GitHub 라이브러리 추천

### 💡 **개발 워크플로우 - 문서별 개발 가이드**

#### 1️⃣ **프로젝트 이해 단계**
```
필수 읽기:
├── 01_PROJECT_CHARTER.md      → 프로젝트 목표와 범위 이해
├── 02_BUSINESS_CASE.md        → 비즈니스 가치와 ROI 이해
├── 03_OVERALL_PLANNING.md     → 전체 시스템 구조 파악
└── 07_REQUIREMENTS.md         → 기능 요구사항 상세 확인
```

#### 2️⃣ **개발 준비 단계**
```
아키텍처 확인:
├── 08_TECH_ARCHITECTURE.md    → 기술 스택 및 아키텍처 패턴
├── 09_FRONTEND_DESIGN.md      → 82개 페이지 UI/UX 설계
├── 10_BACKEND_DESIGN.md       → API 구조 및 서버 로직
├── 11_DATABASE_DESIGN.md      → 테이블 구조 및 RLS 정책
├── SERVICE_FIELDS_DEFINITION.md → 7개 서비스별 필드 정의
└── 12_API_DOCUMENTATION.md    → RESTful API 명세
```

#### 3️⃣ **코딩 단계**
```
개발 규칙:
├── 14_CODE_STANDARDS.md       → TypeScript/React 코딩 규범
├── 13_TEST_PLAN.md           → 테스트 작성 가이드
└── 15_ACCEPTANCE_CRITERIA.md  → 기능별 완료 기준
```

#### 4️⃣ **배포 및 운영 단계**
```
운영 준비:
├── 16_DEPLOYMENT.md          → Vercel/Supabase 배포 절차
├── 17_OPERATIONS_MANUAL.md   → 운영 및 모니터링
├── 18_USER_MANUAL.md         → 사용자 가이드
└── 19_CHANGELOG.md           → 변경사항 기록
```

### 🚨 **현재 개발 상황 (2025-01-28)**
- **코드베이스**: 2025-01-27 전체 삭제 후 재구축 중
- **진행 단계**: Phase 2 - 핵심 기능 구현 (00_INDEX.md 참조)
- **완료 사항**: 
  - ✅ Next.js 15 프로젝트 초기화
  - ✅ Tailwind CSS Plus 템플릿 통합
  - ✅ 7개 서비스 폴더 구조 생성
- **진행 중**:
  - 🚧 Supabase 스키마 마이그레이션
  - 🚧 RLS 정책 설정
  - 🚧 기본 인증 시스템 구현

### 📊 **개발 시 문서 참조 매트릭스**

| 개발 작업 | 필수 참조 문서 | MCP 도구 활용 |
|-----------|---------------|--------------|
| **새 기능 추가** | 07_REQUIREMENTS.md → 09_FRONTEND_DESIGN.md → SERVICE_FIELDS_DEFINITION.md | desktop MCP로 기존 코드 분석 |
| **API 개발** | 12_API_DOCUMENTATION.md → 10_BACKEND_DESIGN.md → 14_CODE_STANDARDS.md | supabase MCP로 DB 스키마 확인 |
| **DB 스키마 변경** | 11_DATABASE_DESIGN.md → SERVICE_FIELDS_DEFINITION.md | supabase MCP로 마이그레이션 생성 |
| **테스트 작성** | 13_TEST_PLAN.md → 15_ACCEPTANCE_CRITERIA.md | seq MCP로 테스트 시나리오 계획 |
| **버그 수정** | 07_REQUIREMENTS.md → 해당 설계 문서 → 19_CHANGELOG.md | desktop MCP로 버그 추적 |
| **성능 최적화** | 11_DATABASE_DESIGN.md (섹션 5.5) → 17_OPERATIONS_MANUAL.md (섹션 11) | seq MCP로 최적화 전략 수립 |
| **보안 강화** | 14_CODE_STANDARDS.md (섹션 9) → 16_DEPLOYMENT.md (섹션 11.2) | c7 MCP로 보안 라이브러리 확인 |

### Core Business Value (from 02_BUSINESS_CASE.md)
- **Complete Automation**: From application to report delivery (70% time reduction)
- **Real-time Translation**: GPT-4 powered Korean↔Chinese instant translation
- **Unified Platform**: 6 roles (customer, chinese_staff, korean_team, admin, inspector, factory)
- **No-login Access**: Simple access with reservation number (DL-YYYYMMDD-XXXXXX)
- **CRM Integration**: Complete integration with existing business systems
- **ROI**: 470% expected return on investment
- **Revenue Growth**: 5.4억원 annual revenue increase projected

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components + Tailwind CSS Plus templates
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Real-time**: Supabase Realtime (for chat functionality)
- **Authentication**: Supabase Auth (email/password, OAuth providers, MFA)
- **AI Integration**: OpenAI GPT-4 (for real-time translation)
- **File Processing**: mammoth.js (Word to HTML conversion)
- **State Management**: React Context API (GlobalContext)
- **Server State**: React Query (for data fetching)
- **Email Service**: TBD (for automated notifications)

## Important Development Rules

### ⚠️ Database Migration Rules
**NEVER use MCP tools for database migrations!** 
- ❌ Do NOT use `mcp__supabase__apply_migration` 
- ❌ Do NOT use `mcp__supabase__execute_sql` for DDL operations
- ✅ ALWAYS use Supabase CLI commands for migrations
- ✅ Test locally first with `npx supabase db reset --local`
- ✅ Apply to production with `npx supabase db push`
- ✅ Refer to `CLI_COMMANDS.md` for proper migration commands

## Development Commands

```bash
# Navigate to Next.js directory first
cd nextjs

# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Run linter
npm run lint

# Type checking  
npm run type-check

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Supabase commands (from project root)
npx supabase login
npx supabase link
npx supabase config push
npx supabase migrations up --linked
npx supabase db reset --linked  # Reset local database
npx supabase gen types typescript --linked > nextjs/src/lib/types/database.ts
```

## Project Structure

The main application is in the `nextjs/` directory:

- `src/app/`: Next.js App Router pages
  - `api/`: API routes (auth, webhooks, integrations)
  - `application/`: Inspection application pages
    - `new/`: New application form
    - `[reservationNumber]/`: Application details view
  - `chat/`: Real-time chat system
    - `[reservationNumber]/`: Chat room by reservation
  - `dashboard/`: Role-based dashboards
  - `admin/`: Admin panel (korean_team only)
  - `crm/`: CRM system (korean_team only)
  - `auth/`: Authentication pages
  - `profile/`: User profile management
  - `legal/`: Privacy policy and terms pages
- `src/components/`: Reusable React components
- `src/lib/`: Utilities and configurations
  - `context/`: GlobalContext for user state management
  - `supabase/`: Supabase client configurations (browser, server, service)
  - `types.ts`: TypeScript type definitions
- `supabase/`: Database migrations and configuration
- `tailwind css/`: Additional Tailwind templates for reference

## Environment Variables (16_DEPLOYMENT.md 섹션 5 참조)

Required environment variables (set in `.env.local`):

```bash
# Supabase (자동 동기화 - Vercel Integration 사용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for GPT-4 translation)
OPENAI_API_KEY=your_openai_api_key

# Rate Limiting (12_API_DOCUMENTATION.md 참조)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Email Service
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM_ADDRESS=noreply@duly.co.kr

# File Upload (14_CODE_STANDARDS.md 섹션 9.4 참조)
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Application Settings (02_BUSINESS_CASE.md 참조)
DAILY_RATE=290000  # Korean Won
MARGIN_PERCENTAGE=50  # 50% margin

# Security (14_CODE_STANDARDS.md 섹션 9.6 참조)
ENCRYPTION_KEY=32_character_encryption_key_here
JWT_SECRET=your_jwt_secret_minimum_32_chars
CSRF_SECRET=your_csrf_secret_key
```

## Key Architectural Patterns

### 1. Multi-Role Access Control
Six distinct user roles with different permissions:
- `customer`: Can submit applications, view own data
- `chinese_staff`: Manages assigned inspections, uploads reports
- `korean_team`: Full system access except admin panel
- `admin`: Full system access including admin panel
- `inspector`: Guest access to chat only
- `factory`: Guest access to chat only

**Role checking pattern:**
```typescript
// Use the useUser hook from GlobalContext
const { user, userProfile } = useUser();
const isAdmin = userProfile?.role === 'admin';
const isKoreanTeam = ['korean_team', 'admin'].includes(userProfile?.role);
```

### 2. Reservation Number System
- Format: `DL-YYYYMMDD-XXXXXX` (e.g., DL-20240115-123456)
- Allows no-login access to application details and chat
- Primary identifier for all transactions

### 3. Real-time Translation Architecture
- All chat messages stored in both original and translated versions
- GPT-4 API handles context-aware translation
- Korean users see Korean only, Chinese users see Chinese only
- Korean team sees both original and translated messages

### 4. Supabase Client Pattern (inherited)
- `createClient()`: Browser client for client components
- `createServerClient()`: Server client for server components and route handlers
- `createServiceClient()`: Service role client for admin operations

**⚠️ CRITICAL: Vercel-Supabase Integration 환경변수 설정**
```bash
# Vercel-Supabase 공식 Integration 사용 시 환경변수 형태:
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# 로컬 개발용 (NEXT_PUBLIC_ prefix 필요):
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# next.config.js에서 Vercel Integration 환경변수를 클라이언트용으로 매핑:
env: {
  NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}
```

**Usage patterns:**
```typescript
// Client components - 두 환경변수 모두 지원
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server components and API routes - 두 환경변수 모두 지원
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()

// Admin operations
import { createServiceClient } from '@/lib/supabase/service'
const supabase = createServiceClient()
```

### 5. File Upload Strategy
- Supabase Storage for file management
- Automatic compression for images/videos
- Multiple file support (up to 5 files per application)
- Secure file access with RLS policies

## Workflow Automation

### Application Flow
1. Customer submits application → Auto-assigns to chinese_staff
2. Chinese staff coordinates with factory → Sends quote
3. Customer pays → Korean team confirms → Inspection proceeds
4. Chinese staff uploads report → Korean team translates/reviews
5. Customer receives final report

### Status Transitions
- `submitted` → `quoted` → `paid` → `in_progress` → `completed`
- Payment timeout: Auto-cancellation if not paid by deadline
- 3-day rule: Auto-deletion if no response

## Page Reference

All page implementations should follow the specifications in `/Users/gimduho/Desktop/erp커스텀/page.md`, which contains:
- Detailed field definitions for each page
- Role-based access permissions
- UI/UX requirements
- Business logic rules

## Important Implementation Notes

1. **Development Status**: This project is in active development phase. All functionalities are being implemented from scratch.

2. **Language Handling**:
   - System auto-detects language (Korean default)
   - Chinese users can manually switch to Chinese
   - All customer-facing content in Korean
   - All China-facing content in Chinese

3. **Guest Access Pattern**:
   - Chinese staff generates unique URLs for factory/inspector
   - URLs include embedded authentication tokens
   - No login required for guest roles

4. **Pricing Logic**:
   - 1-4 days: 290,000 KRW/day
   - 5-9 days: 270,000 KRW/day
   - 10+ days: 250,000 KRW/day
   - 50% margin added (customer doesn't see this)

5. **Security Considerations**:
   - Never expose margin information to customers
   - All financial calculations server-side only
   - Guest URLs expire after inspection completion
   - File uploads scanned and validated

6. **Integration Points**:
   - GPT-4 API for translation (maintain context)
   - Email service for notifications
   - Google Search API for CRM features
   - Existing duly.co.kr website for reference

## Database Schema

### Core Tables Structure

```sql
-- Users and Authentication
users (Supabase Auth)
├── id: uuid
├── email: string
├── role: enum (customer, chinese_staff, korean_team, admin, inspector, factory)
└── created_at: timestamp

user_profiles
├── user_id: uuid (FK → users.id)
├── company_name: string
├── company_name_chinese: string
├── contact_person: string
├── phone: string
├── language_preference: enum (ko, zh)
├── approval_status: enum (pending, approved, rejected)
└── updated_at: timestamp

-- Inspection Applications
inspection_applications
├── id: uuid
├── reservation_number: string (unique, DL-YYYYMMDD-XXXXXX)
├── user_id: uuid (FK → users.id)
├── company_name: string
├── contact_person: string
├── contact_phone: string
├── contact_email: string
├── service_type: enum (quality_inspection, factory_audit, loading_inspection)
├── product_name: string
├── product_name_translated: string
├── production_quantity: integer
├── inspection_method: enum (standard, full)
├── factory_name: string
├── factory_contact_person: string
├── factory_contact_phone: string
├── factory_address: string
├── schedule_coordination_status: enum (not_coordinated, coordinated)
├── inspection_start_date: date
├── inspection_days: integer
├── special_requirements: text
├── special_requirements_translated: text
├── status: enum (submitted, quoted, paid, in_progress, completed, cancelled)
├── payment_status: enum (pending, paid, refunded)
├── total_amount: decimal
├── margin_amount: decimal
├── assigned_chinese_staff: uuid (FK → users.id)
├── confirmed_start_date: date
├── confirmed_end_date: date
├── created_at: timestamp
└── updated_at: timestamp

-- Chat System
chat_messages
├── id: uuid
├── reservation_number: string (FK → inspection_applications.reservation_number)
├── sender_id: uuid (FK → users.id)
├── sender_name: string
├── sender_role: string
├── original_message: text
├── original_language: enum (ko, zh)
├── translated_message: text
├── translated_language: enum (ko, zh)
├── message_type: enum (text, file, image, video)
├── file_url: string
├── file_name: string
├── file_size: bigint
├── created_at: timestamp
└── is_deleted: boolean

chat_participants
├── id: uuid
├── reservation_number: string (FK → inspection_applications.reservation_number)
├── user_id: uuid (FK → users.id)
├── role: string
├── is_online: boolean
├── last_seen: timestamp
├── joined_at: timestamp
└── left_at: timestamp

-- File Management
uploaded_files
├── id: uuid
├── reservation_number: string (FK → inspection_applications.reservation_number)
├── uploaded_by: uuid (FK → users.id)
├── original_filename: string
├── file_path: string
├── file_size: bigint
├── file_type: string
├── mime_type: string
├── upload_purpose: enum (application, chat, report)
├── created_at: timestamp
└── is_deleted: boolean

-- Reports
inspection_reports
├── id: uuid
├── reservation_number: string (FK → inspection_applications.reservation_number)
├── original_filename: string
├── file_path: string
├── report_type: string
├── status: enum (uploaded, processing, completed)
├── uploaded_by: uuid (FK → users.id)
├── uploaded_at: timestamp
├── report_url: string
├── translated_content: jsonb
└── approved_by: uuid (FK → users.id)

-- CRM
crm_companies
├── id: uuid
├── company_name: string
├── company_name_cleaned: string
├── official_website: string
├── phone_number: string
├── fax_number: string
├── email: string
├── address: text
├── estimated_revenue: decimal
├── assigned_sales_person: uuid (FK → users.id)
├── last_contact_date: date
├── next_follow_up_date: date
├── created_at: timestamp
└── updated_at: timestamp

-- Logs
activity_logs
├── id: uuid
├── user_id: uuid (FK → users.id)
├── action: string
├── entity_type: string
├── entity_id: uuid
├── metadata: jsonb
├── ip_address: inet
└── created_at: timestamp

change_logs
├── id: uuid
├── reservation_number: string (FK → inspection_applications.reservation_number)
├── changed_by: uuid (FK → users.id)
├── field_name: string
├── old_value: text
├── new_value: text
├── change_reason: text
└── created_at: timestamp
```

### RLS (Row Level Security) Policies

```sql
-- Examples of key RLS policies
-- Customers can only see their own data
CREATE POLICY "customers_own_data" ON inspection_applications
FOR SELECT USING (auth.uid() = user_id);

-- Chinese staff can see assigned inspections
CREATE POLICY "chinese_staff_assigned" ON inspection_applications
FOR SELECT USING (
  auth.uid() = assigned_chinese_staff 
  OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'chinese_staff'
  )
);

-- Korean team can see everything
CREATE POLICY "korean_team_all_access" ON inspection_applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('korean_team', 'admin')
  )
);
```

## API Endpoints

### Authentication Endpoints
```typescript
// Auth routes
POST   /api/auth/register          // User registration
POST   /api/auth/login            // User login
POST   /api/auth/logout           // User logout
POST   /api/auth/refresh          // Refresh token
GET    /api/auth/profile          // Get user profile
PUT    /api/auth/profile          // Update user profile
POST   /api/auth/guest-url        // Generate guest URL for factory/inspector
```

### Application Management
```typescript
// Application routes
POST   /api/applications                      // Create new application
GET    /api/applications                      // List applications (filtered by role)
GET    /api/applications/:reservationNumber   // Get application details
PUT    /api/applications/:reservationNumber   // Update application
DELETE /api/applications/:reservationNumber   // Cancel application

// Application actions
POST   /api/applications/:reservationNumber/quote      // Send quote
POST   /api/applications/:reservationNumber/payment    // Confirm payment
POST   /api/applications/:reservationNumber/schedule   // Update schedule
POST   /api/applications/:reservationNumber/assign     // Assign staff
```

### Chat System
```typescript
// Chat routes
GET    /api/chat/:reservationNumber/messages     // Get chat messages
POST   /api/chat/:reservationNumber/messages     // Send message
PUT    /api/chat/:reservationNumber/messages/:id // Update message
DELETE /api/chat/:reservationNumber/messages/:id // Delete message

// Chat real-time
GET    /api/chat/:reservationNumber/participants // Get participants
POST   /api/chat/:reservationNumber/typing       // Send typing indicator
POST   /api/chat/:reservationNumber/read         // Mark messages as read
```

### File Management
```typescript
// File routes
POST   /api/files/upload              // Upload file
GET    /api/files/:fileId            // Download file
DELETE /api/files/:fileId            // Delete file
POST   /api/files/compress           // Compress image/video
```

### Report Management
```typescript
// Report routes
POST   /api/reports/:reservationNumber/upload     // Upload report
GET    /api/reports/:reservationNumber            // Get reports
POST   /api/reports/:reservationNumber/translate  // Translate report
POST   /api/reports/:reservationNumber/approve    // Approve report
```

### Translation Service
```typescript
// Translation routes
POST   /api/translate                 // Translate text
POST   /api/translate/batch          // Batch translate
GET    /api/translate/usage          // Get usage statistics
```

### Admin Routes
```typescript
// Admin routes (korean_team only)
GET    /api/admin/stats              // Dashboard statistics
GET    /api/admin/users              // List all users
PUT    /api/admin/users/:id/approve  // Approve user
PUT    /api/admin/users/:id/reject   // Reject user
GET    /api/admin/logs               // System logs
PUT    /api/admin/settings           // Update system settings
```

## Chat System Implementation Details

### Architecture Overview
The chat system is built on Supabase Realtime with GPT-4 translation layer.

### Implementation Steps

1. **Set up Supabase Realtime channels**
```typescript
// Subscribe to chat messages
const channel = supabase.channel(`chat:${reservationNumber}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `reservation_number=eq.${reservationNumber}`
  }, handleNewMessage)
  .subscribe()
```

2. **Message Flow with Translation**
```typescript
// Send message flow
async function sendMessage(message: string) {
  // 1. Detect language
  const language = detectLanguage(message)
  
  // 2. Translate if needed
  const translated = await translateMessage(message, language)
  
  // 3. Insert to database
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      original_message: message,
      original_language: language,
      translated_message: translated.text,
      translated_language: translated.targetLang,
      // ... other fields
    })
}
```

3. **Role-based Message Display**
```typescript
// Display logic
function displayMessage(message: ChatMessage, userRole: string) {
  switch(userRole) {
    case 'customer':
      // Korean customers see Korean only
      return message.original_language === 'ko' 
        ? message.original_message 
        : message.translated_message
        
    case 'chinese_staff':
    case 'factory':
    case 'inspector':
      // Chinese users see Chinese only
      return message.original_language === 'zh' 
        ? message.original_message 
        : message.translated_message
        
    case 'korean_team':
    case 'admin':
      // Korean team sees both
      return {
        original: message.original_message,
        translated: message.translated_message
      }
  }
}
```

### Recommended Chat UI Libraries
- **Option 1**: Custom implementation with Supabase Realtime
- **Option 2**: [react-chat-elements](https://github.com/detaysoft/react-chat-elements)
- **Option 3**: [stream-chat-react](https://github.com/GetStream/stream-chat-react)
- **Option 4**: Modify [Supabase Chat Example](https://github.com/supabase/supabase/tree/master/examples/realtime/nextjs-realtime-chat)

## Deployment Strategy

### Development Workflow
1. **Local Development**: Use Supabase local development
2. **Staging**: Deploy to Vercel preview branches
3. **Production**: Deploy to main Vercel deployment

### Environment Management
```bash
# Local development
.env.local

# Staging
.env.staging

# Production
.env.production
```

## 🔒 Security & Backup Policy

### Data Backup Strategy
**⚠️ CRITICAL SECURITY NOTICE**:
- **NEVER** store production data in GitHub (Actions, Artifacts, or repositories)
- **NEVER** create scripts that export customer data to external services
- **ALWAYS** use Supabase's built-in backup features for production data

#### Approved Backup Methods:
1. **Production Database**: 
   - Use Supabase Dashboard → Settings → Database → Backups
   - Enable Point-in-time Recovery (PITR)
   - Automatic daily backups (30-day retention)
   
2. **Development Database**:
   - Local backups only with test data
   - Use `pg_dump` for local development snapshots
   
3. **Compliance**:
   - All backups must comply with 개인정보보호법 (PIPA)
   - Customer data must remain within Supabase's secure infrastructure
   - No customer data in version control or CI/CD pipelines

### CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run build
      - uses: vercel/action@v3
```

### Monitoring and Logging
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics / Vercel Analytics
- **Logs**: Supabase logs + custom logging to activity_logs table
- **Performance**: Vercel Speed Insights

## Common Development Tasks (with MCP Tools & Documentation)

### 🔍 **개발 시작 전 체크리스트**
```bash
# 1. MCP 도구로 현재 상태 파악
□ desktop MCP: 현재 구현 상태 확인
□ supabase MCP: DB 스키마 현황 확인
□ seq MCP: 작업 계획 수립

# 2. 문서 확인 (필수)
□ 07_REQUIREMENTS.md: 요구사항 확인
□ 해당 설계 문서: 아키텍처 이해
□ 14_CODE_STANDARDS.md: 코딩 규범 확인
□ 15_ACCEPTANCE_CRITERIA.md: 완료 기준 확인
```

### Adding a New Page
```bash
# Step 1: 문서 확인 (desktop MCP 사용)
mcp__desktop-commander read_file {
  path: "project-docs/09_FRONTEND_DESIGN.md"
}

# Step 2: 기존 구현 분석 (desktop MCP 사용)
mcp__desktop-commander search_code {
  path: "nextjs/src/app",
  pattern: "similar-page-pattern"
}

# Step 3: 구현 (참조 문서)
- 09_FRONTEND_DESIGN.md → 페이지 구조
- SERVICE_FIELDS_DEFINITION.md → 필드 정의
- 14_CODE_STANDARDS.md → 코딩 규범

# Step 4: 변경사항 기록
- 19_CHANGELOG.md 업데이트
```

### Implementing Real-time Features
```bash
# 참조 문서: 11_DATABASE_DESIGN.md (Realtime 섹션)
# MCP 활용: supabase MCP로 realtime 채널 확인

# Step 1: DB 스키마 확인
mcp__supabase list_tables {
  schemas: ["public"]
}

# Step 2: Realtime 구현 (08_TECH_ARCHITECTURE.md 참조)
1. Supabase Realtime subscriptions
2. Handle connection state properly
3. Implement optimistic updates for better UX
4. Always consider translation needs
```

### Working with Translations
```bash
# 참조 문서: 07_REQUIREMENTS.md (번역 요구사항)
# MCP 활용: c7 MCP로 OpenAI 라이브러리 문서 확인

mcp__context7-mcp get-library-docs {
  context7CompatibleLibraryID: "/openai/openai-node",
  topic: "chat completions"
}
```

### Adding New Database Tables
```bash
# 참조 문서: 11_DATABASE_DESIGN.md, SERVICE_FIELDS_DEFINITION.md

# Step 1: 스키마 설계 검토 (seq MCP 사용)
mcp__mcp-sequentialthinking-tools sequentialthinking_tools {
  available_mcp_tools: ["mcp__supabase"],
  thought: "새 테이블 설계 검토"
}

# Step 2: 마이그레이션 생성 (supabase MCP 사용)
mcp__supabase apply_migration {
  name: "add_new_table",
  query: "CREATE TABLE ..."
}

# Step 3: RLS 정책 적용 (11_DATABASE_DESIGN.md 섹션 5.5 참조)
# Step 4: TypeScript 타입 생성
npx supabase gen types typescript --linked > nextjs/src/lib/types/database.ts

# Step 5: 문서 업데이트
- 11_DATABASE_DESIGN.md에 새 테이블 추가
- 19_CHANGELOG.md에 변경사항 기록
```

### Working with Global State
```typescript
// 참조 문서: 08_TECH_ARCHITECTURE.md (상태 관리 섹션)
// In components
import { useUser } from '@/lib/context/GlobalContext'
const { user, userProfile, loading } = useUser()

// In providers
import { GlobalProvider } from '@/lib/context/GlobalContext'
// Wrap your app with <GlobalProvider>
```

### Testing Strategy
```bash
# 참조 문서: 13_TEST_PLAN.md

# MCP 활용 예시
# 1. 테스트 시나리오 계획 (seq MCP)
mcp__mcp-sequentialthinking-tools sequentialthinking_tools {
  available_mcp_tools: ["mcp__desktop-commander"],
  thought: "테스트 시나리오 수립"
}

# 2. 테스트 실행 (desktop MCP)
mcp__desktop-commander start_process {
  command: "cd nextjs && npm test",
  timeout_ms: 60000
}

# 테스트 종류 (13_TEST_PLAN.md 참조)
1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: Playwright  
3. **Database Tests**: pgTAP (supabase MCP 사용)
4. **API Tests**: Supertest
```

## Development Best Practices

### Code Organization (14_CODE_STANDARDS.md 준수)
- Use barrel exports for cleaner imports
- Separate business logic from UI components  
- Create custom hooks for repeated logic
- Use TypeScript strict mode
- Follow file naming conventions from 14_CODE_STANDARDS.md

### Performance Optimization (11_DATABASE_DESIGN.md 섹션 5.5 참조)
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize images with next/image
- Implement virtual scrolling for long lists
- Apply RLS optimization patterns (`SELECT auth.uid()` wrapping)
- Use database indexes strategically

### Security Checklist (14_CODE_STANDARDS.md 섹션 9 필독)
- [ ] Input validation with Zod schemas
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection implementation
- [ ] Rate limiting on APIs (12_API_DOCUMENTATION.md 참조)
- [ ] Secure file upload validation (magic number verification)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Proper error handling (don't expose sensitive info)
- [ ] Security headers configuration (16_DEPLOYMENT.md 참조)

## 📊 프로젝트 진행 추적

### 📚 **프로젝트 문서 현황**
- **총 문서**: 20개 (100% 완료) 🎉
- **문서 위치**: `/project-docs/` 폴더
- **변경 추적**: `19_CHANGELOG.md`에서 관리

### 📝 **문서 업데이트 규칙**
```bash
# 코드 변경 시 문서 업데이트 프로세스
1. 기능 구현/수정 완료
   ↓
2. 관련 설계 문서 업데이트 (필요시)
   - 11_DATABASE_DESIGN.md (DB 변경)
   - 12_API_DOCUMENTATION.md (API 변경)
   - SERVICE_FIELDS_DEFINITION.md (필드 변경)
   ↓
3. 19_CHANGELOG.md에 변경사항 기록
   ↓
4. Git commit with reference to docs
   예: "feat: add payment API (ref: 12_API_DOCUMENTATION.md)"
```

### 🗓️ **최근 완료 작업 (2025-01-27)**

#### ✅ **프로젝트 문서화 100% 완료**
- 20개 표준 문서 작성 완료
- 성능 최적화 가이드 추가 (RLS 40% 개선)
- Rate Limiting 구현 가이드 추가
- 보안 모범 사례 문서화
- 프로덕션 체크리스트 완성

#### ✅ **서비스 타입 확장 (2025-01-25)**
- **기존**: 3개 검품 서비스만 지원
- **개선**: 7개 서비스로 확장 (검품 3개 + 수입대행 4개)
- **참조**: SERVICE_FIELDS_DEFINITION.md (691줄 상세 명세)

### 📋 **다음 우선순위** (04_PROJECT_SCHEDULE.md 참조)
1. **Sprint 1**: Core 기능 구현 (2025-02-03 ~ 02-16)
   - 인증 시스템 (07_REQUIREMENTS.md FR-001~004)
   - 신청서 작성 (09_FRONTEND_DESIGN.md 섹션 3.2)
   
2. **Sprint 2**: 채팅 시스템 (2025-02-17 ~ 03-02)
   - 실시간 채팅 (11_DATABASE_DESIGN.md chat_messages)
   - GPT-4 번역 (08_TECH_ARCHITECTURE.md 섹션 3.5)

3. **Sprint 3**: CRM & 리포트 (2025-03-03 ~ 03-16)
   - CRM 시스템 (11_DATABASE_DESIGN.md crm_companies)
   - 리포트 생성 (10_BACKEND_DESIGN.md 섹션 4.4)

### 🚀 **MCP 도구 활용 통계**
```bash
# 권장 MCP 사용 패턴
- desktop MCP: 파일 작업의 70% 이상 활용
- supabase MCP: 모든 DB 작업에 필수 사용
- seq MCP: 복잡한 기능 구현 시 계획 수립
- c7 MCP: 외부 라이브러리 문서 참조
```

## 📑 **프로젝트 문서 빠른 참조**

### 자주 참조하는 문서 TOP 10
1. **07_REQUIREMENTS.md** - 기능 요구사항 확인
2. **09_FRONTEND_DESIGN.md** - UI/UX 설계 (82개 페이지)
3. **11_DATABASE_DESIGN.md** - DB 스키마 & RLS 정책
4. **12_API_DOCUMENTATION.md** - API 엔드포인트 명세
5. **14_CODE_STANDARDS.md** - 코딩 규범 & 보안 가이드
6. **SERVICE_FIELDS_DEFINITION.md** - 7개 서비스 필드 정의
7. **13_TEST_PLAN.md** - 테스트 전략 & 방법론
8. **16_DEPLOYMENT.md** - 배포 절차 & 체크리스트
9. **15_ACCEPTANCE_CRITERIA.md** - 기능별 완료 기준
10. **19_CHANGELOG.md** - 변경 이력 추적

### 문서별 핵심 내용
```bash
# 비즈니스 이해
01_PROJECT_CHARTER.md     → 프로젝트 범위와 목표
02_BUSINESS_CASE.md       → ROI 470%, 연 5.4억 수익 증대

# 기술 구현
08_TECH_ARCHITECTURE.md   → Next.js 15 + Supabase 스택
10_BACKEND_DESIGN.md      → API Routes & Edge Functions
11_DATABASE_DESIGN.md     → RLS 최적화 (40% 성능 개선)

# 품질 보증
13_TEST_PLAN.md          → Jest, Playwright, pgTAP
14_CODE_STANDARDS.md     → TypeScript, React 베스트 프랙티스

# 운영 준비
16_DEPLOYMENT.md         → Vercel + Supabase 배포
17_OPERATIONS_MANUAL.md  → 모니터링 & 운영 가이드
```

### 🎯 **개발 철학**
> "문서 기반 개발 - 모든 코드는 문서에 근거하고, 모든 변경은 문서에 반영된다"

---
*Last Updated: 2025-01-27*
*Total Project Documents: 20/20 (100% Complete)*