# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-26 (apps/api NestJS 서버 전체 모듈 구현 완료)

---

## 현재 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 요구사항 정의 | ✅ 완료 |
| 2단계 | 정보 구조 설계 (IA) | ✅ 완료 |
| 3단계 | 화면 설계 (Wireframe) | ✅ 완료 |
| 4단계 | API 계약 + 실제 개발 | 🔄 진행 중 (apps/api 완료, apps/consumer 미시작) |

---

## apps/api 구현 완료 내역 (2026-03-26)

| 모듈 | 주요 기능 | 커밋 |
|------|----------|------|
| FirestoreModule | Global, Admin SDK 초기화, 트랜잭션 헬퍼 | a90074d |
| AuthModule | register/login(bcrypt), JWT, 배송지 CRUD, FCM 토큰 | a90074d |
| ProductsModule | 상품 CRUD, deliveryConfig, groupProductConfig | 4849b54 |
| OrdersModule | 주문생성(Daily Cap 트랜잭션), FSM 전환, 취소, 픽업 | 4849b54 |
| PaymentsModule | Portone webhook, 금액검증, 환불 API | 4849b54 |
| NotificationsModule | 알리고 알림톡, 3개 스케줄러(PENDING타임아웃·공동구매·마감알림) | 4849b54 |

---

## 다음 세션 최우선 작업

**apps/consumer — Next.js 15 PWA 셋업**

```
Step 1 — Next.js 15 스캐폴딩 (apps/consumer)
  pnpm dlx create-next-app@latest . (apps/consumer 내에서)
  옵션: TypeScript, Tailwind CSS, App Router, src/ 디렉토리

Step 2 — PWA 기반 구성
  next-pwa 또는 @ducanh2912/next-pwa
  manifest.json, service-worker, A2HS 버튼 (mypage)

Step 3 — NextAuth.js v5
  카카오·네이버 OAuth Provider
  Credentials Provider (이메일, NestJS JWT 연동)
  세션에 accessToken 저장

Step 4 — Firestore 실시간 리스너
  주문 상태, 공동구매 참여 인원, Daily Cap

Step 5 — 결제 플로우
  Portone SDK v2 (아임포트)
  POST /stores/:storeId/orders → Portone 결제창 → webhook 대기
```

---

## 미완료 (LOW — 3단계 잔여)

- [ ] PWA A2HS 버튼 — `mypage/page.tsx`
- [ ] 환불 계좌 수정 — `mypage/refund-account/page.tsx`
- [ ] 카드 간편결제 — `mypage/card-payment/page.tsx`

---

## 환경변수 준비 사항

| 항목 | 시점 |
|------|------|
| Portone 가맹점 식별코드 + API Key/Secret | apps/consumer Step 5 전 |
| 알리고 API Key + 발신번호 + 채널 발신 프로필 키 | 알림 기능 테스트 전 |
| 카카오·네이버 OAuth Client ID/Secret | apps/consumer Step 3 전 |

---

## 아키텍처 확정

- **백엔드**: NestJS Layered (apps/api) — Railway 배포, `C:\Develop\greenhub\apps\api`
- **프론트**: Next.js 15 (apps/consumer) — Vercel 배포
- **실시간**: Firestore 직접 리스너
- **구조**: pnpm 모노레포 `C:\Develop\greenhub`
