# Green Hub — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-29 (E2E 테스트 완료)

## ⚡ 다음 세션 즉시 착수 포인트

**첫 번째 작업: 셀러 앱 PREPARING → DELIVERING 플로우 검증**

### 다음 세션 테스트 순서

```
셀러 앱 (greenhub-seller.vercel.app / seller2@test.com / test1234)
  → 주문 목록(ACCEPTED) → 준비 시작 클릭(PREPARING) → 배송 시작 클릭(DELIVERING)
  → 소비자 앱에서 주문 상태 변화 확인
```

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~16-3 | 요구사항·IA·API·배포·결제·seller 핵심화면·정합성 검토 | ✅ |
| 17 | 소비자 앱 결제 E2E 테스트 | ✅ 2026-03-29 완료 |
| 18 | 셀러 앱 PREPARING→DELIVERING 플로우 검증 | 🔲 다음 세션 1순위 |
| 19 | 소비자 마이페이지 `/mypage/orders/[id]` 상태 타임라인 | 🔲 Phase B |

---

## 배포 현황

| 항목 | 값 |
|------|-----|
| Railway API | `https://api-production-13e7.up.railway.app` · ✅ 최신 (cadc6c8) |
| Vercel Consumer | `https://greenhubconsumer.vercel.app` · ✅ Ready |
| Vercel Seller | `https://greenhub-seller.vercel.app` · ✅ Ready |
| Firebase | `green-e4fe3` · asia-northeast3 · ✅ |
| GitHub | `booker-lab/greenhub` |

---

## 이번 세션 수정 내역 (2026-03-29)

| 커밋 | 파일 | 수정 내용 |
|------|------|----------|
| 17a4a3b | `portone-webhook.dto.ts` | Portone V2 실제 payload의 `timestamp`, `data.transactionId` 필드 추가 → 400 에러 해소 |
| ade5a8f | `payments.service.ts` | `Transaction.Ready` 웹훅 무시 처리 — 결제창 오픈 이벤트로 주문이 CANCELLED되던 버그 수정 |
| cadc6c8 | `seller/orders/page.tsx` | Firestore Timestamp → 상대 시간 변환 NaN 버그 수정 (`toDate()` 분기 처리) |

---

## 기술 특이사항

- **로컬 실행**: `dev-local.bat` (API+Consumer) / `dev-local-all.bat` (전체 3개)
- seller 개발 서버: `pnpm --filter seller dev -- --port 3002`
- seller 테스트 계정: `seller2@test.com` / `test1234` · storeId: `dear-orchid`
- consumer 테스트 계정: `customer@test.com` / `test1234` (role: consumer)
- Portone v2 — 테스트 모드, 웹훅 URL: `https://api-production-13e7.up.railway.app/payments/webhook/portone`
- Portone V2 웹훅 이벤트 순서: `Transaction.Ready`(무시) → `Transaction.Paid`(처리)
- `PREPARING→DELIVERING` 판매자 임시 허용 — 드라이버 앱 완성 시 `SELLER_TRANSITIONS`에서 제거

## 잔여 이슈 (non-blocking)

| 항목 | 상태 |
|------|------|
| `store.types.ts` shared 패키지 미존재 | 🔲 여유 시 |
| `groupProductConfig` Firestore 복합 인덱스 누락 (Scheduler) | 🔲 공동구매 기능 활성화 시 |
