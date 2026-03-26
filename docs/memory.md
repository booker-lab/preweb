# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-26 (apps/consumer Step 1~5 완료)

---

## 현재 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 요구사항 정의 | ✅ 완료 |
| 2단계 | 정보 구조 설계 (IA) | ✅ 완료 |
| 3단계 | 화면 설계 (Wireframe) | ✅ 완료 |
| 4단계 | API 계약 + 실제 개발 | ✅ 완료 (apps/api + apps/consumer 전체) |

---

## apps/consumer 완료 상태

| Step | 내용 | 상태 |
|------|------|------|
| Step 1 | Next.js 16.2.1 스캐폴딩 + 의존성 설치 | ✅ |
| Step 2 | PWA (manifest, withPWA, sw.js, A2HS 버튼) | ✅ |
| Step 3 | NextAuth.js v5 Credentials Provider + 로그인 UI | ✅ |
| Step 4 | Firestore 실시간 리스너 훅 | ✅ |
| Step 5 | 포트원 카카오페이 결제 플로우 | ✅ |

### 주요 파일 구조
```
apps/consumer/src/
├── auth.ts                          NextAuth v5 설정 (Credentials)
├── proxy.ts                         보호 라우트 미들웨어
├── lib/
│   ├── api.ts                       Bearer 토큰 자동 삽입 API 클라이언트
│   └── firebase.ts                  Firebase 클라이언트 SDK 초기화
├── hooks/
│   ├── useOrderStatus.ts            orders/{orderId} 실시간 구독
│   ├── useGroupProduct.ts           groupProductConfig/{productId} 실시간 구독
│   ├── useDailyCap.ts               dailyCaps/{storeId_date} 실시간 구독
│   └── usePayment.ts                주문 생성 + Portone v2 결제창 오픈
├── types/next-auth.d.ts             세션 타입 확장
├── app/
│   ├── layout.tsx                   PWA 메타 + theme_color
│   ├── login/page.tsx               이메일 로그인 UI
│   ├── mypage/page.tsx              A2HS 버튼 포함
│   ├── checkout/page.tsx            결제 화면 (주소 입력 + 카카오페이)
│   ├── order/success/page.tsx       완료 화면 (Firestore 실시간 상태)
│   └── api/auth/[...nextauth]/      NextAuth 라우트 핸들러
└── components/A2HSButton.tsx        홈화면 추가 버튼
```

### 기술 특이사항
- Next.js 16 기본이 Turbopack → `@ducanh2912/next-pwa` 충돌 → **`--webpack` 플래그 필수**
- dev/build 스크립트: `next dev --webpack` / `next build --webpack`
- proxy.ts (구 middleware.ts) — Next.js 16 파일명 변경
- 모노레포에서 패키지 설치 시 **루트에서** `pnpm --filter consumer` 사용

---

## 다음 세션 최우선: 통합 테스트 및 Vercel/Railway 배포 준비

**백로그 잔여**: W-5 Kakao/Naver OAuth (키 발급 후 주석 해제만 필요)
**참조**: `docs/CRITICAL_LOGIC.md`

---

## 포트원 준비 현황

| 채널 | 상태 |
|------|------|
| 카카오페이 (테스트) | ✅ 채널 키 발급 완료 |
| 네이버페이 (테스트) | ⏸ Vercel 배포 후 파트너 가입 |
| 카드 (토스페이먼츠) | ⏸ MVP 완료 후 |

---

## 환경변수 현황

| 항목 | 상태 |
|------|------|
| NEXTAUTH_SECRET | ✅ `.env.local` 등록 완료 |
| Firebase 클라이언트 SDK 키 | ✅ `.env.local` 등록 완료 |
| 포트원 Store ID + 카카오 채널 키 | ✅ `.env.local` 등록 완료 |
| 카카오 OAuth Client ID/Secret | ⏸ Kakao Developers 앱 등록 후 |
| 네이버 OAuth Client ID/Secret | ⏸ Naver Developers 앱 등록 후 |

---

## 아키텍처 확정

| 항목 | 내용 |
|------|------|
| 백엔드 | NestJS · `C:\Develop\greenhub\apps\api` · Railway 배포 |
| 프론트 | Next.js 16 · `C:\Develop\greenhub\apps\consumer` · Vercel 배포 |
| 실시간 | Firestore 직접 리스너 |
| 인증 | NextAuth.js v5 (프론트) + JwtAuthGuard (API) |
| Firebase | green-e4fe3 · asia-northeast3 |
| 로컬 실행 | `C:\Develop\greenhub\dev-consumer.bat` 더블클릭 → 브라우저 자동 오픈 |
