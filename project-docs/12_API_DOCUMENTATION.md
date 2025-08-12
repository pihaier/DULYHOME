# 📡 API 문서 (API Documentation)
**두리무역 디지털 전환 플랫폼**

문서 버전: v1.0  
작성일: 2025-01-26  
작성자: API 아키텍트  
표준: OpenAPI 3.0 / RESTful API

---

## 📑 목차
1. [API 개요](#1-api-개요)
2. [인증 API](#2-인증-api)
3. [오더 관리 API](#3-오더-관리-api)
4. [서비스별 API](#4-서비스별-api)
5. [채팅 API](#5-채팅-api)
6. [파일 관리 API](#6-파일-관리-api)
7. [관리자 API](#7-관리자-api)
8. [웹훅 API](#8-웹훅-api)

---

## 1. API 개요

### 1.1 기본 정보
- **Base URL**: `https://api.duly.co.kr/v1`
- **인증 방식**: Bearer Token (JWT)
- **응답 형식**: JSON
- **문자 인코딩**: UTF-8
- **날짜 형식**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)

### 1.2 공통 헤더
```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
Accept-Language: ko-KR,ko;q=0.9,zh-CN;q=0.8
X-Request-ID: {uuid}
```

### 1.3 응답 구조
```json
{
  "success": true,
  "data": {
    // 실제 응답 데이터
  },
  "error": null,
  "metadata": {
    "timestamp": "2025-01-26T10:00:00Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 1.4 에러 응답
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "유효한 이메일 형식이 아닙니다"
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-01-26T10:00:00Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 1.5 상태 코드
| 코드 | 설명 | 사용 예시 |
|------|------|-----------|
| 200 | OK | 조회 성공 |
| 201 | Created | 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복/충돌 |
| 422 | Unprocessable Entity | 검증 실패 |
| 429 | Too Many Requests | 요청 제한 초과 |
| 500 | Internal Server Error | 서버 오류 |

---

## 2. 인증 API

### 2.1 회원가입

#### 고객 회원가입
```http
POST /auth/customer/register
```

**요청 본문:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "company_name": "테스트 주식회사",
  "company_name_chinese": "测试有限公司",
  "contact_person": "홍길동",
  "phone": "010-1234-5678",
  "business_number": "123-45-67890",
  "customer_type": "법인"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "role": "customer",
      "created_at": "2025-01-26T10:00:00Z"
    },
    "profile": {
      "company_name": "테스트 주식회사",
      "contact_person": "홍길동",
      "approval_status": "approved"
    }
  }
}
```

#### 직원 회원가입
```http
POST /auth/staff/register
```

**요청 본문:**
```json
{
  "email": "staff@duly.co.kr",
  "password": "SecurePassword123!",
  "name": "김직원",
  "phone": "010-2345-6789",
  "role": "chinese_staff",
  "department": "중국사업부",
  "position": "대리",
  "language_preference": "zh"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "staff@duly.co.kr",
      "role": "chinese_staff"
    },
    "profile": {
      "approval_status": "pending",
      "message": "관리자 승인 후 로그인 가능합니다"
    }
  }
}
```

### 2.2 로그인

#### 이메일/비밀번호 로그인
```http
POST /auth/login
```

**요청 본문:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "remember_me": true
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
```

#### OAuth 로그인
```http
POST /auth/oauth/{provider}
```

**경로 매개변수:**
- `provider`: `google` | `kakao`

**요청 본문:**
```json
{
  "id_token": "oauth_provider_id_token",
  "access_token": "oauth_provider_access_token"
}
```

### 2.3 토큰 갱신
```http
POST /auth/refresh
```

**요청 본문:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.4 로그아웃
```http
POST /auth/logout
```

**헤더:**
```http
Authorization: Bearer {access_token}
```

### 2.5 프로필 조회
```http
GET /auth/profile
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "role": "customer"
    },
    "profile": {
      "company_name": "테스트 주식회사",
      "company_name_chinese": "测试有限公司",
      "contact_person": "홍길동",
      "phone": "010-1234-5678",
      "language_preference": "ko",
      "created_at": "2025-01-26T10:00:00Z"
    }
  }
}
```

### 2.6 프로필 수정
```http
PUT /auth/profile
```

**요청 본문:**
```json
{
  "company_name": "변경된 회사명",
  "contact_person": "김담당",
  "phone": "010-9876-5432",
  "language_preference": "zh"
}
```

---

## 3. 오더 관리 API

### 3.1 오더 목록 조회
```http
GET /orders
```

**쿼리 매개변수:**
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 항목 수 (기본: 20, 최대: 100)
- `status`: 상태 필터 (쉼표로 구분)
- `service_type`: 서비스 타입 필터
- `start_date`: 시작일 (YYYY-MM-DD)
- `end_date`: 종료일 (YYYY-MM-DD)
- `search`: 검색어 (예약번호, 회사명, 제품명)
- `sort`: 정렬 기준 (`created_at`, `updated_at`, `status`)
- `order`: 정렬 방향 (`asc`, `desc`)

**응답:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "order_number": "DL-20250126-000001",
        "service_type": "quality_inspection",
        "status": "payment_confirmed",
        "company_name": "테스트 주식회사",
        "product_name": "무선 이어폰",
        "total_amount": 1450000,
        "assigned_staff": {
          "id": "880e8400-e29b-41d4-a716-446655440000",
          "name": "왕직원"
        },
        "created_at": "2025-01-26T09:00:00Z",
        "updated_at": "2025-01-26T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 150,
      "total_pages": 8
    }
  }
}
```

### 3.2 오더 상세 조회
```http
GET /orders/{orderNumber}
```

**경로 매개변수:**
- `orderNumber`: 예약번호 (예: DL-20250126-000001)

**응답 (고객용):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "order_number": "DL-20250126-000001",
      "service_type": "quality_inspection",
      "status": "payment_confirmed",
      "status_label": "결제확인",
      "company_info": {
        "name": "테스트 주식회사",
        "contact_person": "홍길동",
        "phone": "010-1234-5678",
        "email": "customer@example.com"
      },
      "service_details": {
        "product_name": "무선 이어폰",
        "production_quantity": 5000,
        "inspection_method": "standard",
        "inspection_days": 3,
        "factory_name": "상하이 XX전자",
        "inspection_start_date": "2025-02-01"
      },
      "payment_info": {
        "total_amount": 1450000,
        "payment_status": "paid",
        "payment_date": "2025-01-26T10:00:00Z"
      },
      "timeline": [
        {
          "status": "submitted",
          "label": "신청완료",
          "timestamp": "2025-01-26T09:00:00Z"
        },
        {
          "status": "payment_confirmed",
          "label": "결제확인",
          "timestamp": "2025-01-26T10:00:00Z"
        }
      ]
    }
  }
}
```

**응답 (직원용 - 추가 필드):**
```json
{
  "data": {
    "order": {
      // ... 고객용 필드 모두 포함
      "margin_amount": 483333,
      "margin_percentage": 50,
      "internal_notes": "공장 연락처 확인 필요",
      "process_logs": [
        {
          "step": 1,
          "processor": "시스템",
          "action": "자동 직원 배정",
          "result": "왕직원에게 배정",
          "timestamp": "2025-01-26T09:01:00Z",
          "is_internal": true
        }
      ]
    }
  }
}
```

### 3.3 오더 생성
```http
POST /orders
```

**요청 본문 (검품 서비스):**
```json
{
  "service_type": "quality_inspection",
  "company_name": "테스트 주식회사",
  "company_name_chinese": "测试有限公司",
  "contact_person": "홍길동",
  "contact_phone": "010-1234-5678",
  "contact_email": "customer@example.com",
  "product_name": "무선 이어폰",
  "production_quantity": 5000,
  "inspection_method": "standard",
  "factory_name": "상하이 XX전자",
  "factory_contact_person": "왕경리",
  "factory_contact_phone": "138-1234-5678",
  "factory_address": "상하이시 푸동구 XX로 123",
  "schedule_coordination_status": "not_coordinated",
  "inspection_days": 3,
  "special_requirements": "배터리 수명 테스트 중점 확인 요청",
  "file_uploads": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "order_number": "DL-20250126-000002",
      "status": "submitted",
      "assigned_staff": {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "name": "왕직원",
        "email": "wang@duly.co.kr"
      },
      "created_at": "2025-01-26T11:00:00Z"
    }
  }
}
```

### 3.4 오더 수정
```http
PUT /orders/{orderNumber}
```

**요청 본문 (상태 변경 - 직원용):**
```json
{
  "status": "quote_sent",
  "quotation": {
    "inspection_days": 3,
    "daily_rate": 290000,
    "total_amount": 870000,
    "valid_until": "2025-02-01T23:59:59Z"
  }
}
```

### 3.5 오더 취소
```http
DELETE /orders/{orderNumber}
```

**요청 본문:**
```json
{
  "reason": "고객 요청으로 취소",
  "refund_required": true
}
```

---

## 4. 서비스별 API

### 4.1 시장조사 API

#### 시장조사 요청 생성
```http
POST /market-research
```

**요청 본문:**
```json
{
  "product_name": "무선충전기",
  "expected_quantity": 1000,
  "target_price_min": 10,
  "target_price_max": 15,
  "requirements": "KC인증 필수, 로고 인쇄 가능, 15W 급속충전 지원",
  "photos": [
    "file_id_1",
    "file_id_2"
  ],
  "trade_terms": "FOB",
  "customs_name": "테스트 주식회사"
}
```

#### 공급업체 정보 추가 (직원용)
```http
POST /market-research/{orderNumber}/suppliers
```

**요청 본문:**
```json
{
  "supplier_name": "선전 XX전자",
  "contact_person": "리경리",
  "contact_phone": "158-1234-5678",
  "contact_email": "li@supplier.com",
  "factory_price_rmb": 68,
  "moq": 500,
  "product_details": {
    "length_cm": 15,
    "width_cm": 10,
    "height_cm": 3,
    "weight_kg": 0.3,
    "units_per_box": 50,
    "certification": "KC, CE, FCC"
  },
  "sample_info": {
    "available": true,
    "price": 100,
    "make_time": "3-5일"
  },
  "company_info": {
    "scale": "100-500명",
    "registered_capital": "1000만 위안",
    "established_date": "2015-03-20"
  }
}
```

#### 시장조사 결과 조회
```http
GET /market-research/{orderNumber}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "research": {
      "order_number": "DL-20250126-000003",
      "product_name": "무선충전기",
      "status": "completed",
      "suppliers": [
        {
          "id": "supplier_1",
          "supplier_name": "선전 XX전자",
          "factory_price_rmb": 68,
          "unit_price_krw": 13600,
          "moq": 500,
          "quality_score": 8,
          "price_score": 9,
          "recommendation": "가격 경쟁력 우수, 품질 안정적"
        }
      ],
      "ai_analysis": {
        "best_supplier": "선전 XX전자",
        "estimated_total_cost": 13600000,
        "shipping_cost": 450000,
        "customs_duty": 1360000,
        "total_landed_cost": 15410000
      }
    }
  }
}
```

### 4.2 샘플 주문 API

#### 샘플 주문 생성
```http
POST /sample-orders
```

**요청 본문:**
```json
{
  "research_id": "research_order_id",
  "selected_suppliers": [
    {
      "supplier_id": "supplier_1",
      "items": [
        {
          "product_name": "무선충전기 15W",
          "quantity": 2,
          "unit_price": 100
        }
      ]
    }
  ],
  "shipping_method": "항공",
  "delivery_address": {
    "address": "서울시 강남구 테헤란로 123",
    "receiver_name": "홍길동",
    "receiver_phone": "010-1234-5678"
  }
}
```

#### 샘플 평가 제출
```http
POST /sample-orders/{orderNumber}/evaluation
```

**요청 본문:**
```json
{
  "evaluations": [
    {
      "item_id": "item_1",
      "quality_rating": 4,
      "notes": "충전 속도 양호, 발열 문제 없음",
      "photos": ["photo_1", "photo_2"]
    }
  ],
  "overall_feedback": "전반적으로 만족, 대량 발주 검토 예정"
}
```

### 4.3 구매대행 API

#### 구매대행 주문 생성
```http
POST /purchasing-orders
```

**요청 본문:**
```json
{
  "purchase_type": "B2B",
  "items": [
    {
      "product_link": "https://1688.com/product/123456",
      "product_name": "USB 케이블",
      "options": "길이: 1m, 색상: 검정",
      "quantity": 1000,
      "unit_price": 3.5
    }
  ],
  "shipping_address": {
    "address": "서울시 송파구 올림픽로 300",
    "receiver_name": "김수령",
    "receiver_phone": "010-5678-1234",
    "postal_code": "05551"
  },
  "customs_name": "테스트 주식회사",
  "marking_number": "DULY-2025-001"
}
```

### 4.4 배송대행 API

#### 배송대행 주문 생성
```http
POST /shipping-orders
```

**요청 본문:**
```json
{
  "expected_packages": 5,
  "consolidation_request": true,
  "items": [
    {
      "product_name": "전자제품 부품",
      "quantity": 100,
      "weight_kg": 2.5,
      "tracking_number": "SF1234567890"
    }
  ]
}
```

#### 입고 확인
```http
POST /shipping-orders/{orderNumber}/receive
```

**요청 본문:**
```json
{
  "received_packages": [
    {
      "tracking_number": "SF1234567890",
      "condition": "양호",
      "received_at": "2025-01-26T14:00:00Z",
      "notes": "포장 상태 양호"
    }
  ]
}
```

---

## 5. 채팅 API

### 5.1 채팅 메시지 조회
```http
GET /chat/{orderNumber}/messages
```

**쿼리 매개변수:**
- `limit`: 메시지 수 (기본: 50)
- `before`: 이 ID 이전 메시지
- `after`: 이 ID 이후 메시지

**응답:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_1",
        "sender": {
          "id": "user_1",
          "name": "홍길동",
          "role": "customer"
        },
        "content": "검품 일정 확인 부탁드립니다",
        "translated_content": "请确认检验日程",
        "type": "text",
        "created_at": "2025-01-26T10:00:00Z"
      },
      {
        "id": "msg_2",
        "sender": {
          "id": "user_2",
          "name": "왕직원",
          "role": "chinese_staff"
        },
        "content": "好的，我马上确认",
        "translated_content": "네, 바로 확인하겠습니다",
        "type": "text",
        "created_at": "2025-01-26T10:01:00Z"
      }
    ],
    "participants": [
      {
        "id": "user_1",
        "name": "홍길동",
        "role": "customer",
        "is_online": true
      }
    ]
  }
}
```

