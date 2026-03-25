# Auth Domain Spec

> **작성일**: 2026-03-26
> **상태**: Draft (4단계 개발 선행 문서)
> **연관 문서**: `orders.md`, `payments.md`, `1단계 요구사항 정의.md`

---

## 1. 도메인 개요

인증은 **NextAuth.js (Next.js 앱 레이어)** 와 **NestJS JWT Guard (API 레이어)** 두 계층으로 구성된다.

| 레이어 | 담당 | 기술 |
|--------|------|------|
| Next.js 앱 | 세션 관리, 로그인 UI, 소셜 OAuth 흐름 | NextAuth.js v5 |
| NestJS API | API 요청 인증·권한 검증 | JWT Bearer Guard |

**비회원 구매 미지원** — 모든 주문은 로그인 필수.

---

## 2. 로그인 Provider

| Provider | 타입 | 비고 |
|----------|------|------|
| 카카오 | OAuth 2.0 | Kakao Developers 앱 등록 필요 |
| 네이버 | OAuth 2.0 | Naver Developers 앱 등록 필요 |
| 이메일 | Credentials | 이메일 + 비밀번호, bcrypt 해시 저장 |

---

## 3. 역할(Role) 시스템

```ts
type UserRole = 'consumer' | 'seller' | 'driver'
```

| 역할 | 대상 | 추가 클레임 |
|------|------|------------|
| `consumer` | 소비자 앱 사용자 | - |
| `seller` | 판매자 (디어 오키드) | `storeId` |
| `driver` | 배송기사 | - |

JWT 페이로드 구조:
```ts
{
  sub: string      // userId
  role: UserRole
  storeId?: string // seller 전용
  iat: number
  exp: number
}
```

---

## 4. Firestore 컬렉션 스키마

### `users/{userId}`

```ts
{
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole

  // 판매자 전용
  storeId: string | null

  // 소셜 로그인 연결 정보
  providers: ('kakao' | 'naver' | 'email')[]

  // 소비자 전용
  savedAddresses: {
    id: string
    label: string          // '집', '회사' 등
    address: string
    addressDetail: string
    zipCode: string
    isDefault: boolean
  }[]

  // PWA
  fcmToken: string | null  // FCM 푸시 토큰 (브라우저 푸시)

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 5. 인증 플로우

### 5-1. 소셜 로그인 (카카오·네이버)

```
1. 소비자 앱 로그인 버튼 클릭
2. NextAuth.js → OAuth Provider 리다이렉트
3. Provider 인증 완료 → NextAuth.js callback
4. users/{userId} 조회
   - 없으면 신규 생성 (role: 'consumer' 기본값)
   - 있으면 providers 배열 업데이트
5. NextAuth.js 세션 생성 + JWT 발급
6. 원래 진입하려던 화면으로 복귀 (callbackUrl)
```

### 5-2. 이메일 로그인

```
1. 이메일 + 비밀번호 입력
2. NestJS POST /auth/login → bcrypt.compare 검증
3. 검증 성공 → JWT 반환
4. NextAuth.js Credentials Provider가 JWT를 세션에 저장
```

### 5-3. NestJS API 요청 인증

```
1. Next.js 앱: NextAuth.js 세션에서 accessToken 추출
2. NestJS API 요청 헤더: Authorization: Bearer <accessToken>
3. NestJS JwtAuthGuard: JWT 검증 + 페이로드 추출
4. RolesGuard: 요청 역할 검증
5. 통과 → 컨트롤러 실행 / 실패 → 401 or 403
```

### 5-4. 로그인 진입 시점 (소비자 앱)

```
진입 시점 A: 미로그인 상태에서 '결제하기' 클릭
진입 시점 B: 미로그인 상태에서 '마이페이지' 탭 클릭

처리:
  → 로그인 화면 이동
  → 로그인 완료 후 원래 화면으로 복귀 (callbackUrl 유지)
