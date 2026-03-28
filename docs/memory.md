# Green Hub — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-29 (마이페이지 Phase B + E2E 연동 검증 완료)

## ⚡ 다음 세션 즉시 착수 포인트

**1순위: `/admin/*` 관리자 영역 (seller 앱 내)**

```
/admin/stores        판매자 목록 · 초대 토큰 발급 · 수수료율
/admin/users         소비자 계정 조회 · 정지/복구
/admin/orders        전체 주문 조회 · 환불 강제 처리
/admin/settlements   정산 처리 (confirmed → paid)
/admin/invite        초대 토큰 발급
```

접근 조건: Firestore `users/{id}.role === 'admin'` — 본인 문서 수동 설정

**2순위: Phase B 나머지**
- `/mypage/addresses` — 배송지 관리
- `/mypage/notifications` — 알림 내역

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~16-3 | 요구사항·IA·API·배포·결제·seller 핵심화면·정합성 검토 | ✅ |
| 17 | 소비자 앱 결제 E2E 테스트 | ✅ 2026-03-29 |
| 18 | seller ↔ consumer E2E 연동 검증 (주문→준비→배송 타임라인) | ✅ 2026-03-29 |
| 19 | 소비자 마이페이지 Phase B — `/mypage/orders/[id]` 상태 타임라인 | ✅ 2026-03-29 |
| 20 | `/admin/*` 관리자 영역 | 🔲 다음 세션 1순위 |

---

## 배포 현황

| 항목 | 값 |
|------|-----|
| Railway API | `https://api-production-13e7.up.railway.app` · ✅ 최신 (c74f1bd) |
| Vercel Consumer | `https://greenhubconsumer.vercel.app` · ✅ Ready |
| Vercel Seller | `https://greenhub-seller.vercel.app` · ✅ Ready |
| Firebase | `green-e4fe3` · asia-northeast3 · ✅ |
| GitHub | `booker-lab/greenhub` |

---

## 이번 세션 수정 내역 (2026-03-29)

| 커밋 | 내용 |
|------|------|
| 78b7def | consumer 마이페이지 Phase B — 주문 목록 + 상태 타임라인 |
| f400c17 | fix: session.user.id 명시적 전달 (NextAuth v5 beta.30 이슈) |
| c4a1692 | fix: useOrders — Firestore runQuery → NestJS API 전환 (보안 규칙 차단) |
| c74f1bd | fix: getOrders 응답 형식 — 래핑 제거 + id 포함 반환 |

---

## 기술 특이사항

- **로컬 실행**: `dev-local.bat` (API+Consumer) / `dev-local-all.bat` (전체 3개)
- seller 개발 서버: `pnpm --filter seller dev -- --port 3002`
- seller 테스트 계정: `seller2@test.com` / `test1234` · storeId: `dear-orchid`
- consumer 테스트 계정: `customer@test.com` / `test1234`
- Portone v2 — 테스트 모드, 웹훅 URL: `https://api-production-13e7.up.railway.app/payments/webhook/portone`
- Portone V2 웹훅 이벤트 순서: `Transaction.Ready`(무시) → `Transaction.Paid`(처리)
- `PREPARING→DELIVERING` 판매자 임시 허용 — 드라이버 앱 완성 시 `SELLER_TRANSITIONS`에서 제거
- NextAuth v5 beta.30: `session.user.id` 자동 매핑 불안정 → auth.ts에 명시적 `token.id = user.id` 필수
- Firestore 보안 규칙: 단일 문서 `get`은 허용, 컬렉션 `list`(runQuery)는 차단 → NestJS API 사용

## 잔여 이슈 (non-blocking)

| 항목 | 상태 |
|------|------|
| `store.types.ts` shared 패키지 미존재 | 🔲 여유 시 |
| `groupProductConfig` Firestore 복합 인덱스 누락 (Scheduler) | 🔲 공동구매 기능 활성화 시 |
| 네이버페이 파트너 가입 | 🔲 도메인 확정 후 신청 |