### 5.2 메시지 전송
```http
POST /chat/{orderNumber}/messages
```

**요청 본문:**
```json
{
  "content": "검품 보고서 확인했습니다. 감사합니다.",
  "type": "text",
  "files": []
}
```

### 5.3 파일 메시지 전송
```http
POST /chat/{orderNumber}/messages
```

**요청 본문:**
```json
{
  "content": "제품 사진 첨부합니다",
  "type": "file",
  "files": [
    {
      "file_id": "file_123",
      "filename": "product_photo.jpg",
      "size": 2048576
    }
  ]
}
```

### 5.4 타이핑 인디케이터
```http
POST /chat/{orderNumber}/typing
```

**요청 본문:**
```json
{
  "is_typing": true
}
```

### 5.5 게스트 URL 생성 (직원용)
```http
POST /chat/{orderNumber}/guest-url
```

**요청 본문:**
```json
{
  "role": "factory",
  "expires_in": 86400,
  "password": "auto"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "url": "https://chat.duly.co.kr/guest/abc123def456",
    "password": "1234",
    "expires_at": "2025-01-27T10:00:00Z"
  }
}
```

---

## 6. 파일 관리 API

### 6.1 파일 업로드
```http
POST /files/upload
```

**요청 본문 (multipart/form-data):**
- `file`: 업로드할 파일
- `purpose`: `application` | `chat` | `report`
- `order_id`: 관련 오더 ID (선택)

