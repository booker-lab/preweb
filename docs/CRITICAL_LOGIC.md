# Critical Logic — 설계 결정 이력

> 이 파일은 되돌리기 어려운 설계 결정과 그 이유를 기록합니다.
> 결정 변경 시 반드시 이유와 날짜를 함께 기록하세요.

---

## [2026-03-25] 백엔드 아키텍처 확정

### 결정: NestJS (Layered Architecture) + Firestore 혼합

**선택지 비교**

| 항목 | Option A: Next.js API Routes | Option B: NestJS (채택) |
|------|------------------------------|------------------------|
| 비즈니스 로직 위치 | 3개 앱에 분산 | NestJS 단일 집중 |
| 주문 도메인 일관성 | 앱마다 다르게 구현될 위험 | 단일 Service로 보장 |
| Daily Cap 동시성 | 각 앱 API Routes에서 개별 처리 | NestJS 트랜잭션으로 처리 |
| 다중 판매자 확장 | 앱 전체 수정 필요 | NestJS 모듈 추가만으로 대응 |
| 배포 비용 | Vercel 무료 | +Railway $5/월 |

**채택 이유**

소비자·판매자·드라이버 세 앱이 동일한 `orders` 도메인을 공유한다.
주문 상태 전환·결제 검증·공동구매 자동 환불·Daily Cap 동시성 처리 등
핵심 비즈니스 로직이 복잡하고, 이를 3개 앱의 API Routes에 분산하면
나중에 혼자 유지보수하기 어렵다. 처음부터 NestJS로 통합하는 것이
나중에 마이그레이션하는 비용보다 훨씬 낮다.

**DDD 미적용 이유**

NestJS Layered Architecture(Controller → Service → Repository)만으로 충분.
DDD 풀세트(Entity·ValueObject·Aggregate·DomainService·Mapper)는
혼자 개발하는 MVP에서 오버엔지니어링이며, 500라인 제한(CLAUDE.md)과도 충돌한다.

---

## [2026-03-25] 모노레포 구조 확정

### 결정: pnpm workspace 모노레포

```
greenhub/
├── packages/
│   └── shared/          ← OrderStatus, Product, Store 등 공통 타입·상수
├── apps/
│   ├── consumer/        ← Next.js 15 (소비자 PWA)
│   ├── seller/          ← Next.js 15 (판매자 앱)
│   ├── driver/          ← Next.js 15 (드라이버 앱)
│   └── api/             ← NestJS (비즈니스 로직 전담)
└── pnpm-workspace.yaml
```

**채택 이유**

`OrderStatus` 타입이 세 앱에서 다르게 정의되면 Firestore 실시간 리스너 오작동.
`packages/shared`에 단일 정의 후 세 앱이 import하는 구조로 타입 불일치를 원천 차단.

---

## [2026-03-25] 실시간 데이터 전략 확정 (변경 없음)

### 결정: Firestore 직접 리스너 유지

| 데이터 | 방식 |
|--------|------|
| 주문 상태 변경 | Firestore 실시간 리스너 |
| 공동구매 참여 인원 (`currentParticipants`) | Firestore 실시간 리스너 |
| Daily Cap 잔여량 (`usedSlots`) | Firestore 실시간 리스너 |
| 결제 검증·환불·알림 | NestJS API |

WebSocket·Redis·SSE 별도 구성 없음. Firestore가 실시간 채널 역할 전담.
NestJS Repository 추상화 없이 Firestore SDK 직접 사용 (이중 추상화 불필요).
