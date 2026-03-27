# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-28 (안티그래비티 세션 — 5차 정합성 검토 + preparedAt 보완 + 백로그 문서화 완료)

## ⚡ 다음 세션 즉시 착수 포인트

**다음 세션 첫 번째 작업: seller 앱 스캐폴딩 착수**

참조 문서:
- `docs/판매자 설계 - 1단계 요구사항 정의.md` ✅ 완료
- `docs/판매자 설계 - 2단계 정보 구조 설계(IA).md` ✅ 완료
- `docs/BACKLOG.md` §1 seller 앱 스캐폴딩 체크리스트 참조

착수 순서:
1. `apps/seller` Next.js 생성 + pnpm workspace 등록
2. NextAuth.js v5 설정 (`role: 'seller'`, `role: 'admin'`)
3. settlements·hubs 모듈 NestJS 동시 개발 (`docs/specs/` 신규 작성 병행)
4. `SELLER_ORDER_BATCH` 발송 시각 최종 확정 (오후 8시 유력)

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
| 10단계 | seller 앱 설계 1·2단계 (IA) | ✅ 문서 완료 |
| 11단계 | 6차 정합성 검토 + 운영 구조 설계 확정 | ✅ 완료 |

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

- 설계 문서: `docs/판매자 설계 - 1단계/2단계 IA.md` 완료
- 별도 URL, 모바일 우선 PWA, 데스크톱 반응형
- MVP 단일 판매자, storeId 구조로 다중 판매자 확장 가능
- 신규 DB 스키마: `settlements` 컬렉션, `hubs` 컬렉션, `orders.preparedAt` 필드
- **settlements.md · hubs.md spec**: seller 스캐폴딩 착수 시 동시 작성

### 운영 구조 확정 (2026-03-28)

- **운영자 = 본인(플랫폼 개발자)** — `role: 'admin'` Firestore 수동 설정 1회
- **admin 앱 구조**: B안(seller 앱 `/admin/*`) → 규모 커지면 A안(`apps/admin` 분리, ~30분, API 변경 없음)
- **판매자 등록**: A안(초대 토큰) → B안(자체 신청+승인) 단계적 확장
  - `stores.status`: `invited` / `pending_approval` / `active` / `rejected` / `suspended`
  - `invite_tokens` 컬렉션 스키마: `auth.md` §5-2 참조
- **수수료 정산**: C→B→A 로드맵 (Portone 계정 = 운영자 명의 확인)
  - `settlements.status`: `pending` / `confirmed` / `paid` / `cancelled`
- **온보딩 Guard**: 필수 4개(name·ceoName·phone·address) 완료 시 `active`. 사업자번호·로고는 선택
- **판매자 알림**: `SELLER_GROUP_CONFIRMED` + `SELLER_GROUP_CANCELLED_LACK` 즉시 / `SELLER_ORDER_BATCH` 1일 1회 (오후 8시 유력)
  - 제거: `SELLER_NEW_ORDER`, `SELLER_ORDER_CANCELLED` (seller 스캐폴딩 시 코드 제거)

---

## 포트원 현황

| 채널 | 상태 |
|------|------|
| 카카오페이 (테스트) | ✅ 채널 키 발급 완료 |
| 네이버페이 (테스트) | ⏸ 파트너 가입 필요 (Vercel URL 있으므로 가능) |
| 카드 (토스페이먼츠) | ⏸ MVP 완료 후 |
