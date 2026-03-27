# Critical Logic — 설계 결정 이력

> 이 파일은 되돌리기 어려운 설계 결정과 그 이유를 기록합니다.
> 결정 변경 시 반드시 이유와 날짜를 함께 기록하세요.

---

## [2026-03-25] 백엔드 아키텍처 확정

### 결정: NestJS (Layered Architecture) + Firestore 혼합

**선택지 비교**

| 항목 | Option A: Next.js API Routes | Option B: NestJS (채택) |
|------|------------------------------|------------------------|
| 비즈니스 로직 위치 | 3개 앱에 분산 | NestJS 단일 집중 |
| 주문 도메인 일관성 | 앱마다 다르게 구현될 위험 | 단일 Service로 보장 |
| Daily Cap 동시성 | 각 앱 API Routes에서 개별 처리 | NestJS 트랜잭션으로 처리 |
| 다중 판매자 확장 | 앱 전체 수정 필요 | NestJS 모듈 추가만으로 대응 |
| 배포 비용 | Vercel 무료 | +Railway $5/월 |

**채택 이유**

소비자·판매자·드라이버 세 앱이 동일한 `orders` 도메인을 공유한다.
주문 상태 전환·결제 검증·공동구매 자동 환불·Daily Cap 동시성 처리 등
핵심 비즈니스 로직이 복잡하고, 이를 3개 앱의 API Routes에 분산하면
나중에 혼자 유지보수하기 어렵다. 처음부터 NestJS로 통합하는 것이
나중에 마이그레이션하는 비용보다 훨씬 낮다.

**DDD 미적용 이유**

NestJS Layered Architecture(Controller → Service → Repository)만으로 충분.
DDD 풀세트(Entity·ValueObject·Aggregate·DomainService·Mapper)는
혼자 개발하는 MVP에서 오버엔지니어링이며, 500라인 제한(CLAUDE.md)과도 충돌한다.

---

## [2026-03-25] 모노레포 구조 확정

### 결정: pnpm workspace 모노레포

```
greenhub/
├── packages/
│   └── shared/          ← OrderStatus, Product, Store 등 공통 타입·상수
├── apps/
│   ├── consumer/        ← Next.js 15 (소비자 PWA)
│   ├── seller/          ← Next.js 15 (판매자 앱)
│   ├── driver/          ← Next.js 15 (드라이버 앱)
│   └── api/             ← NestJS (비즈니스 로직 전담)
└── pnpm-workspace.yaml
```

**채택 이유**

`OrderStatus` 타입이 세 앱에서 다르게 정의되면 Firestore 실시간 리스너 오작동.
`packages/shared`에 단일 정의 후 세 앱이 import하는 구조로 타입 불일치를 원천 차단.

---

## [2026-03-25] 공동구매 결제·취소·환불 정책 확정

### 결제 시점
- **즉시 결제 (Option A)** 채택 — 참여 즉시 Portone으로 실제 청구
- Pre-auth(사전 승인) 미적용 — 카카오페이·네이버페이가 pre-auth 미지원

### 취소 가능 구간
| 구간 | 취소 | 환불 |
|------|------|------|
| RECRUITING | 가능 | 즉시 처리 (Portone 환불 API) |
| CONFIRMED 이후 | **불가** | 불가 |

### CONFIRMED 이후 취소 불가 이유
CONFIRMED는 계약 성립 시점 — 판매자가 생산/조달 시작. 단일 취소가 `currentParticipants < minParticipants`를 유발해 전체 참여자에 영향.

### 법적 동의 수령 (전자상거래법 제17조)
참여 전 "확정 이후 취소 불가" 동의 체크박스 + Firestore `groupBuyConsent` 기록:
```ts
groupBuyConsent: { agreed: true, agreedAt: Timestamp, userId: string }
```

### 동의 수령 위치 (와이어프레임 반영)
1. `GroupBuyOptionSheet` — "확정 이후 취소·환불 불가" 체크박스 (미체크 시 버튼 비활성)
2. `checkout/group` — 약관 동의 문구 구체화

