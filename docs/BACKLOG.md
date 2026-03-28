# Green Hub — 앞으로 할 작업 백로그

> 기준일: 2026-03-28 (8차 정합성 검토 + C-1~C-3 수정 + /products 폼 + C-2·C-3 API 완료 시점)
> 완료 작업 전체 이력은 `CRITICAL_LOGIC.md`, `memory.md` 참조

---

## 우선순위 요약

| 순위 | 항목 | 범주 |
|------|------|------|
| ✅ | 소비자 앱 E2E 테스트 (카카오페이 결제 → seller 앱 처리) | 테스트 |
| ✅ | 소비자 앱 Phase B — `/mypage` 주문 목록 + 타임라인 | consumer 앱 |
| ⭐ 1 | `/admin/*` 관리자 영역 5개 페이지 | seller 앱 |
| 🟡 2 | Phase B 나머지 — 배송지 관리, 알림 내역 | consumer 앱 |
| 🟡 3 | 네이버페이 파트너 가입 (도메인 확정 후) | 외부 연동 |
| 💡 6 | 카드 결제 PG사 계약 | 외부 연동 |
| 🔵 7 | 다중 판매자 상점 페이지 (소비자 앱) | Phase 2 |

---

## 1. seller 앱 (`apps/seller`)

> 설계 문서: `docs/판매자 설계 - 1단계 요구사항 정의.md`, `docs/판매자 설계 - 2단계 IA.md`
> 배포: Vercel (Root Directory: `apps/seller`)

### 1-1. 인프라 / 공통

- [x] `apps/seller` Next.js 16 스캐폴딩 + pnpm workspace 등록
- [x] `@greenhub/shared` 의존성 연결
- [x] NextAuth.js v5 — 이메일 + 카카오 Provider, `role: 'seller'`
- [x] PWA — manifest.json, Service Worker
- [x] Tailwind CSS + 하단 탭 5개 (`BottomNav.tsx`)
- [x] `proxy.ts` — 미로그인→/login, storeId 없음→/onboarding
- [x] `src/lib/api.ts` — `apiFetch` 헬퍼 (Bearer 토큰 자동 주입)
- [x] `src/lib/firebase.ts` — Firestore + Storage export

### 1-2. 인증 / 온보딩

- [x] `/login` — 이메일 + 카카오 OAuth
- [x] `/onboarding` — 신규 seller `POST /stores` 생성 + session.update storeId 반영
- [ ] Firebase Storage 로고 업로드 → `logoUrl` 저장 (선택)

### 1-3. 주문 관리 (`/orders`)

- [x] Firestore 실시간 리스너 기반 주문 목록
- [x] 상태별 탭 5종 + 배지
- [x] 주문 카드 — 결제금액, 배송수단, 주문시각
- [x] `/orders/[id]` 주문 상세
  - 상품·수량·금액·배송 정보 표시
  - "준비 시작" 버튼 (preparedAt datetime 입력) → `PATCH .../status { PREPARING }`
  - **"배송 시작" 버튼** (PREPARING → DELIVERING) ✅ 2026-03-28 추가
  - "강제 취소" 모달 (사유 최소 5자) → `PATCH .../status { CANCELLED }`
  - 읽기 전용 상태 (배송 중 이후)

### 1-4. 상품 관리 (`/products`)

- [x] 상품 목록 — Firestore 실시간 리스너
- [x] 활성/비활성 토글
- [x] `/products/new` 상품 등록 폼
  - 이미지 최대 5장 (Firebase Storage 업로드, 대표사진 뱃지, 순서 번호)
  - 상품명·카테고리·색상(멀티)·배송사이즈·가격·상세설명
  - 판매 방식 라디오 (일반/공동구매) + 공동구매 전용 필드 슬라이드 다운
  - 헤더 우측 임시저장 버튼 (localStorage)
