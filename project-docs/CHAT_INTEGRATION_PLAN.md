# 채팅 시스템 연동 계획 (Chat System Integration Plan)

## 📋 개요

두리무역 ERP 시스템에 실시간 채팅 기능을 통합하여 고객-중국직원-한국팀 간 원활한 소통을 지원합니다.

## 🎯 목표

- 예약번호 기반 실시간 채팅 룸 제공
- GPT-4 기반 한국어↔중국어 자동 번역
- 파일 첨부 및 이미지 공유
- 역할별 차별화된 UI/UX

## 🏗️ 기술 스택

- **Real-time Engine**: Supabase Realtime
- **번역 API**: OpenAI GPT-4
- **파일 저장**: Supabase Storage
- **Frontend**: Next.js 15 + Material-UI
- **Database**: PostgreSQL (Supabase)

## 📊 데이터베이스 스키마

### 1. chat_messages 테이블 (이미 정의됨)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  original_message TEXT NOT NULL,
  original_language TEXT CHECK (original_language IN ('ko', 'zh')),
  translated_message TEXT,
  translated_language TEXT CHECK (translated_language IN ('ko', 'zh')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### 2. chat_participants 테이블 (이미 정의됨)
```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE
);
```

## 🔧 구현 단계

### Phase 1: 기본 채팅 인프라 (1주)

#### 1.1 Supabase Realtime 설정
- 채팅 테이블에 대한 Realtime 활성화
- RLS 정책 설정
- 구독/발행 채널 구성

#### 1.2 번역 API 서비스 구현
```typescript
// /api/translate/route.ts
export async function POST(request: Request) {
  const { text, sourceLang, targetLang } = await request.json();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: `Translate the following ${sourceLang} text to ${targetLang}. 
                Only return the translation without explanations.`
    }, {
      role: "user", 
      content: text
    }]
  });
  
  return Response.json({ translation: response.choices[0].message.content });
}
```

#### 1.3 채팅 API 엔드포인트
```typescript
// /api/chat/[reservationNumber]/messages/route.ts
export async function GET() { /* 메시지 조회 */ }
export async function POST() { /* 메시지 전송 */ }

// /api/chat/[reservationNumber]/participants/route.ts  
export async function GET() { /* 참가자 조회 */ }
export async function POST() { /* 참가자 추가 */ }
```

### Phase 2: 채팅 UI 컴포넌트 (1주)

#### 2.1 채팅 컴포넌트 구조
```
src/app/chat/
├── [reservationNumber]/
│   └── page.tsx              # 채팅 메인 페이지
├── components/
│   ├── ChatRoom.tsx          # 채팅방 컨테이너
│   ├── MessageList.tsx       # 메시지 목록
│   ├── MessageInput.tsx      # 메시지 입력
│   ├── FileUpload.tsx        # 파일 첨부
│   ├── ParticipantList.tsx   # 참가자 목록
│   └── TranslationToggle.tsx # 번역 표시 토글
└── hooks/
    ├── useChat.ts            # 채팅 상태 관리
    ├── useTranslation.ts     # 번역 관리
    └── useRealtime.ts        # 실시간 구독
```

#### 2.2 메시지 컴포넌트 예시
```typescript
interface MessageProps {
  message: ChatMessage;
  currentUserRole: string;
  showTranslation: boolean;
}

export function MessageBubble({ message, currentUserRole, showTranslation }: MessageProps) {
  const isOwnMessage = message.sender_id === currentUser?.id;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      mb: 1 
    }}>
      <Paper sx={{ 
        p: 2, 
        maxWidth: '70%',
        bgcolor: isOwnMessage ? 'primary.light' : 'grey.100'
      }}>
        <Typography variant="caption" color="text.secondary">
          {message.sender_name} • {formatTime(message.created_at)}
        </Typography>
        
        {/* 원본 메시지 */}
        <Typography variant="body1">
          {message.original_message}
        </Typography>
        
        {/* 번역된 메시지 (조건부) */}
        {showTranslation && message.translated_message && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
            번역: {message.translated_message}
          </Typography>
        )}
        
        {/* 파일 첨부 (조건부) */}
        {message.message_type === 'file' && (
          <FileAttachment fileName={message.file_name} fileUrl={message.file_url} />
        )}
      </Paper>
    </Box>
  );
}
```

### Phase 3: 실시간 기능 (1주)

#### 3.1 Realtime 훅 구현
```typescript
export function useRealtime(reservationNumber: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  
  useEffect(() => {
    const supabase = createClient();
    
    // 메시지 실시간 구독
    const messageChannel = supabase
      .channel(`chat:${reservationNumber}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `reservation_number=eq.${reservationNumber}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
      
    // 참가자 상태 실시간 구독  
    const participantChannel = supabase
      .channel(`participants:${reservationNumber}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'chat_participants',
        filter: `reservation_number=eq.${reservationNumber}`
      }, (payload) => {
        setParticipants(prev => 
          prev.map(p => 
            p.id === payload.new.id ? payload.new as ChatParticipant : p
          )
        );
      })
      .subscribe();
      
    return () => {
      messageChannel.unsubscribe();
      participantChannel.unsubscribe();
    };
  }, [reservationNumber]);
  
  return { messages, participants };
}
```

#### 3.2 번역 자동화
```typescript
export function useAutoTranslation() {
  const translateMessage = async (text: string, sourceLang: string) => {
    const targetLang = sourceLang === 'ko' ? 'zh' : 'ko';
    
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang })
    });
    
    const { translation } = await response.json();
    return { translation, targetLang };
  };
  
  return { translateMessage };
}
```

### Phase 4: 통합 및 최적화 (1주)

#### 4.1 주문 상세 페이지 통합
- 주문 상세 페이지에 채팅 탭 추가
- 채팅 버튼으로 새 창/탭에서 채팅 열기
- 읽지 않은 메시지 알림 배지

#### 4.2 모바일 최적화
- 반응형 채팅 UI
- 터치 제스처 지원
- 가상 키보드 대응

#### 4.3 성능 최적화
- 메시지 가상화 (react-window)
- 이미지 지연 로딩
- 파일 업로드 진행률 표시

## 🔐 보안 고려사항

### 1. Row Level Security (RLS) 정책
```sql
-- 채팅 메시지 조회 권한
CREATE POLICY "chat_messages_select" ON chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM inspection_applications ia
    WHERE ia.reservation_number = chat_messages.reservation_number
    AND (
      ia.user_id = auth.uid() OR -- 신청자
      ia.assigned_chinese_staff = auth.uid() OR -- 담당 중국직원
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid() 
        AND up.role IN ('korean_team', 'admin') -- 한국팀
      )
    )
  )
);