### 알림톡 발송 시점
| 트리거 | 수신자 |
|--------|--------|
| RECRUITING → CONFIRMED | 전체 참여자 |
| RECRUITING → CANCELLED (기간 만료) | 전체 참여자 (+ 자동 환불 안내) |
| CONFIRMED → PREPARING | 전체 참여자 |
| PREPARING → DELIVERING | 전체 참여자 |
개인 취소(RECRUITING 중) → 본인 UI만, 타 참여자 알림 없음

---

## [2026-03-25] 실시간 데이터 전략 확정

### 결정: Firestore 직접 리스너 유지 (단, 결제 완료 화면 예외)

| 데이터 | 방식 |
|--------|------|
| 주문 상태 변경 (결제 완료 화면) | **Firestore REST API 폴링 3초** ← [2026-03-27] 변경 |
| 공동구매 참여 인원 (`currentParticipants`) | Firestore 실시간 리스너 |
| Daily Cap 잔여량 (`usedSlots`) | Firestore 실시간 리스너 |
| 결제 검증·환불·알림 | NestJS API |

WebSocket·Redis·SSE 별도 구성 없음. Firestore가 실시간 채널 역할 전담.
NestJS Repository 추상화 없이 Firestore SDK 직접 사용 (이중 추상화 불필요).

### [2026-03-27] useOrderStatus: onSnapshot → REST API 폴링 변경

**원인**: PWA Service Worker(`@ducanh2912/next-pwa`)가 Firebase SDK의 내부 HTTP/2 스트리밍 요청을 가로채 응답하지 않음. `onSnapshot`, `getDoc` 모두 동일하게 실패. Firestore REST API 직접 `fetch()`는 정상 동작 확인.

**결정**: `/order/success` 페이지의 `useOrderStatus`는 Firebase SDK 대신 `https://firestore.googleapis.com/v1/...` REST API를 직접 호출하는 3초 폴링으로 대체. 결제 완료 화면은 밀리초 단위 실시간이 불필요하므로 UX 영향 없음.

**향후**: PWA Service Worker에 Firebase URL 예외 처리 추가 시 `onSnapshot` 복구 가능.

---

## [2026-03-26] 4단계 정합성 검토 미해결 백로그

### 🔴 Critical — apps/api 보완 필요 (Step 4 완료 후 일괄 처리)

| # | 엔드포인트 | 파일 | 조치 |
|---|-----------|------|------|
| C-1 | `PATCH /stores/:storeId/products/:id/active` | `products.controller.ts` | ✅ 2026-03-26 완료 |
| C-2 | `PATCH /stores/:storeId/orders/:id/review` | `orders.controller.ts` | ✅ 2026-03-26 완료 |
| C-3 | `GET /stores/:storeId/daily-caps` | `products.controller.ts` | ✅ 2026-03-26 완료 |
| C-4 | `PATCH /stores/:storeId/daily-caps/:date` | `products.controller.ts` | ✅ 2026-03-26 완료 |

### 🟡 Warning — Step 5 전 보완

| # | 항목 | 파일 | 조치 |
|---|------|------|------|
| W-1 | `GET /notifications/me` | `notifications.controller.ts` | ✅ 2026-03-26 완료 |
| W-2 | `PATCH /notifications/me/preferences` | `notifications.controller.ts` | ✅ 2026-03-26 완료 |
| W-3 | `GET /payments/:paymentId` | `payments.controller.ts` | ✅ 2026-03-26 완료 |
| W-4 | `GET /stores/:storeId/orders/:id/payment` | `payments.controller.ts` | ✅ 2026-03-26 완료 |
| W-5 | Kakao/Naver OAuth Provider | `apps/consumer/src/auth.ts` | ⏸ 키 발급 후 주석 해제 (스켈레톤 추가됨) |
| W-6 | Firestore Timestamp → ISO8601 직렬화 | `src/common/interceptors/timestamp.interceptor.ts` | ✅ 2026-03-26 전역 인터셉터로 완료 |

