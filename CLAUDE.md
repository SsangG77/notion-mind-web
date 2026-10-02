# Notion-mind (web)

노션 워크스페이스를 노드 그래프로 시각화하는 웹 앱. 기획·디자인·마케팅 문서는 노션 "Notion-mind" 프로젝트 페이지(🏗️ Personal Project)에 있다.

## 스택
- Next.js (TypeScript · App Router · Tailwind · src/)
- 그래프: Sigma.js v3 + graphology + graphology-layout-forceatlas2 (web worker) + @react-sigma/core
- 백엔드: Next.js API Routes + Supabase (Postgres, 프로젝트 `notion-mind` 서울 리전 jqebviioxtnjfpmhmsqz). 노션 토큰은 서버에 저장 안 함(암호화 쿠키만). Supabase 는 `subscriptions` 테이블 하나 — RLS 켜고 정책 없음, 서버가 secret 키(`SUPABASE_SERVICE_ROLE_KEY`, 새 형식 sb_secret_)로만 접근
- 결제: Paddle Billing (판매대행 MoR — 한국 사업자는 Stripe 직접 가입 불가, 정산 USD/Payoneer, KRW 불가). 샌드박스 계정 별도(sandbox-vendors.paddle.com, 키 `PADDLE_SANDBOX_*` 로 `.env` 에 병기). 코드는 `NEXT_PUBLIC_PADDLE_ENV` 하나로 환경 결정 — Vercel Production 값을 sandbox 로 두면 사이트 전체가 테스트 모드(테스트 카드 4242). 라이브 심사(02) 통과됨(2026-09-29). 광고: Google AdSense
- 배포: Vercel (프로젝트 `ssangg77s-projects/notion-mind-web`, CLI `npx vercel deploy --prod`). 정식 주소 https://notion-mind.com (Cloudflare Registrar, A 레코드 76.76.21.21, DNS only). www·notion-mind-web.vercel.app 은 정식 주소로 308 리디렉션. 시크릿은 Vercel 환경변수(Production·Preview)로만 — `.vercelignore` 가 `.env` 업로드 차단. GitHub 자동 배포는 미연결(Vercel GitHub 앱 권한 필요)

