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

## [2026-03-27] Vercel 배포 후 정합성 검토

| # | 등급 | 항목 | 파일 | 조치 |
|---|------|------|------|------|
| C-1 | 🔴 Critical | PWA 아이콘 누락 | `public/icons/*.png` | ✅ 192x192, 512x512 생성 완료 |
| M-1 | 🟡 Major | `portonePaymentParams.buyerName`에 userId 사용 | `orders.service.ts` | ✅ users Firestore 조회 후 name 사용으로 수정 |
| m-1 | 🟢 Minor | 상품 조회 API 미사용 (Firestore 직접 접근) | Consumer hooks | 설계 의도대로 — Firestore 직접 접근 유지 |
| m-2 | 🟢 Minor | `/auth/me` 미사용 | Consumer | 향후 프로필 갱신 기능 추가 시 활용 |
| m-3 | 🟢 Minor | `/notifications/*` 미사용 | Consumer | 알림 기능 구현 시 사용 예정 |