---

## [2026-03-27] 2차 정합성 검토 — Vercel 배포 후

| # | 등급 | 항목 | 파일 | 조치 |
|---|------|------|------|------|
| C-1 | 🔴 Critical | PWA 아이콘 누락 | `public/icons/*.png` | ✅ 192x192, 512x512 생성 완료 |
| M-1 | 🟡 Major | `portonePaymentParams.buyerName`에 userId 사용 | `orders.service.ts` | ✅ users Firestore 조회 후 name 사용으로 수정 |
| m-1 | 🟢 Minor | 상품 조회 API 미사용 (Firestore 직접 접근) | Consumer hooks | 설계 의도대로 — Firestore 직접 접근 유지 |
| m-2 | 🟢 Minor | `/auth/me` 미사용 | Consumer | 향후 프로필 갱신 기능 추가 시 활용 |
| m-3 | 🟢 Minor | `/notifications/*` 미사용 | Consumer | 알림 기능 구현 시 사용 예정 |

---

## [2026-03-28] 5차 정합성 검토 — seller 설계 문서 ↔ 전체 spec 교차 검증

### 수정 완료

| # | 등급 | 항목 | 파일 | 조치 |
|---|------|------|------|------|
| C-1 | 🔴 Critical | `products.md` stores 스키마 — 판매자 프로필 7개 필드 누락 (businessNumber 등) | `docs/specs/products.md`, `docs/소비자 설계 - 1단계 요구사항 정의.md` | ✅ 두 문서 모두 확장 필드 반영 |
| C-2 | 🔴 Critical | `orders.md` + shared 타입 — `preparedAt` 필드 누락 | `docs/specs/orders.md` | ✅ 스키마 + Order 인터페이스에 `preparedAt: string | null` 추가 |
| M-1 | 🟡 Major | `notifications.md` — SELLER_* 5종 템플릿 spec 미반영 (코드는 4차 검토에서 구현됨) | `docs/specs/notifications.md` | ✅ 판매자 알림 섹션 + `NotificationTemplateCode` 타입 추가 |
| M-2 | 🟡 Major | `products.md` groupProductConfig — `isProcessed` 플래그 누락 (4차 검토 minor 수정 반영) | `docs/specs/products.md` | ✅ `isProcessed: boolean` 필드 추가 |
| m-1 | 🟢 Minor | `auth.md` — 역할별 로그인 Provider 정책 미명시 | `docs/specs/auth.md` | ✅ seller 네이버 미지원 + 이유 명시 |

### 설계 공백 — seller 앱 스캐폴딩 착수 시 spec 추가 필요

| 항목 | 현황 | 조치 |
|------|------|------|
| `settlements` 모듈 | 스키마: 판매자 설계 1단계 §7에 정의. API·트리거 로직 미정의 | seller 앱 착수 시 `docs/specs/settlements.md` 신규 작성 |
| `hubs` 모듈 | 스키마: 판매자 설계 1단계 §7에 정의. CRUD API 미정의 | seller 앱 착수 시 `docs/specs/hubs.md` 신규 작성 |
| `orders.preparedAt` API 반영 | spec 업데이트 완료. NestJS `PATCH /orders/:id/status` PREPARING 전환 시 `preparedAt` 수신 필요 | seller 앱 착수 시 `orders.service.ts` 수정 |

---

## [2026-03-28] 4차 정합성 검토 — seller 앱 설계 착수 전

### 수정 완료

