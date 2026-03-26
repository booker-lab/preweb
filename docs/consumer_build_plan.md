# apps/consumer 빌드 플랜
> 작성일: 2026-03-26 | 상태: 착수 전

---

## 현재 확정된 키 & 환경변수

### 포트원 (준비 완료)
```env
# apps/api/.env
PORTONE_API_KEY=imp56354122
PORTONE_API_SECRET=qF2Y80J76TPZaj1SmKQdpdp2bmQT0hdzm3kKimwtwdVRYkxhffJuSQ7eqhufRqDTleV1G4uVru5qVpeb

# apps/consumer/.env.local
NEXT_PUBLIC_PORTONE_STORE_ID=store-0ab5cf00-f559-43af-a914-cc14bcdf3897
NEXT_PUBLIC_PORTONE_KAKAOPAY_CHANNEL_KEY=channel-key-ae182d30-7754-4d66-9d49-99c849f2b4ad
NEXT_PUBLIC_PORTONE_NAVERPAY_CHANNEL_KEY=   ← 네이버페이 파트너 가입 후 등록
```

### 미발급 (Step별 시점에 등록)
```env
# apps/consumer/.env.local
NEXTAUTH_SECRET=          ← openssl rand -base64 32 으로 생성
NEXTAUTH_URL=http://localhost:3000

KAKAO_CLIENT_ID=          ← Kakao Developers 앱 등록 후
KAKAO_CLIENT_SECRET=      ← 동일

NAVER_CLIENT_ID=          ← Naver Developers 앱 등록 후
NAVER_CLIENT_SECRET=      ← 동일

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=green-e4fe3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 화면 구조 (IA 기반)

### 하단 탭 5개
| 탭 | 경로 | 주요 컴포넌트 |
|----|------|--------------|
| 홈 | `/` | 큐레이션 배너, 인기상품, 이벤트 배너 |
| 카테고리 | `/category` | 대/중/소분류, 색상 필터 |
| 검색 | `/search` | 키워드 검색 |
| 장바구니 | `/cart` | 상품 목록, 수량 조절 |
| 마이페이지 | `/mypage` | 내 정보, 주문내역, A2HS 버튼 |

### 서브 화면
| 화면 | 경로 |
|------|------|
| 로그인 | `/login` |
| 상품 상세 | `/products/[id]` |
| 결제 | `/checkout` |
| 주문 완료 | `/order/success` |
| 주문 현황 | `/mypage/orders/[id]` |
| 배송지 관리 | `/mypage/addresses` |
| 환불 계좌 | `/mypage/refund-account` |

---

## 작업 순서

### ✅ Step 0 — 사전 준비 (지금)
- [ ] Firebase 콘솔 → 프로젝트 설정 → 웹 앱 → 클라이언트 SDK 키 복사
- [ ] `apps/consumer/.env.local` 파일 생성 (위 템플릿 기반)

### 🔲 Step 1 — Next.js 15 스캐폴딩
```bash
cd C:/Develop/greenhub/apps/consumer
pnpm dlx create-next-app@latest .
# TypeScript ✅ / Tailwind CSS ✅ / App Router ✅ / src/ 디렉토리 ✅

pnpm add next-auth@beta firebase @portone/browser-sdk
pnpm add @greenhub/shared@workspace:*
```
결과물:
- `src/app/` 라우팅 구조 생성
- `packages/shared` 타입 import 확인

### 🔲 Step 2 — PWA 기반 구성
```bash
pnpm add @ducanh2912/next-pwa
```
- `next.config.ts` → withPWA 래핑
- `public/manifest.json` (name: Green Hub, theme_color: #2D6A4F)
- `src/app/layout.tsx` → viewport meta 추가
- `src/app/mypage/page.tsx` → A2HS(홈화면 추가) 버튼

### 🔲 Step 3 — NextAuth.js v5 인증
구성 파일:
- `src/auth.ts` — NextAuth 설정
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/middleware.ts` — 보호 라우트

Provider 순서:
1. **Credentials** (이메일/비밀번호 → `POST /auth/login`) — 키 없이 먼저 구현
2. **카카오 OAuth** — KAKAO_CLIENT_ID 발급 후 추가
3. **네이버 OAuth** — NAVER_CLIENT_ID 발급 후 추가

세션에 accessToken 포함:
```ts
session.user.accessToken  // API 요청 시 Authorization: Bearer 헤더
```

⚠️ **카카오 Developers 앱 등록 필요** (Step 3 카카오 Provider 전)
- developers.kakao.com → 앱 추가 → 카카오 로그인 활성화
- Redirect URI: `http://localhost:3000/api/auth/callback/kakao`

### 🔲 Step 4 — Firestore 실시간 리스너
```bash
# firebase는 Step 1에서 이미 설치됨
```
- `src/lib/firebase.ts` — 클라이언트 SDK 초기화
- `src/hooks/useOrderStatus.ts` — `orders/{orderId}` 구독
- `src/hooks/useGroupProduct.ts` — `groupProductConfig/{productId}` 구독
- `src/hooks/useDailyCap.ts` — `dailyCaps/{storeId_date}` 구독

### 🔲 Step 5 — 결제 플로우 (Portone SDK v2)
흐름:
```
POST /stores/:storeId/orders
  → portonePaymentParams 수신
  → PortOne.requestPayment() 결제창 오픈
  → Firestore orders.status 변경 감지
  → 완료 화면 이동
```
⚠️ 카카오페이 채널 키 이미 준비됨 → 바로 구현 가능
⚠️ 네이버페이는 파트너 가입 후 채널 키 등록 후 추가

---

## API 베이스 URL
```env
# apps/consumer/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001   # 개발
# NEXT_PUBLIC_API_URL=https://xxx.railway.app  # 배포 후
```

---

## 미결 사항 (블로커)

| 항목 | 필요 시점 | 상태 |
|------|----------|------|
| Firebase 클라이언트 SDK 키 | Step 1 ENV 세팅 | 🔜 콘솔에서 복사 필요 |
| 카카오 OAuth Client ID/Secret | Step 3 | ⏸ Kakao Developers 앱 등록 |
| 네이버 OAuth Client ID/Secret | Step 3 | ⏸ Naver Developers 앱 등록 |
| 포트원 네이버페이 채널 키 | Step 5 | ⏸ 파트너 가입 후 |