- [x] `/products/[id]/edit` 상품 수정
  - `GET /stores/:storeId/products/:id` 로드 후 폼 pre-fill
  - Firestore Timestamp → YYYY-MM-DD 변환
- [ ] 상품 삭제 버튼 (`DELETE /stores/:storeId/products/:id`)

### 1-5. 정산 관리 (`/settlements`)

- [x] 일별 요약 탭 — `GET .../settlements/summary?date=`
- [x] 기간별 조회 탭 — `GET .../settlements?from=&to=`
- [x] 주문별 상세 탭
- [ ] (Should Have) CSV 다운로드

### 1-6. 거점 관리 (`/hubs`)

- [x] 거점 목록 — `GET /stores/:storeId/hubs`
- [x] 활성/비활성 토글 — `PATCH .../hubs/:hubId`
- [x] 삭제 — `DELETE .../hubs/:hubId`
- [x] `/hubs/new` 거점 등록 폼 — `POST .../hubs`
- [x] **`/hubs/[id]` 거점 상세**
  - 거점 정보 (이름·주소·운영시간)
  - 픽업 대기 주문 목록 (`status: HUB_ARRIVED`, `hubId` 필터)
  - 주문 행 클릭 → `/hubs/[id]/pickup?orderId=` 자동 전달
- [x] **`/hubs/[id]/pickup` 픽업 코드 확인**
  - orderId 쿼리 파라미터 수신
  - 6자리 분리 입력 UI (붙여넣기 지원)
  - `PATCH .../orders/:orderId/hub-confirm { pickupCode }` (seller JWT)
  - 성공 시 PICKED_UP 전환 + 완료 피드백 화면

### 1-7. 설정 (`/settings`)

- [x] `/settings` 메뉴 페이지
- [x] `/settings/delivery` — 배송비 6개 필드 + 기상 제한 토글
- [x] `/settings/daily-caps` — 달력 UI + 날짜별 슬롯 수정

### 1-8. 관리자 영역 (`/admin/*`) — Phase 2

> B안: seller 앱 내 `/admin` 경로. 규모 확장 시 `apps/admin` 분리(A안).

- [ ] `/admin/stores` — 판매자 목록 + 초대 토큰 발급 + 승인
- [ ] `/admin/users` — 소비자 계정 조회·정지·복구
- [ ] `/admin/orders` — 전체 주문 조회·환불 강제 처리
- [ ] `/admin/settlements` — 판매자별 정산 처리 (이체 완료)
- [ ] `/admin/invite` — 초대 토큰 발급

### 1-9. 거점 스태프 권한 구조 — Phase 2 (운영 거점 계약 확정 후)

> **MVP 결정**: seller가 직접 `/hubs/[id]/pickup`에서 코드 입력 확인 (패턴 C)
> **Phase 2 트리거**: 협력 업체(꽃집·과일가게 등) 계약 확정 시
> 설계 결정 상세: `CRITICAL_LOGIC.md` §2026-03-28 거점 픽업 확인 방식

- [ ] `users.role: 'hub_staff'` 신규 역할 추가
- [ ] `hubs.staffIds: string[]` 관계 필드 + Firestore 스키마 반영
- [ ] seller 앱 스태프 초대 링크 발급 UI (`/hubs/[id]/settings`)
- [ ] API: `hub_staff` JWT 처리 + hubId 스코핑 미들웨어
- [ ] hub_staff 전용 온보딩 플로우 (seller 앱 내 분기)
- [ ] `/admin` 영역 구축 시 함께 설계 (§1-8과 병행)

---

## 2. API (`apps/api`)

### 완료된 모든 엔드포인트

