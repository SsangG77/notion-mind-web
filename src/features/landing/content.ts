import type { Lang } from "@/lib/i18n";

// 홈 하단 소개 문구. 분량이 커서 lib/i18n.ts 와 분리해 둔다.
export interface LandingCopy {
  introTitle: string;
  introBody: string[];
  stepsTitle: string;
  steps: Array<{ n: string; title: string; body: string }>;
  featuresTitle: string;
  features: Array<{ title: string; body: string }>;
  useCasesTitle: string;
  useCases: Array<{ title: string; body: string }>;
  pricingTitle: string;
  freeName: string;
  freeBody: string;
  proName: string;
  proUnit: (yearly: number) => string;
  proBody: string;
  pricingMore: string;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  faqMore: string;
  guideMore: string;
}

const ko: LandingCopy = {
  introTitle: "노션에는 없는 그래프 보기",
  introBody: [
    "노션 사이드바는 페이지를 폴더처럼 트리로만 보여줍니다. 그런데 실제 워크스페이스는 데이터베이스에 속한 페이지, 페이지 안에 들어 있는 하위 페이지, 관계형(relation) 속성으로 서로를 가리키는 페이지가 얽힌 그물입니다. Notion-mind는 그 그물을 노드와 선으로 펼쳐, 어떤 페이지가 어디에 속하고 무엇과 이어져 있는지를 한 화면에서 보게 합니다.",
    "도구는 보여주는 데서 멈춥니다. 페이지를 옮기거나 지우거나 고치지 않고, 워크스페이스 내용을 서버에 쌓아 두지도 않습니다. 노션이 공개한 API로 읽기만 하며, 접근 권한은 노션 설정에서 언제든 회수할 수 있습니다.",
  ],
  stepsTitle: "작동 방식",
  steps: [
    {
      n: "1",
      title: "노션 계정으로 로그인",
      body: "별도 회원가입 없이 노션 인증 화면에서 워크스페이스와 공개할 페이지를 고릅니다. 읽기 권한만 요구하고, 페이지를 바꾸거나 만들지 않습니다.",
    },
    {
      n: "2",
      title: "그래프가 실시간으로 자람",
      body: "페이지를 100개 단위로 읽어 오면서 노드와 연결선이 화면에 바로 추가됩니다. 큰 워크스페이스도 처음부터 화면이 뜹니다.",
    },
    {
      n: "3",
      title: "구조를 탐색",
      body: "마우스를 올려 이웃만 남기고, 노드를 끌어 배치를 바꾸고, 클릭해서 속성과 본문을 확인합니다. 잡동사니는 숨기고 중요한 노드는 핀으로 고정합니다.",
    },
  ],
  featuresTitle: "기능",
  features: [
    {
      title: "소속과 관계를 한 화면에",
      body: "데이터베이스 소속은 실선, 페이지 안의 하위 페이지는 회색 실선, 관계형 속성은 점선으로 구분해 그립니다. 사이드바 트리에서는 보이지 않는 가로 연결이 드러납니다.",
    },
    {
      title: "물리 배치",
      body: "연결이 많은 데이터베이스 주위로 자식 페이지가 동심원처럼 모이고, 고립된 페이지는 바깥으로 밀려납니다. 노드를 끌면 이웃이 스프링처럼 따라옵니다.",
    },
    {
      title: "호버 포커스",
      body: "노드 위에 마우스를 올리면 직접 연결된 이웃만 선명하게 남고 나머지는 흐려집니다. 한 페이지가 어디에 얽혀 있는지 바로 보입니다.",
    },
    {
      title: "노드 상세 패널",
      body: "클릭하면 소속, 데이터베이스 속성, 마지막 수정 시각, 관계형 연결, 본문 미리보기를 오른쪽 패널에서 봅니다. 연결된 항목을 누르면 그 노드로 이동합니다.",
    },
    {
      title: "숨기기와 핀 고정",
      body: "우클릭으로 관심 없는 노드를 치우고, 원하는 자리에 노드를 박아 둡니다. Pro에서는 이 설정이 서버에 저장되어 다른 기기에서도 그대로입니다.",
    },
    {
      title: "다크 모드와 위치 기억",
      body: "시스템 설정을 따르는 다크 모드, 마지막으로 보던 화면 위치와 배율을 기억해 다음 접속 때 같은 자리에서 시작합니다.",
    },
  ],
  useCasesTitle: "이럴 때 씁니다",
  useCases: [
    {
      title: "오래된 워크스페이스 정리",
      body: "몇 년 쌓인 페이지 중 어디에도 연결되지 않은 고립 페이지, 한 데이터베이스에만 몰린 페이지가 한눈에 보입니다. 무엇을 합치고 지울지 판단할 때 씁니다.",
    },
    {
      title: "관계형 데이터베이스 점검",
      body: "프로젝트, 작업, 회의록처럼 관계형 속성으로 엮은 데이터베이스가 실제로 어떻게 이어져 있는지 점선으로 확인합니다. 끊긴 연결과 잘못 이어진 연결을 찾습니다.",
    },
    {
      title: "새 팀원 온보딩",
      body: "워크스페이스가 어떤 큰 덩어리로 나뉘어 있고 각 덩어리가 어디로 이어지는지 그래프 한 장으로 설명합니다.",
    },
    {
      title: "개인 지식 관리",
      body: "노트끼리의 연결을 옵시디언 그래프 뷰처럼 보고 싶은 노션 사용자에게 맞습니다. 노션을 떠나지 않고 같은 시각을 얻습니다.",
    },
  ],
  pricingTitle: "요금",
  freeName: "Free",
  freeBody:
    "최근 수정순 페이지 1,000개, 그래프 기능 전부, 워크스페이스 1개. 숨김과 핀은 세션 한정이고 화면 하단에 광고가 표시됩니다.",
  proName: "Pro",
  proUnit: (yearly) => ` / 월 (연 $${yearly} 한 번에)`,
  proBody:
    "페이지 수 제한 없이(20,000개), 숨김과 핀 영구 저장, 광고 없음. 결제 후 14일 이내 전액 환불.",
  pricingMore: "요금제 자세히",
  faqTitle: "자주 묻는 질문",
  faq: [
    {
      q: "노션 공식 서비스인가요?",
      a: "아닙니다. Notion Labs, Inc.와 무관한 독립 서비스이며, 노션이 공개한 API로 만든 외부 도구입니다.",
    },
    {
      q: "내 노션 내용이 서버에 저장되나요?",
      a: "아닙니다. 그래프에 필요한 제목, 속성, 관계 정보를 노션에서 읽어 브라우저로 전달할 뿐입니다. 서버에는 Pro 구독 상태와 Pro의 숨김, 핀 설정만 남습니다.",
    },
    {
      q: "일부 페이지만 보여줄 수 있나요?",
      a: "노션 인증 화면에서 허용할 페이지를 고르면 그 페이지와 하위 페이지만 그래프에 나타납니다. 설정 패널에서 언제든 다시 고를 수 있습니다.",
    },
    {
      q: "무료로 쓸 수 있나요?",
      a: "Free 요금제는 최근 수정순 페이지 1,000개까지, 그래프 기능 전부, 광고 표시 조건으로 무료입니다. Pro는 연 $48(월 $4 꼴) 또는 월 $7이며, 결제 후 14일 이내 전액 환불됩니다.",
    },
    {
      q: "연결을 끊으려면?",
      a: "설정 패널에서 로그아웃하면 브라우저의 접근 토큰이 삭제됩니다. 노션 설정의 연결된 앱에서 Notion-mind를 제거하면 완전히 차단됩니다.",
    },
    {
      q: "모바일에서도 되나요?",
      a: "열리긴 하지만 그래프 조작은 마우스와 트랙패드가 있는 데스크톱 브라우저에 맞춰져 있습니다. WebGL을 지원하는 최신 브라우저가 필요합니다.",
    },
  ],
  faqMore: "더 많은 질문과 답",
  guideMore: "사용 가이드",
};