**응답:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file_123",
      "filename": "product_spec.pdf",
      "size": 1048576,
      "mime_type": "application/pdf",
      "url": "https://storage.duly.co.kr/files/file_123",
      "created_at": "2025-01-26T10:00:00Z"
    }
  }
}
```

### 6.2 파일 다운로드
```http
GET /files/{fileId}
```

**응답:**
- 파일 바이너리 데이터
- Content-Type: 파일의 MIME 타입
- Content-Disposition: attachment; filename="원본파일명"

### 6.3 파일 삭제
```http
DELETE /files/{fileId}
```

### 6.4 이미지 압축
```http
POST /files/compress
```

**요청 본문:**
```json
{
  "file_id": "file_123",
  "quality": 85,
  "max_width": 1920,
  "max_height": 1080
}
```

---

## 7. 관리자 API

### 7.1 대시보드 통계
```http
GET /admin/dashboard
```

**응답:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "today": {
        "new_orders": 15,
        "completed_orders": 8,
        "revenue": 12500000
      },
      "this_month": {
        "total_orders": 342,
        "by_service": {
          "quality_inspection": 180,
          "market_research": 95,
          "purchasing_agency": 67
        },
        "revenue": 285000000
      },
      "staff_performance": [
        {
          "staff_id": "staff_1",
          "name": "왕직원",
          "assigned_orders": 45,
          "completed_orders": 38,
          "average_rating": 4.8
        }
      ]
    }
  }
}
```

