# Green Hub 소비자 PWA — 프로젝트 메모리

> **SSOT** — 세션 종료 시 항상 최신화. 200라인 초과 시 50라인 이내 요약.

최종 수정: 2026-03-28 (stores·settlements·hubs API + seller 앱 핵심 화면 완료)

## ⚡ 다음 세션 즉시 착수 포인트

**다음 세션 첫 번째 작업: `/orders/[id]` 주문 상세 화면 (seller 앱)**

작업 위치: `apps/seller/src/app/orders/[id]/page.tsx` 신규 생성
참조: `docs/BACKLOG.md` §1-3, `docs/판매자 설계 - 2단계 IA.md` §4-4

착수 순서:
1. `/orders/[id]` — 주문 상세 (준비 시작 버튼 + 강제 취소 모달)
2. `/products/new` + `/products/[id]/edit` — 상품 등록·수정 폼
3. `/hubs/[id]` + `/hubs/[id]/pickup` — 거점 상세 + 픽업 코드 확인
4. Vercel seller 배포 + Railway 재배포

---

## 전체 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 1~9단계 | 요구사항·IA·API·배포·결제 E2E | ✅ |
| 10단계 | seller 앱 설계 1·2단계 (IA) | ✅ |
| 11단계 | 6·7차 정합성 검토 + 운영 구조 확정 | ✅ |
| 12단계 | seller 앱 스캐폴딩 + Firestore 연동 | ✅ |
| 13단계 | stores·settlements·hubs API 신규 구현 | ✅ |
| 14단계 | seller 앱 핵심 화면 11개 API 연결 | ✅ |
| **15단계** | **seller 앱 미구현 화면 3종** | 🔲 다음 세션 |

---

## 배포 현황

| 항목 | 값 |
|------|-----|
| Railway API | `https://api-production-13e7.up.railway.app` · Online |
| Vercel Consumer | `https://greenhubconsumer.vercel.app` · Ready |
| Firebase | `green-e4fe3` · asia-northeast3 |
| GitHub | `booker-lab/greenhub` |
| 모노레포 | `C:\Develop\greenhub` |

---

## seller 앱 현재 구조

```
apps/seller/src/
├── auth.ts                  role: 'seller' 검증 + storeId JWT 저장
├── proxy.ts                 미로그인→/login, storeId 없음→/onboarding
├── lib/
│   ├── firebase.ts          소비자 앱과 동일 Firebase 프로젝트
│   └── api.ts               apiFetch 헬퍼 (Bearer 자동 주입)
├── hooks/
│   ├── useOrders.ts         Firestore 실시간
│   └── useStoreProducts.ts  Firestore 실시간
├── components/
│   └── BottomNav.tsx        하단 탭 5개
└── app/
    ├── login/               ✅ 카카오 + 이메일
    ├── onboarding/          ✅ PATCH /stores/:storeId 연결
    ├── orders/              ✅ 목록 (상세 페이지 미구현)
    ├── products/            ✅ 목록 (등록·수정 폼 미구현)
    ├── settlements/         ✅ 3탭 API 연결
    ├── hubs/                ✅ CRUD (거점 상세·픽업 코드 미구현)
    └── settings/            ✅ delivery + daily-caps 완료
```

---

## 신규 API 모듈 (이번 세션)

| 모듈 | 엔드포인트 | 비고 |
|------|-----------|------|
| stores | `PATCH /stores/:storeId` | 온보딩 완료 시 status→active 자동 전환 |
| settlements | `GET .../settlements`, `GET .../summary` | REVIEWED·DELIVERED·PICKED_UP 트리거 자동 생성 |
| hubs | CRUD `GET/POST/PATCH/DELETE .../hubs` | storeId 소유권 Guard |

---

## 기술 특이사항

- Next.js 16 Turbopack → `--webpack` 플래그 필수
- Vercel Root Directory: **`apps/consumer`** (seller 미배포, `apps/seller` 예정)
- `proxy.ts` (구 `middleware.ts`) — Next.js 16 파일명
- `useOrderStatus`: PWA SW 충돌 → Firestore REST API 폴링 대체
- settlements·hubs Firestore 복합 인덱스 → `firestore.indexes.json` 추가 완료 (배포 필요)
- seller 개발 서버: `pnpm --filter seller dev` → `http://localhost:3001`

---

## 운영 구조 확정 (2026-03-28)

- **운영자 = 본인(플랫폼 개발자)** — `role: 'admin'` Firestore 수동 설정 1회
- **admin 앱**: B안(seller 앱 `/admin/*`) → 규모 확장 시 A안(`apps/admin` 분리)
- **판매자 등록**: A안(초대 토큰) → B안(자체 신청+승인) 단계적 확장
- **수수료율**: `PLATFORM_FEE_RATE` 환경변수 (기본 5%), 정산 생성 시 스냅샷 저장
- **온보딩 Guard**: name·ceoName·phone·address 4개 완료 시 `status: active`
