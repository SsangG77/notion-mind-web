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
src/
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
- 노드 타이틀: 최대 너비 150px·2줄 랩·말줄임. 호버 시 2줄 고정 좌우 확장으로 전체 표시
- 줌 70% 미만: 타이틀 숨기고 고정 크기 미니 정사각(DB 16px/페이지 12px), 호버 시 원래 블록으로 확장
- 엣지: 직선. DB 소속 검정(#2E2C27) 1.3px / 페이지 소속(페이지·DB) 회색 1.3px / relation 회색 점선 1.6px(별도 2D 캔버스 레이어 — WebGL 점선 미지원)
- 호버: 히트 판정=블록 사각형 전체(커스텀), 연결 엣지 전부 액센트색
- 확정 캔버스: claude.ai/design/p/4b873808-8300-4263-b7c6-e0e2555913cd

## 그래프 화면 구현 현황
- 점진 로딩: /api/graph 가 커서 배치(100개) 단위 응답 → 클라이언트가 반복 수신하며 그래프 실시간 성장, "페이지 N개 읽는 중" 진행 표시
- 상단 바(전부 노드 박스 스타일): 좌 = 필터 버튼(Filters/Groups/Display/Forces 골격, 기능 미구현) · 검색창(선택 시 카메라 점프+강조) / 우 = 다크 스위치 · 동기화 버튼(회전 아이콘, 마지막 시각 툴팁)
- 노드 조작: 드래그(이웃 0.3배 딸려오기, 핀 제외) · 우클릭 메뉴(숨기기·핀 고정/해제) · 하단 "숨긴 노드 N개 · 모두 표시" 칩
- 부속: 우하단 줌 컨트롤 · 좌하단 범례 · 빈 워크스페이스 상태 · Free 상한 배지
- 다크 모드: html.dark 클래스(Tailwind) + 캔버스 팔레트 전환, 시스템 따름 + 수동 토글 저장
- 뷰포트 위치 localStorage 기억·복원

## 제품 규칙
- 인증: 노션 OAuth 단일 (자체 계정 없음)
- Free: 노드 1,000개(초과 시 최근 수정순만 렌더) · 워크스페이스 1개 · 저장 세션 한정 · 광고(메인 그래프 하단 가로 배너 + 노드 상세 패널 하단 배너, 네트워크 미정)
- Pro: 무제한 · 핀/숨김/필터 영구 저장 · 자동 동기화 · 내보내기 · 광고 제거
- 도구는 보여주기만 — 결함 판정·감사 기능 없음 (Won't)
- 노션 API rate limit ~3req/s → 초기 동기화는 부분 렌더

## 명령
- `npm run dev` / `npm run build` / `npm run lint` (리포 루트 = 웹 앱)

## 주의
- 구 iOS 앱은 GitHub SsangG77/notion-mind 리포에 보존 (로컬에는 없음)
- 시크릿은 `.env` (gitignore됨), 키 목록은 `.env.example`
- 노션 search API(2025-09-03+ 버전)는 page + data_source만 반환 — database 객체 없음. data_source가 곧 DB 노드, DB의 상위 페이지는 data_source의 `database_parent`로 얻음
- sigma는 WebGL 전제 — 서버 렌더에서 모듈 평가되면 죽으므로 그래프 뷰는 브라우저 전용 dynamic import로만 로드