const en: LandingCopy = {
  introTitle: "The graph view Notion does not have",
  introBody: [
    "Notion's sidebar shows your pages as a folder tree. A real workspace is a web: pages that belong to databases, subpages nested inside pages, and pages pointing at each other through relation properties. Notion-mind lays that web out as nodes and lines, so you can see in one screen where a page sits and what it connects to.",
    "The tool stops at showing. It never moves, deletes or edits a page, and it does not pile your workspace onto a server. It only reads through Notion's public API, and you can take the access back from Notion's settings whenever you want.",
  ],
  stepsTitle: "How it works",
  steps: [
    {
      n: "1",
      title: "Sign in with Notion",
      body: "No separate signup. On Notion's own consent screen you pick the workspace and the pages to share. Read access only; nothing is written or created.",
    },
    {
      n: "2",
      title: "The graph grows as it loads",
      body: "Pages arrive a hundred at a time, and nodes and edges appear as they land. Even a large workspace puts something on screen right away.",
    },
    {
      n: "3",
      title: "Explore the structure",
      body: "Hover to keep only the neighbours, drag nodes to rearrange, click to read properties and a body preview. Hide the clutter and pin what matters.",
    },
  ],
  featuresTitle: "Features",
  features: [
    {
      title: "Hierarchy and relations together",
      body: "Database membership is a solid black line, a subpage inside a page is a solid grey line, and a relation property is a dotted line. The sideways links the sidebar never shows become visible.",
    },
    {
      title: "Physical layout",
      body: "Child pages gather in rings around the databases they belong to, and unconnected pages drift outward. Drag a node and its neighbours follow on springs.",
    },
    {
      title: "Hover focus",
      body: "Hovering a node keeps it and its direct neighbours sharp while everything else fades. You see at once where a page is entangled.",
    },
    {
      title: "Node detail panel",
      body: "A click opens a side panel with the parent, database properties, last edited time, relations and a body preview. Clicking any linked item flies the camera to that node.",
    },
    {
      title: "Hide and pin",
      body: "Right-click to clear away nodes you do not care about, or nail a node to a spot. On Pro these choices are stored server-side and follow you to other devices.",
    },
    {
      title: "Dark mode and remembered view",
      body: "Dark mode follows your system setting, and the last camera position and zoom are remembered so you start where you left off.",
    },
  ],
  useCasesTitle: "Good for",
  useCases: [
    {
      title: "Cleaning up an old workspace",
      body: "Years of pages, and you can finally see the orphans connected to nothing and the databases everything piled into. Useful when deciding what to merge and what to delete.",
    },
    {
      title: "Auditing relation properties",
      body: "Projects, tasks and meeting notes tied together by relations — the dotted lines show how they actually connect, including the links that are missing or wrong.",
    },
    {
      title: "Onboarding a new teammate",
      body: "One picture explains which big clusters the workspace splits into and how those clusters reach each other.",
    },
    {
      title: "Personal knowledge management",
      body: "For Notion users who want the link graph they liked in Obsidian, without leaving Notion to get it.",
    },
  ],
  pricingTitle: "Pricing",
  freeName: "Free",
  freeBody:
    "1,000 most recently edited pages, every graph feature, one workspace. Hidden nodes and pins last the session, and a banner sits at the bottom of the screen.",
  proName: "Pro",
  proUnit: (yearly) => ` / month (billed $${yearly} once a year)`,
  proBody:
    "No practical page limit (20,000), hidden nodes and pins saved for good, no ads. Full refund within 14 days.",
  pricingMore: "See full pricing",
  faqTitle: "Common questions",
  faq: [
    {
      q: "Is this an official Notion product?",
      a: "No. It is an independent service, not affiliated with Notion Labs, Inc., built on Notion's public API.",
    },
    {
      q: "Is my Notion content stored on your server?",
      a: "No. Titles, properties and relations are read from Notion and passed to your browser. The server keeps only your subscription status and, on Pro, your hidden nodes and pins.",
    },
    {
      q: "Can I share only some pages?",
      a: "Pick the pages on Notion's consent screen and only those and their subpages appear in the graph. You can change the selection any time from the settings panel.",
    },
    {
      q: "Is there a free plan?",
      a: "Free covers the 1,000 most recently edited pages with every graph feature, with ads. Pro is $48 a year (about $4 a month) or $7 monthly, fully refundable within 14 days.",
    },
    {
      q: "How do I disconnect?",
      a: "Signing out from the settings panel deletes the access token in your browser. Removing Notion-mind under Connected apps in Notion cuts access off entirely.",
    },
    {
      q: "Does it work on mobile?",
      a: "It opens, but the graph interactions are built for a desktop browser with a mouse or trackpad. A recent browser with WebGL is required.",
    },
  ],
  faqMore: "More questions and answers",
  guideMore: "Read the guide",
};

export const LANDING: Record<Lang, LandingCopy> = { ko, en };