| # | 등급 | 항목 | 파일 | 조치 |
|---|------|------|------|------|
| C-1 | 🔴 Critical | Webhook 후 소비자 알림 미발송 (`ORDER_ACCEPTED`, `GROUP_JOINED`) | `payments.service.ts` | ✅ handleWebhook 성공 분기에 `notifications.sendToUser` 추가 |
| C-2 | 🔴 Critical | `PaymentsService` ↔ `NotificationsService` 순환 의존성 | `payments.module.ts`, `notifications.module.ts`, `notifications.service.ts`, `payments.service.ts` | ✅ NestJS `forwardRef()` 로 해소 |
| C-3 | 🔴 Critical | 판매자 알림 전무 (신규주문·공동구매달성·개인취소·자동환불) | `notifications.service.ts`, `orders.service.ts` | ✅ `SELLER_*` 템플릿 4종 추가, `sendToStoreOwner` 구현 |
| M-1 | 🟡 Major | `getOrder`/`getOrders` 판매자 storeId 소유권 검증 누락 | `orders.service.ts` | ✅ `user.storeId !== storeId` 시 403 추가 |
| M-2 | 🟡 Major | `portonePaymentParams.merchantUid` V1 필드명 잔존 | `orders.service.ts` | ✅ 제거 — spec(`payments.md`) 기준 `{ name, amount, buyerName }` 정렬 |
| m-1 | 🟢 Minor | 공동구매 스케줄러 매분 중복 쿼리 | `notifications.service.ts` | ✅ `groupProductConfig.isProcessed` 플래그 도입, 처리 후 `true` 설정 |

### 설계 의도 확정 (코드 변경 불필요)

| 항목 | 결정 |
|------|------|
| 드라이버 주문 접근 제어 | driver는 storeId 범위 내 전체 주문 조회 허용 — 배송 담당자는 해당 storeId 모든 주문을 알아야 함. 드라이버 앱 설계 시 재검토 |
| `SELLER_TRANSITIONS` 중복 항목 (`DELIVERING: ['CANCELLED']`) | `getAllowedTransitions`의 일반 취소 로직과 중복이나 명시적 선언으로 유지 — 제거 시 의도 불명확 |

---

## [2026-03-28] 6차 정합성 검토 — 판매자 설계 + 운영 구조 결정 반영

### 수정 완료

| # | 등급 | 항목 | 파일 | 조치 |
|---|------|------|------|------|
| C-1 | 🔴 Critical | `UserRole`에 `'admin'` 미포함 | `auth.md`, `auth.types.ts` | ✅ `'admin'` 추가, 접근 제어 테이블 반영 |
| C-2 | 🔴 Critical | `stores` 스키마에 `status` 필드 누락 | `products.md` | ✅ 5개 값 추가 |
| C-3 | 🔴 Critical | `settlements.status`에 `'paid'` 누락 | `판매자 설계 1단계` | ✅ `'paid'` 추가, 의미 주석 포함 |
| M-1 | 🟡 Major | seller 초대 토큰 가입 플로우·스키마 미정의 | `auth.md` | ✅ §5-2 신규 추가 + `invite_tokens` 스키마 정의 |
| M-2 | 🟡 Major | admin API 접근 제어 미정의 | `auth.md` | ✅ §7 테이블에 admin 컬럼 추가 + 우회 원칙 명시 |
| M-3 | 🟡 Major | 주문 목록 조회 admin 케이스 미반영 | `orders.md` | ✅ `userId` admin 시 선택적으로 변경, 주석 추가 |
| M-4 | 🟡 Major | 판매자 알림 "미구현" 표기 오류 | `판매자 설계 1단계` | ✅ 4차 검토 구현 완료로 현행화 |

### 설계 공백 — seller 스캐폴딩 착수 시 처리

| 항목 | 현황 |
|------|------|
| `settlements.md` spec | 스캐폴딩 착수 시 작성 |
| `settlements.md` spec | 스캐폴딩 착수 시 작성 |
| `hubs.md` spec | 스캐폴딩 착수 시 작성 |

### [2026-03-28] 판매자 알림 정책 확정

**결정**: 매 건 알림 제거 → 공동구매 결과 즉시 알림 + 일반 판매 배치 집계 알림으로 정리.