## 아키텍처 — FSD-라이트 (2026-08-23 확정)
```
src/
  app/            # 라우트·페이지 (표현만 — 로직 금지)
  features/       # 기능 단위: graph/ auth/ sync/ billing/ — 각 {components, hooks}
  components/     # 공유 UI (디자인 시스템: 노드·버튼·패널·칩)
  lib/            # 외부 접근 Service: notion.ts crypto.ts supabase.ts paddle.ts billing.ts
  content/legal/  # 약관·처리방침 MDX (ko 루트 / eu 영문)
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
- UI 크롬(설정·검색·페이지 수·줌·패널 — `BLOCK` 토큰)은 노드와 같은 입체 블록이되 면 색만 서피스(#F7F6F3 / 다크 #202020)로 한 단계 구분(2026-09-19). 반투명·블러는 하드 엣지 블록 언어와 안 맞아 채택 안 함. ⚠️ 다크에서 UI↔배경 대비 1.07로 약함 — 보더 밝게(#4A4844) 하는 안 미결
- 다크: 배경 #191919 · 서피스 #202020 · 노드 #2B2A27/#35342F · 돌출면 #000000 · 텍스트 #EDEDEC
- 노드: DB=디스크 아이콘 18px 600 / 페이지 17px 400 (2026-09-14 30% 확대), 입체=보더 1.5px+우·하 4~5px
- 노드 타이틀: 최대 너비 195px·2줄 랩·말줄임. 호버 시 2줄 고정 좌우 확장으로 전체 표시
- 블록 표시: 줌 스케일 38% 미만이면 미니 정사각(DB 16px/페이지 12px, 호버 시 블록 확장) — 화면 줌 15%까지 타이틀 유지, 14%부터 정사각. 최소 표시 스케일 80%(축소해도 글자 안 작아짐). 블록 스케일 = 1/√(카메라 비율)
- 엣지: 직선. DB 소속 검정(#2E2C27) 1.3px / 페이지 소속(페이지·DB) 회색 1.3px / relation 회색 점선 1.6px(별도 2D 캔버스 레이어 — WebGL 점선 미지원)
- 호버: 히트 판정=블록 사각형 전체(커스텀), 연결 엣지 전부 액센트색
- 확정 캔버스: claude.ai/design/p/4b873808-8300-4263-b7c6-e0e2555913cd

## 그래프 화면 구현 현황
- 점진 로딩: /api/graph 가 커서 배치(100개) 단위 응답 → 클라이언트가 반복 수신하며 그래프 실시간 성장, "페이지 N개 읽는 중" 진행 표시
- 화면 모서리 배치(2026-09-19, 캔버스 앱 관례 따름 — 전용 헤더 줄 없음): 좌상단 = `⚙ Notion-mind` 박스(앱 이름 겸 설정 버튼) + 검색+필터 통합 블록(구분선으로 분리, Filters/Groups/Display/Forces 골격) / 우상단 = 페이지 수 박스(N/1,000 게이지 + Free 는 항상 "Pro로 전체 보기" 문구, 클릭 시 /pricing) / 좌하단 = 다크 스위치 / 우하단 = 줌 컨트롤. 전부 노드 박스 스타일
- 설정 패널: 좌측 슬라이드 인·아웃 + 배경 딤. 상단에 워크스페이스 이름(구 헤더가 표시하던 값) · 요금제(→/pricing) · 언어(한국어/영어) · 연결된 페이지 변경(OAuth 재인증으로 페이지 재선택) · 수동 동기화 · 광고 제거/자동 동기화 Pro 스위치(누르면 페이월) · 로그아웃(빨간 텍스트+확인) · 맨 아래 그래프 범례. 높이는 좌하단 다크 스위치 위에서 끝남(bottom 116px)
- 요금제 화면 `/pricing`: Free/Pro 카드 + 월·연 토글(기본 **연간** — 이탈률이 낮아 연간을 앞세움, "연 $36 절약" 배지). Pro 월 $7 / 연 $48 (USD, 부가세 포함 — `PRO_PRICE`, Paddle 카탈로그 `pri_` ID 는 `lib/paddle.ts` PRICE_IDS 와 일치해야 함). 구독 버튼 = Paddle.js 오버레이(`features/billing/hooks/usePaddle`), `customData.workspace_id` 로 유저 연결. 결제 후 `?checkout=success` 로 돌아와 `/api/billing/status` 폴링 → Pro 반영되면 새로고침
- 노드 상세 패널: 노드 클릭 시 우측 슬라이드 인(설정 패널과 같은 노드 박스 디자인, 딤 없음 — 그래프는 계속 조작 가능). 소속·속성·마지막 수정·관계형 연결·하위·본문 미리보기(24줄) · 하단 "노션에서 열기" + Free 광고 배너. 칩을 누르면 그 노드로 카메라 이동 + 선택 이동. 닫기는 X·ESC·빈 영역 클릭 모두 같은 슬라이드 아웃 경로(빈 영역 클릭은 닫기 요청 카운터로 패널에 전달)
- 노드 조작: 드래그 = 스프링 물리(2홉 이웃 딸려오기, 핀 제외, 놓으면 출렁이며 정착 후 겹침 분리) · 우클릭 메뉴(숨기기·핀 고정/해제) · 하단 노드 박스 칩 2개 "숨긴 노드 N개, 모두 표시" / "숨긴 목록 보기"(→ 좌측 슬라이드 `HiddenNodesPanel`, 설정 패널과 같은 자리, 딤 없음, 항목별 "표시" 버튼 + 모두 표시. 칩 재클릭으로 닫힘). 좌측 패널은 한 번에 하나 — `lib/leftPanel.ts` 모듈 스토어(settings/hidden/null)로 조정, 설정을 열면 숨긴 목록이 슬라이드 아웃(애니메이션 끝 `onAnimationEnd` 에서 언마운트)
- 호버 포커스(옵시디언식): 중심+이웃만 선명(호버 레이어 최상단), 나머지 노드 15% 반투명·비연결 선은 배경 근접 고스트색·배경 베일(라이트 7%/다크 35%)
- 겹침 분리: 자체 사각형 분리 엔진(`separateRects` — 블록 실측 크기 + 여백 가로 100/세로 60, 그리드 버킷). noverlap 라이브러리는 원형 기준이라 접촉 상태에서 수렴 정지해 미사용
- 좌표계: 자동 화면 맞춤(autoRescale) 해제 — 좌표 1단위 = 1px(기본 배율 100%), 전체가 화면에 안 들어와도 됨. 첫 화면 = 그래프 중앙 1:1, 우하단에 줌 % 표시
- 배치 엔진(2026-09-17 교체): d3-force 상시 시뮬레이션. 링 반경 = min(한 겹 반경 (자식수−1)×480÷2π, 여러 겹 반경 √(자식수×480×520÷π)) — 한 겹으로만 세우면 반경이 자식 수에 선형으로 커져 허브 하나가 화면을 수십 배 벗어남(자식 87개 = 반경 6,650px). 자식 14개 이상이면 동심원 여러 겹으로 나눠 담아 반경이 √로만 자람(2026-09-18). 링크 거리 = 양끝 링 합+620(한 겹 허브의 자식은 0.88~1.12 엇갈림, 여러 겹 허브의 자식은 겹 번호 k에 따라 링×k÷겹수 — 바깥 겹에 자리가 많으므로 √ 분포로 배정), 반발 = 연결수 비례, 충돌 원 = max(블록반폭+300, 링−400). ⚠️ 충돌은 두 반경의 합으로 밀어내므로 허브 충돌 반경에서 대표 자식 반경(400)을 빼야 자식이 링보다 멀리 안 튕김. 정착 시 사각형 분리(여백 920/580px)로 최소 거리 보장. 드래그 = fx/fy 고정 + 재가열, 핀 = fx/fy 유지
- ⚠️ 시뮬레이션 구동은 rAF 금지 — Safari가 창이 가려지면 rAF를 통째로 멈춰 물리가 정지함. setTimeout(16ms) 루프로 구동 (d3 내부 스테퍼도 같은 이유로 미사용)
- 부속: 우하단 줌 컨트롤(줌 % 표시 · +/− · 세로 슬라이더 96px 로그 스케일 · 기본 배율) · 빈 워크스페이스 상태 · Free 상한 배지
- ⚠️ sigma는 컨테이너 폭이 0이면 예외를 던짐(탭 숨김·라우트 전환) — `allowInvalidContainer: true` + ResizeObserver(`ContainerResize`)로 복귀 처리
- 다크 모드: html.dark 클래스(Tailwind) + 캔버스 팔레트 전환, 시스템 따름 + 수동 토글 저장
- 뷰포트 위치 localStorage 기억·복원

## 약관·개인정보 (2026-09-25)
- 페이지: /privacy /terms /refund (한국어, PIPA+전자상거래법) · /eu/privacy /eu/terms /eu/refund (영문, GDPR+CRD). 환불정책은 약관 조항의 요약본(Paddle 심사가 별도 페이지 요구). MDX(`@next/mdx`, remark-gfm 문자열 지정 — Turbopack 직렬화) + `@tailwindcss/typography`, 공통 틀 `components/legal/LegalLayout`(노드 박스 카드, 언어 전환, 쿠키 설정 링크). 스킬 기본값(shadcn·Pretendard·흑백)은 디자인 충돌로 미적용
- 운영자 정보: 개인사업자 차상진(286-23-02144, 부산 동래구) — 이메일만 공개. 환불 = 결제(갱신 포함) 후 14일 전액. 아동 기준 16세 통일. 통신판매업 신고번호·EU Representative·CPO 전화번호 미기재(확인 필요, MDX 주석 참조)
- 쿠키 배너 `components/legal/CookieBanner` 앱 전역 1개(layout.tsx), EU 옵트인. 동의값 localStorage `nm_cookie_consent`(accepted/rejected) — 광고 스크립트는 accepted일 때만 로드할 것. `openCookieSettings()`로 재열기
- 회원가입 폼 없음(노션 OAuth) → 로그인 버튼 아래 동의 문구로 갈음. 홈 푸터에 가이드·FAQ·요금제·약관·처리방침·환불·English·문의 메일 링크(결제사·광고 심사가 홈에서 찾음)
- 공개 텍스트 페이지(AdSense "게시자 콘텐츠 없음" 거절 대응, 2026-09-28): 홈 = 로그인 카드(첫 화면) + 아래 `features/landing/LandingContent`(소개, 작동 방식, 기능, 활용, 요금, FAQ 서버 렌더 약 600단어), `/guide` `/faq` MDX(`content/docs`, `DocLayout`). 긴 글 공통 틀은 `components/ArticleShell`(약관 `LegalLayout` 도 이걸 씀). `public/robots.txt` 는 /api, /graph 차단

## 결제·요금제 판정
- 유저 키 = 노션 `workspace_id` (OAuth 응답, httpOnly 쿠키 `nm_ws`). 팀 워크스페이스면 구성원 전체가 Pro 공유 — 초기엔 의도된 단순화
- 웹훅 `/api/billing/webhook`: `paddle.webhooks.unmarshal(rawBody, secret, signature)` 서명 검증(원문 body 필수), `subscription.created/updated/canceled` 만 UPSERT. 2xx 만 전달 완료 — 실패는 전부 500 으로 재시도 유도. 등록된 알림 대상 ntfset_01m3gqjgnysws25w3hcajr5tjv
- Pro 판정 `lib/billing.ts` `planFromStatus`: active/trialing/past_due = pro, 나머지 free. Supabase 오류 시 free 폴백(결제 장애가 그래프를 막지 않게). 서버 컴포넌트(graph, pricing)에서 `getPlan` 으로 읽어 `plan` prop 으로 내려보냄 → 광고 2곳 숨김, 페이지 수 게이지 제거, 설정 배지 Pro, Pro 스위치 켜짐
- 카탈로그·웹훅·토큰 스크립트: `scripts/seed-paddle-catalog.ts`, `add-paddle-price.ts <month|year> <달러>`(새 가격 만들고 `PRICE_IDS` 자동 교체), `register-paddle-webhook.ts`, `create-paddle-client-token.ts`. 기본 sandbox, `PADDLE_ENV=production` 이면 라이브(라이브 쓰기는 사용자가 `!` 로 직접 실행). 샌드박스 가격: 월 $7 pri_01m3pr2skwg5q66vxb3rr930wk / 연 $48 pri_01m3pr2da5abpgjejabx0azfk5, 웹훅 ntfset_01m3pr2vrrj026xa0zdr2we764
- 노드 상한: Free 1,000 / Pro 20,000 (`assembleGraph` limit, `useGraphData(plan)`). 클라이언트는 상한+1 배치까지 요청(초과 감지), 서버 `/api/graph` 는 배치 번호 `i` 가 Free 상한을 넘으면 요금제 확인 후 빈 응답 — 클라이언트 조작만으로는 더 못 받음
- 구독 관리: `ManageSubscriptionButton`(설정 패널 Pro 행, 요금제 화면 Pro 카드) → 만류 모달(잃는 것 안내) → 해지 사유(선택, 건너뛰기 가능) → `/api/billing/portal` 이 Paddle 고객 포털 세션을 만들어 새 탭으로. 사유는 `/api/billing/feedback` → Supabase `cancellation_feedback`
- ⚠️ 해지 자체는 막을 수 없음 — Paddle 이 모든 구독 메일에 해지 링크를 넣고(규정), 구매자는 paddle.net 에서 직접 해지·환불 요청 가능. 약관 제10조와 EU 철회권상으로도 승인제 불가. 이탈 대응은 만류 화면·연간 유도·사유 수집까지
- Pro 영구 설정: Supabase `workspace_settings`(workspace_id PK, hidden jsonb string[], pinned jsonb {id:{x,y}}). `/api/settings` GET(Free 는 빈 값)/PUT(Pro 만, 20,000개 상한). 클라이언트 `useWorkspaceSettings(plan)` — 로드 후 `saved` 를 LayoutManager 에 넘겨 노드 추가 시 hidden/pinned+좌표 적용(로드 전엔 노드 추가 보류), 숨김/핀/핀 드래그/모두 표시 뒤 `persist(graph)` 가 그래프에서 읽어 800ms 디바운스 PUT. 필터는 UI 골격만 있어 저장 대상 없음
- 아직 없음: 자동 동기화, 이미지 내보내기, 필터 실기능

## 상표·이름 (2026-09-23 결정)
- 노션 상표 가이드라인은 앱 이름·도메인·SNS 핸들에 "Notion" 사용을 명시적으로 금지. 그래도 이름 `Notion-mind` 유지 결정(A안) — 대신 로그인·설정 패널·요금제에 비제휴·상표 귀속 면책 문구(`NotionDisclaimer`) 노출. "with permission" 문구는 허가 없으므로 사용 금지
- 위험: 노션이 교체 요구할 수 있음. 노션 공식 연동 목록·마켓플레이스 등록은 이름 규정 때문에 불가로 봐야 함
- 근거 문서: notion.so/Notion-Trademark-Usage-Guidelines-9826313c686a4f6e9d8a48347162714b

## 화면 언어 (2026-10-02)
- 한국어/영어 전환. 설정 패널 "언어" 줄에서 고르고, 쿠키 `nm_lang` 하나로 서버 컴포넌트와 클라이언트가 같은 값을 본다(기본 ko). 전환은 쿠키 쓰고 `router.refresh()`
- 문구는 `lib/i18n.ts` 사전(앱 UI) + `features/landing/content.ts`(홈 소개) + `content/docs/{guide,faq}.{ko,en}.mdx`(문서는 두 벌을 정적 import 하고 언어로 고름). 클라이언트는 `features/i18n/LangProvider` 의 `useT()`, 서버 컴포넌트는 `lib/lang.server.ts` 의 `currentLang()`
- 쿠키가 없는 첫 방문은 `Accept-Language` 헤더로 정함 — 서버에서 결정하므로 깜빡임 없음. 로그인 전에는 설정 패널이 없으니 이 자동 판정이 유일한 경로
- trade-off: `/ko` `/en` 접두사를 쓰는 정식 i18n 라우팅 대신 쿠키 — URL·노션 OAuth 콜백·법률 문서 경로를 그대로 둔다. 대신 언어별 URL 공유·검색 노출은 안 됨
- 법률 문서는 제 로케일을 유지(한국어판 `/privacy` 는 앱이 영어여도 한국어). `ArticleShell lang` 으로 면책 문구까지 문서 언어를 따름. 앱 언어에 맞는 약관 경로는 `legalPath(lang, doc)`
- Pro 가격 숫자는 `lib/pricing.ts` (`PRO_PRICE`, `YEARLY_DISCOUNT`, `YEARLY_SAVING`) 한 곳 — 요금제·페이월·홈이 같이 읽는다. Paddle 카탈로그와 일치해야 함
- 번역 범위: 앱 UI 전체, 홈 소개, `/guide` `/faq` 본문, 쿠키 배너까지 모두 같은 설정을 따름

## 개발 모드 (2026-10-02)
- 구독 없이 Pro/Free 화면을 오가기 위한 장치(캡처, 검증용). 숨은 경로 `/dev` 에서 비밀번호를 넣으면 **설정 패널에 요금제 토글이 나타날 뿐이고, Pro 는 꺼진 상태로 시작**한다. 켜고 끄는 건 그 토글. 열기 전에는 토글 자체가 렌더되지 않음
- 적용 조건은 **둘 다** 있어야 함: ① 쿠키 `nm_dev`(비밀번호를 안다는 증명) ② 주소의 `?dev=pro` 또는 `?dev=free`(이 요청에 적용하라는 표시). 쿠키만으로는 아무것도 안 바뀜 — 링크를 타고 나가 표시가 떨어지면 그 즉시 일반 모드
- 설정 패널의 토글은 쿠키가 아니라 **주소를 고쳐 쓴다**(`router.replace`). "끄기"는 쿠키까지 지움
- 화면이 개발 모드로 그려졌으면 서버 호출도 같은 판정을 받아야 하므로, 클라이언트는 `lib/devParam.ts` 의 `withDev()` 로 API 주소에 표시를 이어 붙인다(`/api/graph`, `/api/settings`, `/api/billing/status`). 새로 추가하는 요금제 의존 API 도 이걸 거쳐야 함
- 비밀번호는 `DEV_UNLOCK_SECRET` 환경변수에만 있음. 미설정이면 `/dev` 는 404 이고 기능 전체가 꺼짐. 클라이언트 번들에 안 들어감(빌드 산출물로 확인)
- 쿠키는 httpOnly, AES-GCM 봉인(토큰과 같은 키), 만료를 봉인 안에 넣어 서버가 직접 검사 — 위조·만료 쿠키는 무시하고 Free 로 떨어짐. 유효기간 7일
- 요금제 판정은 `lib/plan.server.ts` 한 곳: 서버 컴포넌트는 `currentPlan(searchParams.dev)`, 라우트 핸들러는 `planFor(req)`(쿠키와 쿼리를 함께 봄). ⚠️ 새 코드에서 `getPlan()` 을 직접 부르면 개발 모드가 무시된다
- `/dev` 는 robots.txt 로 차단, 어디에서도 링크하지 않음

## 제품 규칙
- 인증: 노션 OAuth 단일 (자체 계정 없음)
- Free: 노드 1,000개(초과 시 최근 수정순만 렌더) · 워크스페이스 1개 · 숨김/핀은 세션 한정 · 광고(메인 그래프 하단 가로 배너 + 노드 상세 패널 하단 배너 — `AdBanner` 플레이스홀더, 광고 단위 slot 은 AdSense 승인 후 발급). AdSense 게시자 `ca-pub-3545555975398754`(`components/adsense.ts`, AdMob 과 같은 계정): `public/ads.txt`, `<meta google-adsense-account>`(소유 확인), 스크립트는 `AdSenseLoader` 가 항상 로드(구글 인증 CMP 가 이 스크립트로 EEA/UK/CH 동의창을 띄움 — AdSense 에서 3선택 CMP 메시지 선택). 우리 배너는 거부 시 `requestNonPersonalizedAds=1`, 미응답 시 `pauseAdRequests=1`. EEA 사용자는 창 둘 볼 수 있음 — 트래픽 생기면 지역 분기
- Pro: 무제한 · 핀/숨김/필터 영구 저장 · 자동 동기화 · 내보내기 · 광고 제거
- 도구는 보여주기만 — 결함 판정·감사 기능 없음 (Won't)
- 노션 API rate limit ~3req/s → 초기 동기화는 부분 렌더

## 명령
- `npm run dev` / `npm run build` / `npm run lint` (리포 루트 = 웹 앱)
- `npm run check:ui-strings` — 화면 문구가 코드에 하드코딩됐는지 검사(`lint` 가 같이 돌림). **번역 작업의 완료 판정은 사람이 만든 목록이 아니라 이 명령의 0건으로 한다.** 의도된 예외는 그 줄에 `i18n-allow: 사유` 주석

## 주의
- 구 iOS 앱은 GitHub SsangG77/notion-mind 리포에 보존 (로컬에는 없음)
- 시크릿은 `.env` (gitignore됨), 키 목록은 `.env.example`
- 노션 search API(2025-09-03+ 버전)는 page + data_source만 반환 — database 객체 없음. data_source가 곧 DB 노드, DB의 상위 페이지는 data_source의 `database_parent`로 얻음
- sigma는 WebGL 전제 — 서버 렌더에서 모듈 평가되면 죽으므로 그래프 뷰는 브라우저 전용 dynamic import로만 로드
