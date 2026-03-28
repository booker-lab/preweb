# Green Hub — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-28 (seller 앱 hubs 화면 완성 + hub-confirm API 추가)

## ⚡ 다음 세션 즉시 착수 포인트

**다음 세션 첫 번째 작업: 배포 3종 → 소비자 앱 E2E 확인**

착수 순서:
1. `firebase deploy --only firestore:indexes` (settlements·hubs 인덱스 4개)
2. Railway 재배포 (C-1·C-2·C-3 + hub-confirm 반영)
3. Vercel seller 신규 프로젝트 생성 (Root Directory: `apps/seller`, 환경변수 주입)
4. 배포 후 소비자 앱 E2E 확인 (로그인 → 주문 → 결제 플로우)

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~14단계 | 요구사항·IA·API·배포·결제·seller 핵심화면 | ✅ |
| 15-1 | `/orders/[id]` 주문 상세 | ✅ |
| 15-2 | 8차 정합성 검토 + C-1~C-3 수정 | ✅ |
| 15-3 | `/products/new` + `/products/[id]/edit` | ✅ |
| 15-4 | C-2·C-3 API (hub 주문 조회 + hubId 전파) | ✅ |
| 15-5 | `/hubs/[id]` + `/hubs/[id]/pickup` + `hub-confirm` API | ✅ |
| 16 | 배포 3종 (Firebase·Railway·Vercel seller) | 🔲 다음 세션 1순위 |
| 17 | 소비자 앱 E2E + 결제 테스트 | 🔲 |

---

## 배포 현황

| 항목 | 값 |
|------|-----|
| Railway API | `https://api-production-13e7.up.railway.app` · 재배포 필요 |
| Vercel Consumer | `https://greenhubconsumer.vercel.app` · Ready |
| Vercel Seller | 미생성 — Root Directory `apps/seller` 신규 프로젝트 필요 |
| Firebase | `green-e4fe3` · asia-northeast3 · 인덱스 배포 필요 |
| GitHub | `booker-lab/greenhub` |

---

## 확정된 설계 결정 이력

| 결정 | 내용 | 기록 위치 |
|------|------|----------|
| 판매자 취소 권한 | ACCEPTED·CONFIRMED·PREPARING만 허용 | CRITICAL_LOGIC §2026-03-28 |
| 거점 픽업 확인 MVP | seller가 hub-confirm 엔드포인트로 코드 입력 (패턴 C) | CRITICAL_LOGIC §2026-03-28 |
| hub_staff 역할 | Phase 2 — 거점 계약 확정 후 도입 (BACKLOG §1-9) | CRITICAL_LOGIC §2026-03-28 |
| 상품 등록 폼 UX | 단일 스크롤 + 조건부 공동구매 필드 슬라이드 다운 | CRITICAL_LOGIC §2026-03-28 |
| deliveryFeeDiscount | MVP 폼에서 숨김, 0 고정 | CRITICAL_LOGIC §2026-03-28 |
| hub 주문 쿼리 전략 | hubId 단일 필드 쿼리 + status 앱 레이어 필터 | CRITICAL_LOGIC §2026-03-28 |

---

## seller 앱 구조

```
apps/seller/src/app/
├── orders/ [id]/                ✅ 주문 상세 + 강제취소
├── products/ new/ [id]/edit/    ✅ 등록·수정 폼
├── hubs/ [id]/ pickup/          ✅ 거점 상세 + 픽업 코드 확인
└── settlements/ settings/       ✅
```

---

## 기술 특이사항

- **로컬 실행**: `dev-local.bat` (API+Consumer) / `dev-local-all.bat` (전체 3개)
- seller 개발 서버: `pnpm --filter seller dev -- --port 3002`
- Vercel seller 환경변수: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FIREBASE_*`
- Railway `CORS_ORIGIN`에 seller Vercel URL 추가 필요
- Firestore 인덱스: settlements·hubs 4개 — `firebase deploy` 미실행 상태