-- 채팅 메시지 입력 권한 (동일한 로직)
CREATE POLICY "chat_messages_insert" ON chat_messages
FOR INSERT WITH CHECK (/* 위와 동일한 조건 */);
```

### 2. 파일 업로드 보안
- 파일 크기 제한 (최대 10MB)
- 허용된 파일 타입만 업로드
- 바이러스 스캔 (필요시)
- 파일명 sanitization

## 📱 사용자 경험 (UX)

### 1. 역할별 채팅 화면
- **고객**: 한국어 우선, 번역 보기 토글
- **중국직원**: 중국어 우선, 번역 보기 토글  
- **한국팀**: 원본+번역 모두 표시

### 2. 알림 시스템
- 브라우저 알림 (권한 요청)
- 사운드 알림 (선택적)
- 읽지 않은 메시지 개수 표시

### 3. 채팅 단축키
- Enter: 메시지 전송
- Shift+Enter: 줄바꿈
- Ctrl+U: 파일 첨부

## 🧪 테스트 계획

### 1. 단위 테스트
- 번역 API 테스트
- 메시지 전송/수신 테스트
- 파일 업로드 테스트

### 2. 통합 테스트  
- 실시간 메시징 시나리오
- 다중 사용자 동시 접속
- 네트워크 중단/복구 테스트

### 3. 사용자 테스트
- 역할별 시나리오 테스트
- 모바일/데스크톱 UX 테스트
- 번역 품질 검증

## 📈 성능 목표

- **메시지 전송 지연**: < 500ms
- **번역 응답 시간**: < 2초  
- **파일 업로드**: < 30초 (10MB 기준)
- **동시 접속자**: 최대 100명
- **메시지 로딩**: 첫 50개 < 1초

## 🚀 배포 계획

### 1. 개발 환경 설정
- Supabase 개발 프로젝트 생성
- OpenAI API 키 설정
- 환경변수 구성

### 2. 스테이징 테스트
- 실제 데이터로 기능 검증
- 성능 부하 테스트
- 보안 취약점 점검

### 3. 프로덕션 배포
- 데이터베이스 마이그레이션
- 환경변수 업데이트  
- 모니터링 설정

## 📅 일정

| 주차 | 작업 내용 | 담당자 | 완료 기준 |
|------|-----------|--------|-----------|
| 1주차 | Phase 1: 기본 인프라 | 백엔드 | API 엔드포인트 완성 |
| 2주차 | Phase 2: UI 컴포넌트 | 프론트엔드 | 채팅 화면 구현 |
| 3주차 | Phase 3: 실시간 기능 | 풀스택 | 실시간 메시징 동작 |
| 4주차 | Phase 4: 통합 최적화 | 풀스택 | 전체 기능 통합 완료 |

## 🔗 참고 자료

- [Supabase Realtime 문서](https://supabase.com/docs/guides/realtime)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Material-UI Chat 예제](https://mui.com/material-ui/react-chat/)
- [Next.js 실시간 채팅 예제](https://github.com/vercel/next.js/tree/canary/examples/with-supabase-auth-realtime-db)

---

**작성일**: 2025-08-02  
**버전**: 1.0  
**상태**: 계획 수립 완료