# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-28 (seller 앱 /orders/[id] 주문 상세 구현 + 설계 결정 2건 확정)

## ⚡ 다음 세션 즉시 착수 포인트

**다음 세션 첫 번째 작업: `/products/new` + `/products/[id]/edit` 상품 등록·수정 폼 (seller 앱)**

착수 순서:
1. `/products/new` + `/products/[id]/edit` — 상품 등록·수정 폼
2. `/hubs/[id]` + `/hubs/[id]/pickup` — 거점 상세 + 픽업 코드 확인
3. Vercel seller 배포 + Railway 재배포

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~14단계 | 요구사항·IA·API·배포·결제·seller 핵심화면 | ✅ |
| 15단계 | seller 앱 미구현 화면 3종 | 🔲 진행 중 |
| 15-1 | `/orders/[id]` 주문 상세 | ✅ 이번 세션 완료 |
| 15-2 | `/products/new` + `/products/[id]/edit` | 🔲 다음 세션 |
| 15-3 | `/hubs/[id]` + `/hubs/[id]/pickup` | 🔲 다음 세션 |

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

## 이번 세션 완료 작업

| 작업 | 내용 |
|------|------|
| `/orders/[id]` 구현 | 주문 상세 화면 신규 생성 |
| 주문 목록 카드 클릭 연동 | orders/page.tsx → /orders/[id] 라우팅 |
| `Order.preparedAt` 타입 추가 | packages/shared/src/order.types.ts |
| 판매자 취소 권한 설계 확정 | DELIVERING 이전까지만 허용 |
| BACKLOG §6 추가 | 다중 판매자 상점 페이지 Phase 2 |
| BACKLOG §8 추가 | 거점 배송 오픈 조건·작업 목록 |

---

## 확정된 설계 결정 (이번 세션)

### 판매자 강제 취소 권한
- **허용**: `ACCEPTED` · `CONFIRMED` · `PREPARING` → `CANCELLED`
- **불가**: `DELIVERING` 이후 — 소비자 반품 신청 루트로만 처리
- 근거: 발송 후 판매자 일방 취소는 표준 e-커머스에 없는 개념, 드라이버 픽업 후 상품 회수 주체 모호

### 거점 배송 UI 비노출 (MVP)
- 코드·FSM·API 전부 완성, 소비자 앱 UI만 닫음
- 오픈 조건: 협력 업체(꽃집·과일가게) 계약 확정 시

### preparedAt 기본값 분기
- 일반 판매: `requestedDeliveryDate` (소비자 희망 배송일) 기준 09:00
- 공동구매: `groupProductConfig.groupDeliveryDate` 기준 09:00

---

## seller 앱 현재 구조

```
apps/seller/src/app/
├── login/               ✅
├── onboarding/          ✅
├── orders/
│   ├── page.tsx         ✅ 목록 + 카드 클릭 라우팅
│   └── [id]/page.tsx    ✅ 주문 상세 (이번 세션)
├── products/            ✅ 목록 (등록·수정 폼 미구현)
├── settlements/         ✅
├── hubs/                ✅ + hubs/new (상세·픽업 미구현)
└── settings/            ✅
```

---

## 기술 특이사항

- Next.js 16 Turbopack → `--webpack` 플래그 필수
- `proxy.ts` (구 `middleware.ts`) — Next.js 16 파일명
- seller 개발 서버: `pnpm --filter seller dev` → `http://localhost:3001`
- settlements·hubs Firestore 복합 인덱스 → git 추가 완료, `firebase deploy` 미실행
- Vercel seller 배포 미완료 (`apps/seller` Root Directory로 신규 프로젝트 생성 필요)
