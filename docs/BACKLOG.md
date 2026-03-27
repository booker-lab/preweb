# Green Hub — 앞으로 할 작업 백로그

> 기준일: 2026-03-28 (5차 정합성 검토 + seller 앱 1단계 설계 완료 시점)
> 완료 작업 전체 이력은 `CRITICAL_LOGIC.md`, `memory.md` 참조

---

## 우선순위 요약

| 순위 | 항목 | 범주 |
|------|------|------|
| ⭐ 1 | seller 앱 스캐폴딩 + 핵심 화면 구현 | 신규 앱 |
| ⭐ 2 | settlements · hubs NestJS 모듈 + spec | API 신규 |
| ⭐ 3 | 소비자 앱 Phase B (서브 화면) | 기존 앱 보완 |
| ⭐ 4 | 네이버페이 파트너 가입 | 외부 연동 |
| ⭐ 5 | Vercel seller 배포 | 인프라 |
| 💡 6 | 카드 결제 PG사 계약 | 외부 연동 |

---

## 1. seller 앱 스캐폴딩 (`apps/seller`)

> 설계 문서: `docs/판매자 설계 - 1단계 요구사항 정의.md`
> 기술 스택: Next.js (App Router) + NextAuth.js v5 + Tailwind CSS
> 배포: Vercel (별도 프로젝트, Root Directory: `apps/seller`)

### 1-1. 초기 스캐폴딩

- [ ] `apps/seller` Next.js 생성 + pnpm workspace 등록
- [ ] `@greenhub/shared` 의존성 연결
- [ ] NextAuth.js v5 설정 — 이메일 + 카카오 Provider, `role: 'seller'`
- [ ] PWA 설정 — manifest.json, Service Worker (소비자 앱과 동일 방식)
- [ ] Tailwind CSS + 공통 레이아웃 (사이드바 or 하단 탭 — 모바일 우선)
- [ ] `proxy.ts` (Next.js 16 middleware 파일명) — 미로그인 시 /login 리다이렉트

### 1-2. 판매자 온보딩

- [ ] 로그인 화면 (`/login`) — 이메일 + 카카오 OAuth
- [ ] 최초 로그인 후 사업자 프로필 설정 화면 (`/onboarding`)
  - 상호명, 사업자등록번호, 대표자명, 연락처, 소재지, 로고 이미지
  - Firebase Storage SDK로 로고 업로드 → URL 저장
  - `PATCH /stores/:storeId` API 호출 (신규 엔드포인트 — API 보완 필요)
- [ ] 프로필 미완성 시 모든 화면 접근 차단 (Guard)

### 1-3. 주문 관리 대시보드 (`/orders`) ← Must Have

- [ ] Firestore 실시간 리스너 기반 주문 목록
- [ ] 상태별 탭 필터 5종
  - **처리 필요** (ACCEPTED, CONFIRMED)
  - **준비 중** (PREPARING)
  - **배송 중** (DELIVERING, HUB_ARRIVED)
  - **완료** (DELIVERED, PICKED_UP, REVIEWED)
  - **취소** (CANCELLED)
- [ ] 상태 전환 버튼
  - "준비 시작" — ACCEPTED/CONFIRMED → PREPARING + `preparedAt` 시간 선택(선택)
  - "강제 취소" — 사유 입력 모달 → `PATCH .../status { status: 'CANCELLED', reason }`
- [ ] 주문 카드: 상품명, 소비자명, 결제금액, 배송수단, 주문시각

### 1-4. 상품 관리 (`/products`) ← Must Have

- [ ] 상품 목록 (`GET /stores/:storeId/products`)
- [ ] 상품 등록 폼 (`POST /stores/:storeId/products`)
  - 상품명, 가격, 카테고리, 색상(멀티), 배송사이즈
  - 판매방식 선택: 일반 / 공동구매
  - 공동구매 설정 필드 (조건부 노출): 최소·최대인원, 마감일, 배송예정일, 배송수단, 할인배송비
  - 이미지 업로드 — Firebase Storage SDK
- [ ] 상품 수정 · 활성/비활성 토글
- [ ] 상품 삭제

### 1-5. Daily Cap 관리 (`/daily-caps`) ← Must Have

- [ ] 달력 UI — 날짜별 잔여 슬롯 시각화
- [ ] 날짜 선택 → totalCap 수정 (`PATCH /stores/:storeId/daily-caps/:date`)
- [ ] `GET /stores/:storeId/daily-caps?from=&to=` 월별 조회

### 1-6. 배송 설정 (`/settings/delivery`) ← Must Have

- [ ] 배송수단별 기본 배송비 + 무료 기준 금액 수정
  - `PATCH /stores/:storeId/delivery-config`
- [ ] **기상 제한 On/Off 토글** — `weatherRestrictionActive`
  - 활성화 시 소비자 결제 화면 택배 자동 비활성

### 1-7. 정산/매출 관리 (`/settlements`) ← Must Have (API 신규 개발 필요)

- [ ] 일별 요약: 금일 완료 건수 · 총 매출 · 정산 예정액
- [ ] 기간별 조회: 달력 필터 → 합계 (총 매출 / 수수료 / 정산금)
- [ ] 주문별 상세: 상품가 + 배송비 - 수수료 = 정산금
- [ ] (Should Have) 기간별 CSV 다운로드

