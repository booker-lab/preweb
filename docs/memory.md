# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-28 (안티그래비티 세션 — 4차 정합성 검토 완료 + seller 앱 설계 착수)

## ⚡ 다음 세션 즉시 착수 포인트

**4차 정합성 검토 6건 수정 완료 + 판매자 앱 1단계 설계 문서 작성 완료.**
다음 작업:

1. **판매자 앱 (`apps/seller`) 스캐폴딩 착수** — Next.js 16 PWA, 상품 등록·주문 관리부터
2. **소비자 앱 Phase B** — `/mypage/orders/[id]` 등 서브 화면
3. **네이버페이 파트너 가입** — Vercel URL 있으므로 가능

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~3단계 | 요구사항 · IA · 와이어프레임 | ✅ |
| 4단계 | API 계약 + apps/api + apps/consumer 구현 | ✅ |
| 5단계 | 배포 준비 (Railway + Vercel 설정) | ✅ |
| 6단계 | 1~4차 정합성 검토 전면 완료 | ✅ |
| 7단계 | Railway 실배포 | ✅ |
| 8단계 | Vercel 실배포 | ✅ |
| 9단계 | 결제 E2E 테스트 (KakaoPay) | ✅ |
| 10단계 | seller 앱 설계 1단계 | ✅ 문서 완료 |

---

## 배포 현황

| 항목 | 값 |
|------|-----|
| Railway API | `https://api-production-13e7.up.railway.app` · Online |
| Vercel Consumer | `https://greenhubconsumer.vercel.app` · Ready |
| Firebase | `green-e4fe3` · asia-northeast3 |
| GitHub | `booker-lab/greenhub` |
| 모노레포 | `C:\Develop\greenhub` |

---

## 아키텍처

| 항목 | 내용 |
|------|------|
| 백엔드 | NestJS · `apps/api` · Railway |
| 프론트 | Next.js 16 · `apps/consumer` · Vercel |
| 실시간 | Firestore 리스너 (결제완료 화면은 REST API 폴링 — PWA SW 충돌) |
| 인증 | NextAuth.js v5 + JwtAuthGuard |
| 로컬 실행 | `dev-consumer.bat` 더블클릭 |

---

## 기술 특이사항

- Next.js 16 Turbopack → `@ducanh2912/next-pwa` 충돌 → **`--webpack` 플래그 필수**
- Vercel Root Directory: **`apps/consumer`** (모노레포 루트 아님)
- `apps/consumer/vercel.json` buildCommand: `shared 빌드 → consumer 빌드` 순서 필수
- `proxy.ts` (구 `middleware.ts`) — Next.js 16 파일명 변경
- `useOrderStatus`: PWA SW가 Firebase SDK 스트리밍 가로채 → Firestore REST API 폴링 대체

---

## 4차 정합성 검토 수정 내역 (2026-03-28)

| 등급 | 항목 | 파일 |
|------|------|------|
| 🔴 Critical | Webhook 후 소비자 알림 미발송 | `payments.service.ts` |
| 🔴 Critical | PaymentsService ↔ NotificationsService 순환 의존성 | `payments.module.ts`, `notifications.module.ts` |
| 🔴 Critical | 판매자 알림 전무 (4종 템플릿 추가) | `notifications.service.ts`, `orders.service.ts` |
| 🟡 Major | getOrder/getOrders 판매자 storeId 소유권 검증 누락 | `orders.service.ts` |
| 🟡 Major | portonePaymentParams V1 필드명 잔존 | `orders.service.ts` |
| 🟢 Minor | 공동구매 스케줄러 중복 쿼리 | `notifications.service.ts` (`isProcessed` 플래그) |

---

## seller 앱 설계 (2026-03-28 착수)

- 설계 문서: `docs/판매자 설계 - 1단계 요구사항 정의.md`
- 별도 URL, 모바일 우선 PWA, 데스크톱 반응형
- MVP 단일 판매자, storeId 구조로 다중 판매자 확장 가능
- 수수료율: MVP commissionRate=0, 향후 다중 판매자 시 per-store 적용
- 신규 DB 스키마: `settlements` 컬렉션, `hubs` 컬렉션, `orders.preparedAt` 필드
- 신규 API 모듈 필요: `settlements` module, `hubs` module

---

## 포트원 현황

| 채널 | 상태 |
|------|------|
| 카카오페이 (테스트) | ✅ 채널 키 발급 완료 |
| 네이버페이 (테스트) | ⏸ 파트너 가입 필요 (Vercel URL 있으므로 가능) |
| 카드 (토스페이먼츠) | ⏸ MVP 완료 후 |
