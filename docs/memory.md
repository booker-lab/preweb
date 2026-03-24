# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT(Single Source of Truth)** — 세션 종료 시 항상 이 파일을 최신화합니다.
> 200라인 초과 시 즉시 50라인 이내로 요약 후 아카이브합니다. (CLAUDE.md Fatal Constraint)

최종 수정: 2026-03-25

---

## 현재 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 요구사항 정의 | ✅ 완료 |
| 2단계 | 정보 구조 설계 (IA) | ✅ 완료 |
| 3단계 | 화면 설계 (Wireframe) | ✅ 완료 (정합성 수정 포함) |
| 4단계 | API 계약 정의 + 실제 개발 | 🔲 준비 중 |

---

## 2026-03-25 세션 완료 작업

### 정합성 수정 (1·2단계 문서 → 3단계 와이어프레임)

**[Issue 1] PENDING 상태 문서 반영**
- `소비자 설계 - 1단계 요구사항 정의.md` — orders.status 타입에 `'PENDING'` 추가
- `PWA_설계_문서.md` Section 9 — 일반판매·공동구매 흐름 모두 PENDING → 다음 상태 흐름 추가
- `PWA_설계_문서.md` 앱별 상태 표시 테이블 — PENDING 행 추가 (소비자·판매자 미노출 명시)

**[Issue 2] 공동구매 결제 완료 화면 분기**
- `checkout/group/page.tsx` — 완료 후 `/checkout/complete?type=group` 라우팅
- `checkout/complete/page.tsx` — `useEffect + sessionStorage` 패턴으로 isGroupBuy 판별
- 공동구매 완료 시: 보라색 배너 + 판매자 지정 배송 예정일·수단 표시

**[Issue 3] 공동구매 자동 취소 UI**
- `orders/[id]/page.tsx` — CANCELLED + saleType:group 분기 UI 구현
- 자동 취소 배너 + 카카오 알림톡 발송 완료 안내 노출
- mock: ORD20240325001 (공동구매 자동 취소 케이스)

**라우팅 버그 수정**
- `/groupbuy/[id]` 참여하기: `/checkout` → `/checkout/group` 수정

---

## 주문 상태 코드 확정

```
PENDING     — [내부] 결제 처리 중, 소비자 미노출, 15분 자동 삭제
RECRUITING  — 모집 중 (공동구매 첫 상태)
CONFIRMED   — 주문 확정 (공동구매 최소 인원 달성)
ACCEPTED    — 결제 완료 (일반 판매 첫 상태)
PREPARING   — 상품 준비 중
DELIVERING  — 배송 중
HUB_ARRIVED — 거점 도착 (거점 픽업 전용)
PICKED_UP   — 픽업 완료 (거점 픽업 전용)
DELIVERED   — 배송 완료 (직배송·택배)
REVIEWED    — 구매 확정
CANCELLED   — 주문 취소
```

---

## 다음 세션 Todo

### 3단계 잔여 (LOW)
- [ ] PWA A2HS 버튼 — `mypage/page.tsx` 미설치 시 "홈 화면에 추가" 버튼
- [ ] 환불 계좌 수정 — `mypage/refund-account/page.tsx` 신규
- [ ] 카드 간편결제 — `mypage/card-payment/page.tsx` 신규

### 4단계 실제 개발
- [ ] Next.js 15 프로젝트 셋업 (greenhub monorepo 연동)
- [ ] NextAuth.js — 카카오·네이버·이메일 Provider
- [ ] Firestore 연동 — 실시간 주문 상태 리스너
- [ ] Portone SDK — 카카오페이·네이버페이·카드 결제
- [ ] 카카오 알림톡 — 알리고 또는 솔라피 API
- [ ] `order.entity.ts` 재작성 — PENDING 포함 전체 상태 반영

---

## 핵심 기술 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 공동구매 배송 | 판매자 지정 고정 (소비자 선택 불가) | 단체 배송 일정 통일 필요 |
| 거점 픽업 인증 | 픽업 코드 6자리 (QR은 Phase 2) | MVP 인력 부족 대응 |
| isGroupBuy 판별 | sessionStorage + useEffect | SSR에서 window 미접근 문제 해결 |
| 결제 수단 | 카카오페이·네이버페이·신용체크카드 (3종) | 설계 문서 확정 |
| 실시간 DB | Firestore (WebSocket·Redis 불필요) | 주문 상태·참여인원·Daily Cap 통합 |

---

## 설계 문서 경로

| 문서 | 경로 |
|------|------|
| 1단계 요구사항 | `docs/소비자 설계 - 1단계 요구사항 정의.md` |
| 2단계 IA (소비자) | `docs/소비자 설계 - 2단계 정보 구조 설계(IA).md` |
| 2단계 전체 설계 | `docs/PWA_설계_문서.md` |
| 배송 구조 확정 | `docs/배송 관련 추가 검토사항.md` |
| 와이어프레임 | `Wireframe/` |
| 설계 결정 이력 | `docs/CRITICAL_LOGIC.md` (추후 생성) |