| 유지 | 제거 |
|------|------|
| `SELLER_GROUP_CONFIRMED` — 공동구매 목표 달성 즉시 | `SELLER_NEW_ORDER` — 일반 판매 매 건 알림 (과잉) |
| `SELLER_GROUP_CANCELLED_LACK` — 미달 자동 취소 즉시 | `SELLER_ORDER_CANCELLED` — 소비자 개인 취소 알림 (과잉) |
| `SELLER_ORDER_BATCH` — 일반 판매 배치 집계 (신규) | |

**이유**: 일반 판매 다건 운영 시 매 주문마다 알림이 오면 노이즈. 공동구매는 판매자 행동(준비 시작)이 즉시 필요하므로 실시간 유지.

**코드 조치**: `SELLER_NEW_ORDER`, `SELLER_ORDER_CANCELLED` 호출부는 seller 앱 스캐폴딩 시 `orders.service.ts`에서 제거.

### [2026-03-28] 온보딩 Guard 완성 조건 확정

**필수 (미입력 시 `active` 전환 불가)**
```
name            상호명
ceoName         대표자명
phone           연락처
address         소재지
```

**선택 (없어도 `active` 전환 가능)**
```
businessNumber  사업자등록번호
logoUrl         로고 이미지
```

**전환 조건**: 필수 4개 모두 입력 완료 시 `stores.status: 'invited' → 'active'` 자동 전환.
로고·사업자번호는 설정 화면에서 언제든 추가 가능.

> 당근비즈 벤치마킹은 이후 Phase 2 다중 판매자 온보딩 UX 개선 시 참조 예정.

### [2026-03-28] SELLER_ORDER_BATCH 발송 주기 확정

**1일 1회** — 발송 시각은 seller 앱 착수 시 확정 (오후 8시 유력).
0건이면 미발송.

---

## [2026-03-28] 플랫폼 운영 구조 확정 — 판매자 등록 · 수수료 · admin 역할

### 결정 1: 운영자(admin) = 플랫폼 개발자 본인 + admin 앱 구조 로드맵

운영자는 별도 인물이 아닌 플랫폼을 만든 개발자 본인.

**admin 앱 구조 로드맵 (B→A)**
```
B안 (지금):   apps/seller /admin/* 경로로 통합 운영
              판매자는 /orders·/products 등 접근
              운영자만 /admin/* 접근 (role: 'admin' Guard)

A안 (확장):   apps/admin 별도 앱으로 분리
              분리 비용: /admin/* 페이지 파일 이동 + Vercel 프로젝트 추가 (~30분)
              NestJS API 엔드포인트는 동일 사용 — 코드 변경 없음
```

**A안 전환 시점 판단 기준** (해당 시 분리)
- 운영팀 인원이 생겨 admin URL을 판매자에게 노출하고 싶지 않을 때
- admin 기능이 늘어 seller 앱 번들 크기에 영향을 줄 때
- `admin.greenhub.kr` 별도 도메인이 필요할 때

**구현 방식**: 본인 Firestore `users` 문서에 `role: 'admin'` 수동 1회 설정 → 이후 웹앱 내에서 모든 권한 보유.

**admin에서 관리하는 범위**
```
/admin/stores        판매자 목록 · 초대 토큰 발급 · 승인 · 수수료율 설정
/admin/users         소비자 계정 조회 · 정지/복구
/admin/orders        전체 주문 조회 · 환불 강제 처리
/admin/settlements   판매자별 정산 처리 (confirmed → paid 이체 완료 처리)
/admin/invite        초대 토큰 발급 (판매자 등록 A안)
```

---

### 결정 2: 판매자 등록 구조 — A안으로 시작, B안으로 확장

**로드맵**
```
지금 (단일 판매자)   → A안: admin이 초대 토큰 생성 → 판매자가 링크로 가입
판매자 증가 시       → B안: 판매자 자체 신청 → admin 승인
(A→B 전환 비용 없음 — status 필드 설계만 처음부터 확장 가능하게)
```

