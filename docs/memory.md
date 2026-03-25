# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-26 (apps/api 완료 + 정합성 검토 완료 / 포트원 채널 준비 완료)

---

## 현재 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 요구사항 정의 | ✅ 완료 |
| 2단계 | 정보 구조 설계 (IA) | ✅ 완료 |
| 3단계 | 화면 설계 (Wireframe) | ✅ 완료 |
| 4단계 | API 계약 + 실제 개발 | 🔄 진행 중 (apps/api ✅, apps/consumer 🔜) |

---

## apps/api 완료 상태 (최신 커밋: c7a5831)

| 모듈 | 주요 기능 |
|------|----------|
| FirestoreModule | Global, Admin SDK, 트랜잭션 헬퍼 |
| AuthModule | register→{userId} / login→{accessToken,user}, JWT, 배송지 CRUD, FCM |
| ProductsModule | 상품 CRUD, {items,total}+groupSummary 응답, deliveryConfig |
| OrdersModule | Daily Cap 트랜잭션, FSM 전환+알림연결, 취소+환불, 픽업확인 |
| PaymentsModule | Portone webhook+금액검증, processRefundByOrderId, PENDING 15분 스케줄러 |
| NotificationsModule | 알리고 알림톡, 공동구매 자동확정/취소(환불포함), 마감2h 알림 |

**정합성 검토 수정 완료** — Critical 5건 + Major 4건 (상세: `CRITICAL_LOGIC.md` 참조)

---

## 포트원 준비 현황 (2026-03-26)

| 채널 | 상태 | 비고 |
|------|------|------|
| 카카오페이 (테스트) | 🔜 추가 필요 | 관리자 콘솔 → 결제 연동 → 채널 추가 |
| 네이버페이 (테스트) | 🔜 추가 필요 | 동일 |
| 카드/토스페이먼츠 | ⏸ MVP 완료 후 | PG 심사 1~2 영업일 소요 |

> 채널 추가 후 **채널 키** 발급 → `apps/api/.env` + `apps/consumer/.env.local`에 등록

```env
# apps/api/.env
PORTONE_API_KEY=imp_xxxxxxxx
PORTONE_API_SECRET=xxxxxxxxxxxxx

# apps/consumer/.env.local
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxxxxxxx
NEXT_PUBLIC_PORTONE_KAKAOPAY_CHANNEL_KEY=channel-key-xxxxxxxx
NEXT_PUBLIC_PORTONE_NAVERPAY_CHANNEL_KEY=channel-key-xxxxxxxx
```

---

## 다음 세션 최우선 작업: apps/consumer Next.js 15 PWA

**경로**: `C:\Develop\greenhub\apps\consumer` (현재 빈 플레이스홀더)

### 작업 순서

```
Step 1 — Next.js 15 스캐폴딩
  cd apps/consumer
  pnpm dlx create-next-app@latest .
  선택: TypeScript ✅ / Tailwind CSS ✅ / App Router ✅ / src/ 디렉토리 ✅

Step 2 — PWA 기반 구성
  pnpm add @ducanh2912/next-pwa
  manifest.json (이름·아이콘·theme_color)
  service-worker 등록
  A2HS 버튼 → mypage/page.tsx

Step 3 — NextAuth.js v5 인증
  pnpm add next-auth@beta
  카카오 OAuth Provider  (KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET 필요)
  네이버 OAuth Provider  (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 필요)
  Credentials Provider  → POST /auth/login (NestJS) → accessToken 반환
  세션에 accessToken 포함하여 API 요청 헤더에 삽입

Step 4 — Firestore 실시간 리스너
  pnpm add firebase (클라이언트 SDK)
  실시간 구독 대상:
    orders/{orderId}                    — 주문 상태 변경
    groupProductConfig/{productId}      — 공동구매 참여 인원
    dailyCaps/{storeId_date}            — Daily Cap 잔여 슬롯

Step 5 — 결제 플로우 (Portone SDK v2)
  pnpm add @portone/browser-sdk
  흐름: POST /stores/:storeId/orders → portonePaymentParams 수신
        → PortOne.requestPayment() 결제창 오픈
        → Firestore 리스너로 orders.status 변경 감지 → 완료 화면
  ⚠️ 포트원 채널 키 발급 선행 필요 (위 포트원 준비 현황 참조)
```

---

## 환경변수 준비 체크리스트

| 항목 | 시점 | 상태 |
|------|------|------|
| 포트원 API Key/Secret | Step 5 전 | 🔜 채널 추가 후 발급 |
| 포트원 채널 키 (카카오·네이버) | Step 5 전 | 🔜 채널 추가 필요 |
| 카카오 OAuth Client ID/Secret | Step 3 전 | ⏸ 미발급 |
| 네이버 OAuth Client ID/Secret | Step 3 전 | ⏸ 미발급 |
| 알리고 API Key + 발신번호 + 채널키 | 알림 테스트 전 | ⏸ 미발급 |

---

## 미완료 (LOW — 3단계 잔여, consumer 개발 중 함께 처리)

- [ ] PWA A2HS 버튼 — `mypage/page.tsx`
- [ ] 환불 계좌 수정 — `mypage/refund-account/page.tsx`
- [ ] 카드 간편결제 — `mypage/card-payment/page.tsx`

---

## 아키텍처 확정

| 항목 | 내용 |
|------|------|
| 백엔드 | NestJS · `C:\Develop\greenhub\apps\api` · Railway 배포 |
| 프론트 | Next.js 15 · `C:\Develop\greenhub\apps\consumer` · Vercel 배포 |
| 실시간 | Firestore 직접 리스너 (WebSocket 불필요) |
| 인증 | NextAuth.js v5 (프론트) + JwtAuthGuard (API) |
| 구조 | pnpm 모노레포 · `C:\Develop\greenhub` |
| Firebase | green-e4fe3 · asia-northeast3 · `apps/api/firebase-adminsdk.json` |