- [x] auth 모듈 (Firebase ID token 검증 → JWT 발급)
- [x] stores — `PATCH /stores/:storeId` (온보딩 + active 전환)
- [x] products — `GET/POST/PATCH/DELETE /stores/:storeId/products`
- [x] products — daily-caps, delivery-config CRUD
- [x] orders — `POST/GET/PATCH /stores/:storeId/orders`
- [x] orders — `status`, `cancel`, `review`, `pickup-confirm`
- [x] settlements — `GET .../settlements`, `GET .../settlements/summary`
- [x] hubs — `GET/POST/PATCH/DELETE /stores/:storeId/hubs`
- [x] **`GET /stores/:storeId/hubs/:hubId/orders?status=` (C-2 완료)**
- [x] notifications 모듈

### 8차 정합성 검토 수정 사항 (이번 세션)

- [x] **C-1**: `SELLER_TRANSITIONS` DELIVERING·HUB_ARRIVED 취소 허용 제거
- [x] **C-1**: `getAllowedTransitions` 화이트리스트 방식으로 교체 (`ACCEPTED·CONFIRMED·PREPARING`만)
- [x] **C-3**: `CreateOrderDto.hubId?: string` + hub 배송 시 필수 검증
- [x] **C-3**: `createOrder` — 주문 문서에 `hubId` 저장
- [x] **shared**: `Order.hubId: string | null`, `CreateOrderRequest.hubId?: string` 추가

### 이번 세션 추가 완료

- [x] **hub-confirm**: `PATCH /stores/:storeId/orders/:orderId/hub-confirm` — seller JWT + pickupCode 검증 → PICKED_UP
- [x] **POST /stores**: 신규 seller 스토어 생성 + user.storeId 업데이트 (2026-03-28)

### 미구현 API

- [ ] settlements 취소 반영 — 주문 CANCELLED 시 `status: 'cancelled'` 업데이트
- [ ] 관리자 API (`/admin/*`) — stores·users·orders·settlements CRUD

---

## 3. 소비자 앱 Phase B (`apps/consumer`)

### 마이페이지 서브 화면

- [x] `/mypage` 주문 목록 + 프로필 (2026-03-29)
- [x] `/mypage/orders/[id]` — 상태 타임라인 + 픽업 코드 + 구매 확정 버튼 (2026-03-29)
- [ ] 배송지 관리 (`/mypage/addresses`) — 저장 배송지 CRUD
- [ ] 알림 내역 (`/mypage/notifications`) — `GET /notifications/me`

### 상품 화면 보완 (Should Have)

- [ ] 상품 상세 하단 판매자 정보 노출 (상호명·로고·연락처)

---

## 4. 외부 연동

### 4-1. 네이버페이

- [ ] Vercel URL 제출 후 파트너 가입
- [ ] 채널키 발급 → `PORTONE_NAVER_CHANNEL_KEY` 환경변수
- [ ] 소비자 앱 네이버페이 버튼 활성화

### 4-2. 카드 결제 (MVP 완료 후)

- [ ] Portone + KG이니시스 또는 NHN KCP 계약 신청

---

## 5. 인프라 · 배포

### 5-1. Firebase 인덱스 배포

- [x] settlements·hubs 인덱스 4개 배포 완료
- [x] `orders storeId+createdAt DESC` 인덱스 추가 (2026-03-28)

### 5-2. Vercel seller 배포

- [x] `greenhub-seller.vercel.app` 배포 완료 (2026-03-28)
- [x] Railway `CORS_ORIGIN`에 seller URL 추가

### 5-3. Railway API 재배포

- [x] C-1·C-2·C-3 + hub-confirm + POST /stores 반영 완료 (2026-03-28)

---

## 6. 다중 판매자 확장 — Phase 2 (`apps/consumer` + `apps/api`)

> MVP는 단일 판매자(dear-orchid) 하드코딩 구조. 다중 판매자 등록 시 아래 작업으로 확장.

### 6-1. API 추가

- [ ] `GET /stores` — active 상점 목록 (이름·로고·주소·카테고리 요약)
- [ ] `GET /stores/:storeId` — 상점 상세 + 해당 상점 상품 목록

### 6-2. 소비자 앱 화면 추가

