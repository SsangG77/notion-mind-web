# Notion-mind (web)

노션 워크스페이스를 노드 그래프로 시각화하는 웹 앱. 기획·디자인·마케팅 문서는 노션 "Notion-mind" 프로젝트 페이지(🏗️ Personal Project)에 있다.

## 스택
- Next.js (TypeScript · App Router · Tailwind · src/)
- 그래프: Sigma.js v3 + graphology + graphology-layout-forceatlas2 (web worker) + @react-sigma/core
- 백엔드: Next.js API Routes + Supabase (Postgres) — 노션 OAuth secret 보관·토큰 암호화 저장
- 결제: Stripe
- 배포: 미정 (Vercel 유력)

## 아키텍처 — FSD-라이트 (2026-08-23 확정)
```
web/src/
  app/            # 라우트·페이지 (표현만 — 로직 금지)
  features/       # 기능 단위: graph/ auth/ sync/ billing/ — 각 {components, hooks}
  components/     # 공유 UI (디자인 시스템: 노드·버튼·패널·칩)
  lib/            # 외부 접근 Service: notion.ts supabase.ts stripe.ts crypto.ts
  types/
```
가드레일 (항상):
- 컴포넌트/페이지에 네트워크 호출·비즈니스 로직 금지 — 표현만
- 외부 API 접근은 `lib/` Service로만, 컴포넌트에서 fetch 직접 호출 금지
- 공통 UI는 `components/`에 한 번만 — 복붙 금지, 변형은 variant prop
- 사후 리팩토링 전제 금지 — 처음부터 분리
- trade-off: 풀 FSD 대신 폴더 관례로 가볍게 — 기능 간 의존은 리뷰로 통제

## 디자인 시스템 (노션 디자인 탭 = 원본)
- 라이트: 배경 #FFFFFF · 도트 #E9E9E7 · 서피스 #F7F6F3 · 노드 #FDFDFC(페이지)/#F4F3EF(DB) · 돌출면 #2E2C27 · 텍스트 #37352F · 액센트 #2383E2
- 다크: 배경 #191919 · 서피스 #202020 · 노드 #2B2A27/#35342F · 돌출면 #000000 · 텍스트 #EDEDEC
- 노드: DB=디스크 아이콘 10×16px 14px 600 / 페이지 7×12px 13px 400, 입체=보더 1.5px+우·하 4~5px
- 엣지: 직선. 계층 실선 1.3px 회색 / relation 점선 1.6px 액센트
- 확정 캔버스: claude.ai/design/p/4b873808-8300-4263-b7c6-e0e2555913cd

## 제품 규칙
- 인증: 노션 OAuth 단일 (자체 계정 없음)
- Free: 노드 1,000개(초과 시 최근 수정순만 렌더) · 워크스페이스 1개 · 저장 세션 한정
- Pro: 무제한 · 핀/숨김/필터 영구 저장 · 자동 동기화 · 내보내기
- 도구는 보여주기만 — 결함 판정·감사 기능 없음 (Won't)
- 노션 API rate limit ~3req/s → 초기 동기화는 부분 렌더

## 명령
- 웹 코드는 전부 `web/` — `cd web && npm run dev` / `npm run build` / `npm run lint`

## 주의
- `legacy-ios/` = 구 iOS 앱 보존분. 건드리지 않음
- 시크릿은 `web/.env` (gitignore됨), 키 목록은 `.env.example`