**stores.status 확정 (처음부터 5개 값 지원)**
```
'invited'            A안 전용 — 초대 발송됨, 가입 전
'pending_approval'   B안 전용 — 판매자 자체 신청, 승인 대기
'active'             공통 — 정상 운영 중
'rejected'           공통 — 거절됨
'suspended'          공통 — 운영 정지
```

B안 전환 시 추가 작업: 공개 신청 폼 1개 추가 + `pending_approval` 상태로 저장.
admin 승인 화면은 A안 때 이미 존재하므로 수정 불필요.

---

### 결정 3: 수수료 정산 구조 — C→B→A 단계적 확장

**Portone 계정은 운영자(본인) 명의** — 모든 소비자 결제가 운영자 계좌로 수취됨.
이로써 플랫폼이 중간에서 수수료를 떼고 판매자에게 정산하는 마켓플레이스 구조가 이미 성립.

**로드맵**
```
C안 (지금):    commissionRate = 0 → 운영자가 전액 판매자에게 이체 (수수료 없음)
B안 (확장):    commissionRate > 0 → settlements 기반 수동 주기 정산 (운영자가 직접 이체)
A안 (자동화):  Portone 마켓플레이스 서브머천트 계약 → 자동 분배 (판매자 10인+ 시점)
```

**settlements.status 확정 (기존 3개 → 4개)**
```
'pending'    주문 진행 중
'confirmed'  주문 완료 — 판매자 지급 대기
'paid'       운영자가 판매자 계좌로 이체 완료  ← 신규 추가
'cancelled'  주문 취소
```

**admin 정산 화면 역할**: `confirmed` 건 합산 → [이체 완료 처리] → `paid` + `paidAt` 기록 → 판매자 알림.
**판매자 앱 정산 화면 역할**: 조회 전용 (`confirmed` = 입금 예정, `paid` = 입금 완료).

**수수료 계산식 (변경 없음)**
```
commissionAmount  = totalAmount × commissionRate
settlementAmount  = totalAmount − commissionAmount
→ stores.commissionRate 값만 변경하면 코드 수정 불필요
```

---

## [2026-03-27] 3차 정합성 검토 — 결제 E2E 테스트 완료 후

### 수정 완료

| # | 등급 | 항목 | 파일 | 조치 |
|---|------|------|------|------|
| C-1 | 🔴 Critical | `shared/payment.types.ts` Portone V1 필드명 (`portoneImpUid`, `portoneMerchantUid`) | `packages/shared/src/payment.types.ts` | ✅ V2 기준 `portonePaymentId`, `portoneTransactionId`로 변경 |
| C-2 | 🔴 Critical | `docs/specs/payments.md` 전체가 Portone V1 기준 (webhook 포맷, 필드명, 플로우) | `docs/specs/payments.md` | ✅ Portone V2 전면 업데이트 |
| M-1 | 🟡 Major | `pickup-confirm` 엔드포인트 스펙 미정의 | `docs/specs/orders.md` | ✅ 엔드포인트 및 동작 추가 |
| M-2 | 🟡 Major | `POST /auth/register` Request Body에 `role` 필드 누락 | `docs/specs/auth.md` | ✅ 멀티앱 구조 설계 의도 명시 |
| m-1 | 🟢 Minor | `PortonePaymentParams` 타입이 V1 파라미터 기준 | `packages/shared/src/payment.types.ts` | ✅ V2 SDK 파라미터로 교체 |

### 설계 의도 확정 (코드 변경 불필요)

| 항목 | 결정 |
|------|------|
| PENDING 타임아웃 스케줄러 위치 | `PaymentsService`에 위치 — 결제 도메인 책임 (PENDING은 payments 생명주기) |
| `PaymentStatus.FAILED` 저장 누락 | PENDING 타임아웃·금액 위변조 시 payments 문서 미생성이 의도적 — 결제 자체가 성립되지 않은 케이스 |
| `role: 'consumer'` 기본값 미적용 | 멀티앱 구조상 API가 role을 명시적으로 받는 것이 올바름 (OAuth만 consumer 기본값) |