- [ ] `app/stores/page.tsx` — 상점 목록 (카드 그리드: 로고·상호명·거점 수·판매 상품 수)
- [ ] `app/stores/[storeId]/page.tsx` — 상점 상세 (프로필 + 판매 상품 + 운영 거점 목록)
- [ ] 홈 화면 하드코딩 `STORE_ID = 'dear-orchid'` → 동적 `storeId` 처리로 전환

### 6-3. 판매자 앱 연동 포인트

> **추가 개발 불필요** — 판매자 온보딩 시 입력한 `name·address·phone·logoUrl`이 이미 Firestore `stores` 컬렉션에 저장됨.

---

## 7. 보류 / 장기 과제

| 항목 | 내용 | 시점 |
|------|------|------|
| 드라이버 앱 | `apps/driver` 스캐폴딩 | seller 앱 완료 후 |
| **거점 배송 오픈** | 아래 §8 참조 | **운영 거점 계약 확정 시** |
| 다중 판매자 Phase 2 | 판매자 자체 가입 → 플랫폼 승인 플로우 | 비즈니스 요청 시 |
| 카카오 알림톡 정식 등록 | 템플릿 심사 (~1~3 영업일) | 실제 사용자 서비스 전 |
| PWA 푸시 (FCM) | firebase-messaging-sw.js | seller 완료 후 |
| 밀크런 경로 프리뷰 | Kakao Maps API — 거점 순회 경로 시각화 | Should Have |
| 리뷰·평점 시스템 | Nice to Have | Phase 2 |

---

## 8. 거점 배송 오픈 — 협력 업체 계약 확정 시

> **현재 상태**: 코드·FSM·API 모두 구현 완료. 소비자 앱에서 UI만 비노출 중.
> **오픈 조건**: 운영 거점(협력 업체 — 꽃집·과일가게 등) 계약 확정 시 즉시 활성화 가능.

### 이미 완료된 것 (추가 개발 불필요)

- `deliveryMethod: 'hub'`, `hubId` 타입·스키마·API 전체
- 주문 상태 `HUB_ARRIVED` · `PICKED_UP` FSM
- `pickupCode` 6자리 발급·저장·확인 (`PATCH .../pickup-confirm`)
- `GET /stores/:storeId/hubs/:hubId/orders?status=HUB_ARRIVED` API
- seller 앱 거점 CRUD (`/hubs`, `/hubs/new`)
- 알림톡 발송 트리거 (`DELIVERING → HUB_ARRIVED` 시 픽업 코드 안내)

### 오픈 시 필요한 작업 (최소 수준)

- [ ] 협력 업체를 seller 앱 `/hubs`에서 거점으로 등록
- [ ] 소비자 앱 배송 수단 선택 화면에서 `hub` 옵션 노출 조건 해제
- [x] seller 앱 `/hubs/[id]` 거점 상세 + `/hubs/[id]/pickup` 픽업 코드 확인 화면 구현

### Phase 2 고도화 (계약 후 운영 안정화 시점)

- [ ] QR 스캔 기반 픽업 인증 (현재 6자리 코드 수동 입력 방식)
- [ ] 지도 기반 실시간 위치 추적 (현재 타임라인 피드 방식)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-28 | 초안 작성 |
| 2026-03-28 | seller 앱 스캐폴딩 + Firestore 연동 완료 체크 |
| 2026-03-28 | stores·settlements·hubs API + seller 앱 핵심 화면 완료 체크 / 7차 정합성 검토 반영 |
| 2026-03-28 | 다중 판매자 §6 추가, 거점 배송 §8 추가 |
| 2026-03-28 | **8차 정합성 검토**: C-1~C-3 수정 완료, /products 폼 구현 완료, 우선순위 재정비 |
| 2026-03-28 | **배포 완료**: Vercel seller + Railway + Firebase 인덱스 / seller 온보딩 버그 수정 / E2E 동작 확인 |