```

---

## 6. API 엔드포인트

### 회원가입 (이메일)

```
POST /auth/register
```

```ts
// Request
{
  email: string
  password: string    // 8자 이상, 클라이언트 검증
  name: string
  phone?: string
}

// Response 201
{ userId: string }
```

---

### 로그인 (이메일 — Credentials Provider 내부 호출)

```
POST /auth/login
```

```ts
// Request
{ email: string, password: string }

// Response 200
{ accessToken: string, user: UserProfile }

// Response 401
{ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
```

---

### 토큰 갱신

```
POST /auth/refresh
```

> NextAuth.js가 내부적으로 처리. 클라이언트에서 직접 호출 불필요.

---

### 내 프로필 조회

```
GET /auth/me
```

**Guard**: `JwtAuthGuard`

```ts
// Response 200
{
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  storeId: string | null
  providers: string[]
  savedAddresses: SavedAddress[]
}
```

---

### 프로필 수정

```
PATCH /auth/me
```

```ts
// Request (Partial)
{
  name?: string
  phone?: string
}
```

---

### 배송지 관리

```
POST   /auth/me/addresses           // 배송지 추가
PATCH  /auth/me/addresses/:id       // 수정
DELETE /auth/me/addresses/:id       // 삭제
PATCH  /auth/me/addresses/:id/default  // 기본 배송지 설정
```

---

### FCM 토큰 등록

```
PATCH /auth/me/fcm-token
```

```ts
{ fcmToken: string }
```

> PWA 푸시 알림 수신을 위해 브라우저 푸시 권한 획득 후 호출.

---

## 7. 역할별 API 접근 제어

| 엔드포인트 | consumer | seller | driver | 비고 |
|------------|----------|--------|--------|------|
| `GET /stores/:storeId/products` | ✅ | ✅ | ✅ | 공개 |
| `POST /stores/:storeId/products` | ❌ | ✅ | ❌ | 본인 storeId만 |
| `POST /stores/:storeId/orders` | ✅ | ❌ | ❌ | - |
| `GET /stores/:storeId/orders/:orderId` | ✅ | ✅ | ✅ | 본인 주문 or 본인 storeId |
| `PATCH /stores/:storeId/orders/:orderId/cancel` | ✅ | ❌ | ❌ | 본인 주문만 |
| `PATCH /stores/:storeId/orders/:orderId/status` | 일부 | ✅ | ✅ | 역할별 허용 전환 다름 (`orders.md` 섹션 4 참조) |
| `GET /stores/:storeId/daily-caps` | ❌ | ✅ | ❌ | - |
| `PATCH /stores/:storeId/delivery-config` | ❌ | ✅ | ❌ | - |

---

## 8. 보안 체크리스트

| 항목 | 처리 방식 |
|------|----------|
| 비밀번호 저장 | bcrypt (saltRounds: 12) |
| JWT 만료 | accessToken 1시간 / refreshToken 30일 |
| storeId 위조 | JWT 클레임 `storeId`와 경로 `:storeId` 일치 검증 (Guard) |
| 타인 주문 접근 | `userId` 클레임과 `orders.userId` 일치 검증 |
| 소셜 계정 연결 | 동일 이메일로 이미 존재하는 계정에 provider 추가 병합 |

---

## 9. packages/shared 공통 타입 (초안)

```ts
// packages/shared/src/auth.types.ts

export type UserRole = 'consumer' | 'seller' | 'driver'

export type AuthProvider = 'kakao' | 'naver' | 'email'

export interface JwtPayload {
  sub: string
  role: UserRole
  storeId?: string
  iat: number
  exp: number
}

export interface SavedAddress {
  id: string
  label: string
  address: string
  addressDetail: string
  zipCode: string
  isDefault: boolean
}

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  storeId: string | null
  providers: AuthProvider[]
  savedAddresses: SavedAddress[]
}
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-26 | 초안 작성 — PWA 설계 문서 + 1단계 요구사항 기반 통합 |