### 1-8. 거점(Hub) 관리 (`/hubs`) ← Must Have (API 신규 개발 필요)

- [ ] 거점 목록 · 등록 · 수정 · 삭제 (`hubs` 컬렉션 CRUD)
- [ ] 거점별 픽업 대기 주문 목록 (status: HUB_ARRIVED)
- [ ] 픽업 코드 확인 화면 — 6자리 수동 입력 또는 바코드 스캔

---

## 2. API 신규 모듈 (`apps/api`)

### 2-1. settlements 모듈 ← seller 앱 착수와 동시 진행

> spec: 스캐폴딩 착수 시 `docs/specs/settlements.md` 신규 작성

- [ ] `settlements` Firestore 컬렉션 스키마 확정
- [ ] 자동 생성 트리거: `orders.service.ts`에서 REVIEWED / DELIVERED / PICKED_UP 도달 시
  - `settlements` 레코드 생성 (status: 'confirmed')
  - 취소(CANCELLED) 시 `status: 'cancelled'` 즉시 반영
- [ ] API 엔드포인트
  - `GET /stores/:storeId/settlements?from=&to=` — 기간별 조회
  - `GET /stores/:storeId/settlements/summary?date=` — 일별 요약
- [ ] commissionRate 스냅샷 저장 (나중에 요율 변경돼도 정산금 불변)

### 2-2. hubs 모듈 ← seller 앱 착수와 동시 진행

> spec: 스캐폴딩 착수 시 `docs/specs/hubs.md` 신규 작성

- [ ] `hubs` Firestore 컬렉션 스키마 확정
- [ ] API 엔드포인트
  - `GET /stores/:storeId/hubs`
  - `POST /stores/:storeId/hubs`
  - `PATCH /stores/:storeId/hubs/:hubId`
  - `DELETE /stores/:storeId/hubs/:hubId`

### 2-3. stores 프로필 업데이트 엔드포인트

- [ ] `PATCH /stores/:storeId` — 판매자 온보딩 프로필 저장
  - businessNumber, ceoName, phone, address, logoUrl
  - Guard: JWT seller role + storeId 일치 검증

---

## 3. 소비자 앱 Phase B (`apps/consumer`)

> 현재 핵심 결제 흐름 완료. 보조 화면 미구현.

### 3-1. 마이페이지 서브 화면

- [ ] 주문 상세 (`/mypage/orders/[id]`) — 상태 타임라인 + 픽업 코드 표시
- [ ] 후기 작성 화면 — DELIVERED/PICKED_UP → REVIEWED 전환
- [ ] 배송지 관리 (`/mypage/addresses`) — 저장 배송지 CRUD
- [ ] 알림 내역 (`/mypage/notifications`) — `GET /notifications/me`

### 3-2. 상품 화면 보완 (Should Have)

- [ ] 상품 상세 하단 판매자 정보 노출 (`stores` 데이터 연동)
  - 상호명, 로고, 연락처 (logoUrl이 있을 때만)

---

## 4. 외부 연동

### 4-1. 네이버페이 파트너 가입

- [ ] Vercel URL (`https://greenhubconsumer.vercel.app`) 제출
- [ ] 파트너 가입 완료 후 채널키 발급 → Railway 환경변수 추가
- [ ] `PORTONE_NAVER_CHANNEL_KEY` 환경변수 설정
- [ ] 소비자 앱 네이버페이 버튼 활성화 (현재 주석 처리 상태 확인 필요)

### 4-2. 카드 결제 (MVP 완료 후)

- [ ] Portone 가입 + KG이니시스 또는 NHN KCP 계약 신청 (심사 2~5 영업일)
- [ ] 채널키 발급 → `pay_method: 'card'` 추가 (코드 변경 없음)

---

## 5. 인프라 · 배포

### 5-1. Vercel seller 배포

- [ ] Vercel 새 프로젝트 생성
- [ ] Root Directory: `apps/seller`
- [ ] `apps/seller/vercel.json` buildCommand: shared 빌드 선행 (소비자 앱과 동일 패턴)
- [ ] 환경변수: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `API_URL`, Firebase 설정
- [ ] CORS_ORIGIN에 seller Vercel URL 추가 (`Railway` 환경변수 업데이트)

---

## 6. 보류 / 장기 과제

| 항목 | 내용 | 시점 |
|------|------|------|
| 드라이버 앱 | `apps/driver` 스캐폴딩 | seller 앱 완료 후 |
| 다중 판매자 Phase 2 | 판매자 자체 가입 → 플랫폼 승인 플로우 | 비즈니스 요청 시 |
| 카카오 알림톡 정식 등록 | 템플릿 심사 (약 1~3 영업일) | 실제 사용자 서비스 전 |
| PWA 푸시 (FCM) | Should Have — firebase-messaging-sw.js | seller 완료 후 |
| 밀크런 경로 프리뷰 | Kakao Maps API — 거점 순회 경로 시각화 | Should Have |
| 리뷰·평점 시스템 | Nice to Have | Phase 2 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-28 | 초안 작성 — 5차 정합성 검토 완료 시점 기준 전체 백로그 문서화 |
