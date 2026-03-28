# Green Hub — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-28 (seller 앱 전체 배포 완료 + 동작 확인)

## ⚡ 다음 세션 즉시 착수 포인트

**다음 세션 첫 번째 작업: 소비자 앱 E2E 테스트 (카카오페이 결제)**

착수 순서:
1. 소비자 앱(`greenhubconsumer.vercel.app`)에서 로그인 → 상품 선택 → 카카오페이 결제 플로우 확인
2. seller 앱(`greenhub-seller.vercel.app`)에서 주문 접수 → 준비 시작 → 배송 시작 처리 확인
3. 마이페이지 서브 화면 구현 (`/mypage/orders/[id]` 상태 타임라인 + 픽업 코드)

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~14단계 | 요구사항·IA·API·배포·결제·seller 핵심화면 | ✅ |
| 15 | seller 앱 hubs 화면 + hub-confirm API + W-1 배송 시작 버튼 | ✅ |
| 16 | 배포 3종 (Firebase·Railway·Vercel seller) | ✅ |
| 16-1 | seller 온보딩 버그 수정 (POST /stores 신규 생성) | ✅ |
| 16-2 | Firestore orders storeId+createdAt 인덱스 추가 | ✅ |
| 17 | 소비자 앱 E2E + 결제 테스트 | 🔲 다음 세션 1순위 |

---

## 배포 현황

| 항목 | 값 |
|------|-----|
| Railway API | `https://api-production-13e7.up.railway.app` · ✅ 최신 |
| Vercel Consumer | `https://greenhubconsumer.vercel.app` · ✅ Ready |
| Vercel Seller | `https://greenhub-seller.vercel.app` · ✅ Ready |
| Firebase | `green-e4fe3` · asia-northeast3 · ✅ 인덱스 최신 |
| GitHub | `booker-lab/greenhub` |

---

## 확정된 설계 결정 이력

| 결정 | 내용 | 기록 위치 |
|------|------|----------|
| 판매자 취소 권한 | ACCEPTED·CONFIRMED·PREPARING만 허용 | CRITICAL_LOGIC §2026-03-28 |
| 거점 픽업 확인 MVP | seller가 hub-confirm 엔드포인트로 코드 입력 (패턴 C) | CRITICAL_LOGIC §2026-03-28 |
| hub_staff 역할 | Phase 2 — 거점 계약 확정 후 도입 | CRITICAL_LOGIC §2026-03-28 |
| 상품 등록 폼 UX | 단일 스크롤 + 조건부 공동구매 필드 슬라이드 다운 | CRITICAL_LOGIC §2026-03-28 |
| POST /stores 온보딩 | 신규 seller는 storeId 없음 → POST로 생성 후 session.update | CRITICAL_LOGIC §2026-03-28 |

---

## seller 앱 구조

```
apps/seller/src/app/
├── orders/ [id]/                ✅ 주문 상세 + 강제취소 + 배송 시작
├── products/ new/ [id]/edit/    ✅ 등록·수정 폼
├── hubs/ [id]/ pickup/          ✅ 거점 상세 + 픽업 코드 확인
└── settlements/ settings/       ✅
```

---

## 기술 특이사항

- **로컬 실행**: `dev-local.bat` (API+Consumer) / `dev-local-all.bat` (전체 3개)
- seller 개발 서버: `pnpm --filter seller dev -- --port 3002`
- 신규 seller 등록: API `/auth/register` + `role: seller` → 온보딩에서 `POST /stores` 자동 생성
- seller 테스트 계정: `seller2@test.com` / `test1234`
- Firestore 인덱스: `orders storeId+createdAt DESC` 신규 추가 (2026-03-28)