### 7.2 사용자 관리

#### 승인 대기 목록
```http
GET /admin/users/pending
```

#### 사용자 승인
```http
PUT /admin/users/{userId}/approve
```

**요청 본문:**
```json
{
  "approval_note": "서류 확인 완료"
}
```

#### 사용자 거부
```http
PUT /admin/users/{userId}/reject
```

**요청 본문:**
```json
{
  "reason": "서류 미비"
}
```

### 7.3 시스템 설정

#### 설정 조회
```http
GET /admin/settings
```

**응답:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "exchange_rate": 180,
      "commission_rates": {
        "quality_inspection": 0.5,
        "market_research": 0.3,
        "purchasing_agency": 0.05
      },
      "pricing": {
        "quality_inspection": {
          "daily_rates": [
            { "days": "1-4", "rate": 290000 },
            { "days": "5-9", "rate": 270000 },
            { "days": "10+", "rate": 250000 }
          ]
        }
      },
      "business_hours": {
        "weekdays": "09:00-18:00",
        "saturday": "09:00-13:00",
        "sunday": "closed"
      }
    }
  }
}
```

#### 설정 수정
```http
PUT /admin/settings
```

**요청 본문:**
```json
{
  "exchange_rate": 185,
  "commission_rates": {
    "quality_inspection": 0.45
  }
}
```

### 7.4 로그 조회

#### 활동 로그
```http
GET /admin/logs/activity
```

**쿼리 매개변수:**
- `user_id`: 사용자 ID
- `action`: 액션 타입
- `start_date`: 시작일
- `end_date`: 종료일
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

#### 프로세스 로그
```http
GET /admin/logs/process/{orderNumber}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "step": 1,
        "processor": "고객",
        "action": "신규 오더 접수",
        "result": "신청 시작",
        "timestamp": "2025-01-26T09:00:00Z",
        "is_internal": false
      },
      {
        "step": 2,
        "processor": "시스템",
        "action": "자동 회원 가입",
        "result": "데이터 생성",
        "timestamp": "2025-01-26T09:00:01Z",
        "is_internal": true
      }
    ]
  }
}
```

---

## 8. 웹훅 API

### 8.1 웹훅 등록
```http
POST /webhooks
```

**요청 본문:**
```json
{
  "url": "https://example.com/webhook",
  "events": [
    "order.created",
    "order.status_changed",
    "payment.confirmed",
    "report.uploaded"
  ],
  "secret": "webhook_secret_key"
}
```

### 8.2 웹훅 이벤트 형식

#### 오더 생성
```json
{
  "event": "order.created",
  "timestamp": "2025-01-26T10:00:00Z",
  "data": {
    "order_number": "DL-20250126-000001",
    "service_type": "quality_inspection",
    "customer": {
      "id": "customer_id",
      "company_name": "테스트 주식회사"
    }
  },
  "signature": "sha256=..."
}
```

#### 상태 변경
```json
{
  "event": "order.status_changed",
  "timestamp": "2025-01-26T11:00:00Z",
  "data": {
    "order_number": "DL-20250126-000001",
    "old_status": "submitted",
    "new_status": "payment_confirmed",
    "changed_by": "system"
  },
  "signature": "sha256=..."
}
```

---

## 9. AI 및 워크플로우 API ⭐ (2025-01-27 추가)

### 9.1 워크플로우 API

#### 워크플로우 상태 조회
```http
GET /api/workflow/{orderNumber}/status
```

**응답:**
```json
{
  "order_number": "DL-20250126-000001",
  "service_type": "market_research",
  "current_state": "sample_testing",
  "allowed_transitions": ["approve_sample", "reject_sample"],
  "state_history": [
    {
      "state": "created",
      "entered_at": "2025-01-26T10:00:00Z",
      "exited_at": "2025-01-26T10:30:00Z"
    },
    {
      "state": "research_in_progress",
      "entered_at": "2025-01-26T10:30:00Z",
      "exited_at": "2025-01-26T14:00:00Z"
    }
  ],
  "context": {
    "assigned_staff": "staff_123",
    "completion_percentage": 60
  }
}
```

#### 워크플로우 전환 실행
```http
POST /api/workflow/{orderNumber}/transition
```

**요청 본문:**
```json
{
  "action": "approve_sample",
  "context": {
    "approved_by": "korean_team_123",
    "approval_notes": "샘플 품질 확인 완료",
    "next_step": "proceed_to_bulk_order"
  }
}
```

**응답:**
```json
{
  "success": true,
  "from_state": "sample_testing",
  "to_state": "bulk_order_negotiation",
  "actions_taken": [
    "notification_sent_to_customer",
    "notification_sent_to_supplier",
    "status_updated_in_database"
  ]
}
```

#### 워크플로우 이벤트 조회
```http
GET /api/workflow/{orderNumber}/events
```

**응답:**
```json
{
  "events": [
    {
      "id": "event_123",
      "event_type": "state_transition",
      "event_name": "sample_approved",
      "from_state": "sample_testing",
      "to_state": "bulk_order_negotiation",
      "triggered_at": "2025-01-26T15:00:00Z",
      "triggered_by": "korean_team_123"
    }
  ]
}
```

### 9.2 AI 번역 API

#### 텍스트 번역
```http
POST /api/ai-translate
```

**요청 본문:**
```json
{
  "text": "이 제품의 품질이 매우 우수합니다.",
  "source_language": "ko",
  "target_language": "zh",
  "context_type": "product_review",
  "domain": "inspection"
}
```

**응답:**
```json
{
  "translated_text": "该产品的质量非常优秀。",
  "confidence_score": 0.95,
  "from_cache": false,
  "model": "gpt-4",
  "tokens_used": 42,
  "cost_usd": 0.0021
}
```

#### 일괄 번역
```http
POST /api/ai-translate/batch
```

**요청 본문:**
```json
{
  "texts": [
    {
      "id": "text_1",
      "text": "품질 검사 완료",
      "context_type": "inspection_status"
    },
    {
      "id": "text_2", 
      "text": "샘플 승인됨",
      "context_type": "approval_status"
    }
  ],
  "source_language": "ko",
  "target_language": "zh",
  "domain": "inspection"
}
```

**응답:**
```json
{
  "translations": [
    {
      "id": "text_1",
      "translated_text": "质量检查完成",
      "from_cache": true
    },
    {
      "id": "text_2",
      "translated_text": "样品已批准",
      "from_cache": false
    }
  ],
  "total_tokens": 68,
  "total_cost_usd": 0.0034,
  "cache_hit_rate": 0.5
}
```

#### 번역 캐시 통계
```http
GET /api/ai-translate/stats
```

**응답:**
```json
{
  "cache_stats": {
    "total_entries": 12456,
    "cache_hit_rate": 0.73,
    "storage_used_mb": 45.6,
    "most_frequent_domains": ["inspection", "shipping", "chat"]
  },
  "usage_stats": {
    "translations_today": 1234,
    "cost_today_usd": 12.45,
    "average_response_time_ms": 230
  }
}
```

### 9.3 문서 변환 API

#### Word to HTML 변환
```http
POST /api/ai-translate/convert-document
```

**요청 본문 (multipart/form-data):**
- `file`: Word 문서 (.docx)
- `translate`: boolean (true인 경우 번역도 수행)
- `target_language`: string (translate=true인 경우)

**응답:**
```json
{
  "html_content": "<h1>검사 보고서</h1><p>...",
  "metadata": {
    "original_filename": "inspection_report.docx",
    "page_count": 5,
    "word_count": 1234,
    "contains_images": true
  },
  "translation": {
    "html_content": "<h1>检验报告</h1><p>...",
    "tokens_used": 3456,
    "cost_usd": 0.1728
  }
}
```

---

## 📊 Rate Limiting ⭐ (2025-01-27 개선)

### 기본 제한
- **인증되지 않은 요청**: 100 requests/hour
- **인증된 요청**: 1000 requests/hour
- **파일 업로드**: 100 requests/hour
- **채팅 메시지**: 300 requests/hour
- **번역 API**: 500 requests/hour

### 구현 방법

#### 1. Upstash Redis 기반 구현
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 엔드포인트별 Rate Limiter 생성
export const rateLimits = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    analytics: true,
    prefix: 'api',
  }),
  
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    analytics: true,
    prefix: 'upload',
  }),
  
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, '1 h'),
    analytics: true,
    prefix: 'chat',
  }),
  
  translation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, '1 h'),
    analytics: true,
    prefix: 'translation',
  }),
};

// Rate Limit 체크 함수
export async function checkRateLimit(
  request: Request,
  type: keyof typeof rateLimits = 'api'
) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await rateLimits[type].limit(ip);
  
  return { success, limit, reset, remaining };
}
```

