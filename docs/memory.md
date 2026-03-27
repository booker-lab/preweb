# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-27 (결제 E2E 테스트 완료)

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~3단계 | 요구사항 · IA · 와이어프레임 | ✅ |
| 4단계 | API 계약 + apps/api + apps/consumer 구현 | ✅ |
| 5단계 | 배포 준비 (Railway + Vercel 설정) | ✅ |
| 6단계 | 정합성 검토 (1차) | ✅ |
| 7단계 | Railway 실배포 | ✅ |
| 8단계 | Vercel 실배포 + 정합성 검토 (2차) | ✅ |

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

---

## Vercel 환경변수 (10개 등록 완료)

`NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`NEXT_PUBLIC_FIREBASE_*` (6개), `NEXT_PUBLIC_PORTONE_STORE_ID`, `NEXT_PUBLIC_PORTONE_KAKAOPAY_CHANNEL_KEY`

---

## 정합성 검토 이력

### 1차 (2026-03-26) — 개발 완료 후
| 등급 | 수정 내용 |
|------|-----------|
| Critical | `PATCH /auth/me/addresses/:id/default` 엔드포인트 추가 |
| Major | `SELLER_TRANSITIONS` PREPARING→DELIVERING 판매자 제거 |
| Major | `RefundController POST /refund` 외부 엔드포인트 제거 |

### 2차 (2026-03-27) — Vercel 배포 후
| 등급 | 수정 내용 |
|------|-----------|
| Critical | PWA 아이콘 생성 (`public/icons/icon-192x192.png`, `icon-512x512.png`) |
| Major | `portonePaymentParams.buyerName`: userId → Firestore users 조회 후 name 사용 |

---

## 결제 E2E 테스트 결과 (2026-03-27 완료)

- KakaoPay 3,100원 결제 성공 → Portone V2 웹훅 → 주문 ACCEPTED → `/order/success` 표시 ✅
- **Portone V2 마이그레이션 완료**: portone.client.ts, portone-webhook.dto.ts, payments.service.ts
- **Firestore Security Rules 배포**: `orders/*` allow read: if true
- **useOrderStatus**: PWA SW 충돌로 Firebase SDK 동작 불가 → Firestore REST API 폴링으로 대체 (CRITICAL_LOGIC.md 기록)

---

## 다음 세션 우선순위

### 1순위 — seller 앱 착수
- `apps/seller` Next.js 스캐폴딩
- 판매자: 상품 관리, 주문 관리, Daily Cap 설정

### 2순위 — 네이버페이 파트너 가입
- `docs/memory_payment.md` (결제 수단 도입 계획) 참조

---

## 포트원 현황

| 채널 | 상태 |
|------|------|
| 카카오페이 (테스트) | ✅ 채널 키 발급 완료 |
| 네이버페이 (테스트) | ⏸ 파트너 가입 필요 (Vercel URL 있으므로 가능) |
| 카드 (토스페이먼츠) | ⏸ MVP 완료 후 |
