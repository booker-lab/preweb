# Payments Domain Spec

> **작성일**: 2026-03-26
> **상태**: Draft (4단계 개발 선행 문서)
> **연관 문서**: `orders.md`, `CRITICAL_LOGIC.md`, `1단계 요구사항 정의.md`

---

## 1. 도메인 개요

결제 검증·환불은 **NestJS API 서버가 단독 처리**한다.
클라이언트(소비자 앱)는 Portone SDK로 결제창을 열고, 서버는 Portone webhook을 수신해 금액을 검증한 뒤 주문 상태를 전환한다.

**핵심 결정 사항**

| 항목 | 결정 | 이유 |
|------|------|------|
| 결제 방식 | 즉시 결제 (pre-auth 미적용) | 카카오페이·네이버페이가 pre-auth 미지원 |
| 무통장 입금 | 미지원 | 즉시 결제만 지원 |
| 환불 처리 | Portone 환불 API | 자동 처리, 카드 3~5 영업일 / 간편결제 1~3일 |
| 결제 PG | Portone (이니시스 or NHN KCP) | 카드 결제 활성화를 위해 PG사 계약 필요 |

> ⚠️ **MVP 완료 후 액션 필요**
> 카드 결제 활성화를 위해 Portone 가입 + PG사 심사 신청 (KG이니시스 또는 NHN KCP).
> 심사 기간 약 2~5 영업일. 코드 변경 없이 `pay_method: 'card'` 값 추가만으로 활성화 가능.

---

## 2. 지원 결제 수단

| 수단 | pay_method 값 | 비고 |
|------|--------------|------|
| 카카오페이 | `kakaopay` | 즉시 사용 가능 |
| 네이버페이 | `naverpay` | 즉시 사용 가능 |
| 신용/체크카드 | `card` | PG사 계약 완료 후 활성화 |

---

## 3. Firestore 컬렉션 스키마

### `payments/{paymentId}`

```ts
{
  id: string                    // Portone imp_uid (결제 고유번호)
  orderId: string               // orders 참조
  userId: string
  storeId: string

  // 결제 정보
  amount: number                // 실제 결제 금액 (검증 기준)
  payMethod: 'kakaopay' | 'naverpay' | 'card'
  status: PaymentStatus         // 하단 참조
  portoneImpUid: string         // Portone imp_uid
  portoneMerchantUid: string    // 주문번호 (orderId와 동일)

  // 환불 정보
  refundAmount: number | null
  refundedAt: Timestamp | null
  refundReason: string | null

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**PaymentStatus**
```
'PENDING'    — 결제창 열림, webhook 수신 전
'PAID'       — 결제 완료 (금액 검증 성공)
'FAILED'     — 결제 실패 또는 금액 위변조 감지
'CANCELLED'  — 환불 완료
```

---

## 4. 결제 플로우

### 4-1. 일반 결제 흐름

```
[소비자 앱]                   [NestJS]                    [Portone]

1. POST /orders → 주문 생성
                              2. PENDING 주문 생성
                              3. amount, merchant_uid 반환
4. Portone SDK 결제창 오픈
   (imp_uid, merchant_uid 전달)
                                                      5. 결제 처리
                                                      6. webhook POST → NestJS
                              7. imp_uid로 Portone API 조회
                              8. amount 검증
                              [성공] 주문 ACCEPTED 또는 RECRUITING 전환
                                     알림톡 발송
                              [실패] 주문 CANCELLED + 환불 처리
9. 결제 완료 화면 표시
   (Firestore 리스너로 상태 수신)
```

### 4-2. 금액 검증 규칙 (위변조 방지)

```
검증 조건:
  portone.getPaymentData(imp_uid).amount === orders.totalAmount

실패 처리:
  1. payments.status → 'FAILED'
  2. orders.status → 'CANCELLED'
  3. Portone 환불 API 즉시 호출 (결제된 경우)
  4. dailyCaps.usedSlots 복구
```

### 4-3. PENDING 타임아웃 처리

```
조건: 결제창 열린 후 15분 내 Portone webhook 미수신

NestJS 스케줄러 처리:
  1. PENDING 주문 삭제
  2. payments.status → 'FAILED'
  3. dailyCaps.usedSlots 복구
```

---

## 5. 환불 플로우

### 5-1. 개인 취소 (RECRUITING 구간)

```
소비자 앱: PATCH /stores/:storeId/orders/:orderId/cancel 호출
NestJS:
  1. 상태 검증 — RECRUITING 이외 → 403 거부
  2. Portone 환불 API 호출
     { imp_uid, amount: totalAmount, reason: '소비자 취소' }
  3. payments.status → 'CANCELLED', refundedAt 기록
  4. orders.status → 'CANCELLED', cancelReason 기록
  5. groupProductConfig.currentParticipants -1 (Firestore 트랜잭션)
  6. 본인에게 알림톡 발송: "취소 및 환불 처리가 완료되었습니다."