#### 2. Middleware 구현
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // API 경로별 Rate Limit 타입 결정
  const path = request.nextUrl.pathname;
  let limitType: 'api' | 'upload' | 'chat' | 'translation' = 'api';
  
  if (path.includes('/api/files/upload')) {
    limitType = 'upload';
  } else if (path.includes('/api/chat')) {
    limitType = 'chat';
  } else if (path.includes('/api/translate')) {
    limitType = 'translation';
  }
  
  // Rate Limit 체크
  const { success, limit, reset, remaining } = await checkRateLimit(
    request,
    limitType
  );
  
  // 헤더 설정
  const headers = new Headers({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(reset).toISOString(),
  });
  
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API 요청 한도를 초과했습니다',
          retry_after: Math.floor((reset - Date.now()) / 1000),
        },
      },
      { 
        status: 429,
        headers,
      }
    );
  }
  
  // 기존 세션 업데이트 로직
  const response = await updateSession(request);
  
  // Rate Limit 헤더 추가
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
```

#### 3. 사용자별 Rate Limiting
```typescript
// 인증된 사용자는 더 높은 한도 적용
export async function getUserRateLimit(userId?: string) {
  if (!userId) {
    return rateLimits.api; // 기본 한도
  }
  
  // 사용자 역할에 따른 차등 적용
  const user = await getUserProfile(userId);
  
  switch (user?.role) {
    case 'admin':
    case 'korean_team':
      // 관리자는 무제한
      return null;
      
    case 'chinese_staff':
      // 직원은 2배 한도
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(2000, '1 h'),
        analytics: true,
        prefix: `staff:${userId}`,
      });
      
    default:
      // 일반 고객
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, '1 h'),
        analytics: true,
        prefix: `user:${userId}`,
      });
  }
}
```

### 응답 헤더
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2025-01-27T12:00:00Z
```

### 제한 초과 응답
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API 요청 한도를 초과했습니다",
    "retry_after": 3600
  }
}
```

### 백오프 전략
```typescript
// 클라이언트 재시도 로직
async function apiCallWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        const retryAfter = error.data?.error?.retry_after || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

---

## 🔐 보안

### CORS 설정
```http
Access-Control-Allow-Origin: https://duly.co.kr
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Request-ID
Access-Control-Max-Age: 86400
```

### API 키 인증 (외부 연동용)
```http
X-API-Key: your_api_key_here
```

### 서명 검증 (웹훅)
```javascript
const signature = crypto
  .createHmac('sha256', webhook_secret)
  .update(JSON.stringify(payload))
  .digest('hex');

const expected = `sha256=${signature}`;
```

---

## 📱 SDK

### JavaScript/TypeScript
```typescript
import { DulyClient } from '@duly/sdk';

const client = new DulyClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.duly.co.kr/v1'
});

// 오더 생성
const order = await client.orders.create({
  service_type: 'quality_inspection',
  // ... 기타 필드
});

// 채팅 메시지 전송
await client.chat.sendMessage(order.order_number, {
  content: '안녕하세요',
  type: 'text'
});
```

### Python
```python
from duly_sdk import DulyClient

client = DulyClient(
    api_key='your_api_key',
    base_url='https://api.duly.co.kr/v1'
)

# 오더 조회
order = client.orders.get('DL-20250126-000001')

# 파일 업로드
file = client.files.upload(
    file_path='product_spec.pdf',
    purpose='application'
)
```

---

## 🧪 테스트 환경

### Base URL
```
https://api-test.duly.co.kr/v1
```

### 테스트 계정
| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 고객 | test-customer@example.com | Test1234! |
| 중국직원 | test-staff@duly.co.kr | Test1234! |
| 한국팀 | test-korean@duly.co.kr | Test1234! |
| 관리자 | test-admin@duly.co.kr | Test1234! |

### 테스트 카드
- 번호: 4242 4242 4242 4242
- 유효기간: 12/25
- CVC: 123

---

*본 문서는 두리무역 디지털 전환 프로젝트의 API 명세를 담은 공식 문서입니다.*