```

### 5-2. 공동구매 마감 미달 자동 환불

```
트리거: NestJS 스케줄러 (recruitDeadline 경과 + currentParticipants < minParticipants)

처리:
  1. 해당 groupProductId의 모든 RECRUITING 주문 조회
  2. 각 주문에 대해 Portone 환불 API 병렬 호출
  3. 전체 payments.status → 'CANCELLED'
  4. 전체 orders.status → 'CANCELLED'
     cancelReason: '목표 수량 미달성으로 취소'
  5. 전체 참여자에게 알림톡 일괄 발송
```

### 5-3. 판매자 강제 취소

```
판매자 앱: PATCH /stores/:storeId/orders/:orderId/status { status: 'CANCELLED', reason }

처리:
  1. 환불 가능 상태 (ACCEPTED, RECRUITING, PREPARING) 검증
  2. Portone 환불 API 호출
  3. orders.status → 'CANCELLED', cancelReason 기록
  4. 소비자에게 알림톡 발송 (사유 + 환불 일정 포함)
```

### 환불 소요 시간 안내 문구 (소비자 노출)

| 결제 수단 | 환불 소요 |
|----------|----------|
| 카카오페이 | 1~3 영업일 |
| 네이버페이 | 1~3 영업일 |
| 신용/체크카드 | 3~5 영업일 |

---

## 6. API 엔드포인트

### 결제 파라미터 생성 (주문 생성과 통합)

> `POST /stores/:storeId/orders` 응답에 Portone 결제 파라미터를 포함해 반환.
> 별도 결제 엔드포인트 없음.

**응답 내 Portone 파라미터**
```ts
{
  orderId: string
  portonePaymentParams: {
    pg: string              // 'html5_inicis' | 'naverpay' | 'kakaopay'
    pay_method: string      // 'kakaopay' | 'naverpay' | 'card'
    merchant_uid: string    // orderId
    name: string            // 상품명
    amount: number          // 검증 기준 금액
    buyer_name: string
    buyer_tel: string
    buyer_email: string
    buyer_addr: string
    buyer_postcode: string
  }
}
```

---

### Portone Webhook 수신

```
POST /payments/webhook/portone
```

Portone이 서버로 직접 호출. 클라이언트 미사용.

**Request Body** (Portone 전송)
```ts
{ imp_uid: string, merchant_uid: string, status: string }
```

**처리 흐름** — 섹션 4-2 참조

---

### 결제 내역 조회

```
GET /payments/:paymentId
GET /stores/:storeId/orders/:orderId/payment
```

**Response** `200` — `payments` 전체 필드

---

### 환불 요청 (내부용 — 소비자 앱은 cancel 엔드포인트 사용)

```
POST /payments/:paymentId/refund
```

> 판매자 강제 취소·스케줄러 자동 환불 등 서버 내부에서 직접 호출하는 내부 서비스 메서드.
> 외부에 직접 노출하지 않음 (NestJS 서비스 레이어 내부 호출).

---

## 7. 보안 체크리스트

| 항목 | 처리 방식 |
|------|----------|
| 금액 위변조 | 서버에서 Portone API로 재조회 후 `orders.totalAmount`와 비교 |
| Webhook 위조 | Portone IP 화이트리스트 또는 시그니처 검증 |
| 중복 webhook | `imp_uid` 기준 멱등성 처리 (이미 PAID → 무시) |
| 환불 권한 | 소비자: 본인 RECRUITING 주문만 / 판매자: 본인 storeId 주문만 |
| 결제 금액 노출 | `totalAmount`는 서버에서 계산, 클라이언트 전달값 사용 안 함 |

---

## 8. packages/shared 공통 타입 (초안)

```ts
// packages/shared/src/payment.types.ts

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'

export type PayMethod = 'kakaopay' | 'naverpay' | 'card'

export interface Payment {
  id: string
  orderId: string
  userId: string
  storeId: string
  amount: number
  payMethod: PayMethod
  status: PaymentStatus
  portoneImpUid: string
  portoneMerchantUid: string
  refundAmount: number | null
  refundedAt: string | null   // ISO8601
  refundReason: string | null
  createdAt: string
  updatedAt: string
}
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-26 | 초안 작성 — CRITICAL_LOGIC.md + 1단계 요구사항 기반 통합 |
