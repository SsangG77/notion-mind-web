// 화면 문구 사전. 서버·클라이언트 양쪽에서 쓰므로 next/headers 같은 서버 전용 모듈을 import 하지 않는다.
// 선택한 언어는 쿠키 하나(nm_lang)에 담고, 서버 컴포넌트는 쿠키를 직접 읽고 클라이언트는 LangProvider 로 받는다.
// trade-off: 라우트에 /ko /en 접두사를 붙이는 정식 i18n 라우팅 대신 쿠키로 — URL·OAuth 콜백·법률 문서 경로를 건드리지 않는다.
export type Lang = "ko" | "en";

export const LANG_COOKIE = "nm_lang";
export const LANGS: readonly Lang[] = ["ko", "en"];
export const LANG_LABEL: Record<Lang, string> = { ko: "한국어", en: "English" };

export function pickLang(value: string | null | undefined): Lang {
  return value === "en" ? "en" : "ko";
}

/** 브라우저 언어로 첫 기본값 결정 — 쿠키가 아직 없을 때만 */
export function langFromNavigator(navigatorLanguage: string | undefined): Lang {
  return navigatorLanguage?.toLowerCase().startsWith("ko") ? "ko" : "en";
}

const ko = {
  // 공통
  close: "닫기",
  free: "Free",
  pro: "Pro",

  // 그래프 화면
  graphLoading: "워크스페이스를 읽는 중…",
  graphLoadingHint: "페이지가 많으면 시간이 걸립니다",
  graphReadingPages: (n: string) => `페이지 ${n}개 읽는 중…`,
  graphError: (e: string) => `그래프를 불러오지 못했습니다: ${e}`,
  graphRelogin: "다시 로그인",
  graphEmpty: "표시할 페이지가 없습니다",
  graphEmptyHint: "노션 연결 설정에서 공유한 페이지가 있는지 확인하세요",
  graphTruncated: (shown: string, total: string) => `${shown} / ${total} 표시 중 — `,
  graphTruncatedPro: "전체는 Pro",

  // 상단 좌측
  searchPlaceholder: "페이지 검색",
  filter: "필터",
  comingSoon: "준비 중",
  settings: "설정",

  // 페이지 수 박스
  pageCountSuffix: (limit: string) => ` / ${limit} 페이지`,
  pageCountPages: " 페이지",
  unlimited: "무제한",
  seeAllWithPro: "Pro로 전체 보기",
  viewPlans: "요금제 보기",

  // 테마, 줌
  lightMode: "라이트 모드",
  darkMode: "다크 모드",
  zoom: "줌",
  zoomReset: "기본 배율 (100%)",

  // 우클릭 메뉴, 숨김
  hideNode: "숨기기",
  unpin: "핀 해제",
  pin: "핀 고정",
  hiddenShowAll: (n: number) => `숨긴 노드 ${n}개, 모두 표시`,
  hiddenListOpen: "숨긴 목록 보기",
  hiddenListClose: "숨긴 목록 닫기",
  hiddenPanelTitle: (n: number) => `숨긴 노드 ${n}개`,
  hiddenPanelEmpty: "숨긴 노드가 없습니다",
  show: "표시",
  showAll: "모두 표시",

  // 노드 상세 패널
  database: "데이터베이스",
  page: "페이지",
  detailParent: "소속",
  detailLoading: "상세를 불러오는 중…",
  detailError: (e: string) => `불러오지 못했습니다: ${e}`,
  detailProperties: "속성",
  detailLastEdited: "마지막 수정",
  detailRelations: (n: number) => `관계형 연결 ${n}`,
  detailChildren: (n: number) => `하위 ${n}`,
  detailBody: "본문",
  detailMore: "…이어지는 내용은 노션에서",
  openInNotion: "노션에서 열기 ↗",
  untitled: "무제",
  adSlot: "AD — 광고 영역 (Free)",

  // 설정 패널
  plan: "요금제",
  manageSubscription: "구독 관리",
  manageSubscriptionHint: "해지, 결제 수단 변경, 영수증",
  connectedPages: "연결된 페이지",
  connectedPagesHint: "그래프에 넣을 페이지·DB를 다시 고름",
  change: "변경",
  manualSync: "수동 동기화",
  lastSync: (time: string) => `마지막 ${time}`,
  syncing: "동기화 중…",
  syncNow: "↻ 동기화",
  removeAds: "광고 제거",
  autoSync: "자동 동기화",
  language: "언어",
  logout: "로그아웃",
  logoutConfirm: "로그아웃할까요?",
  legend: "그래프 범례",
  legendDbChild: "DB 소속 페이지",
  legendPageChild: "페이지 안 페이지·DB",
  legendRelation: "관계형(relation)",
  legendHover: "호버한 노드의 연결",
  terms: "이용약관",
  privacy: "개인정보 처리방침",
  refund: "환불정책",

  // 페이월
  paywallTitle: "Pro로 업그레이드",
  paywallSubtitle: "이 기능은 Pro 요금제에서 제공됩니다",
  paywallCta: (price: number) => `월 $${price} 부터 — 요금제 보기`,
  later: "나중에",
  paywallBenefits: [
    "노드 무제한 (Free는 1,000개)",
    "핀·숨김·필터 영구 저장",
    "자동 동기화",
    "이미지 내보내기",
    "광고 제거",
  ],

  // 요금제 화면
  backToGraph: "← 그래프로",
  pricingTitle: "요금제",
  pricingSubtitle: "워크스페이스 전체를 제한 없이 펼쳐보세요",
  monthly: "월간",
  yearly: "연간",
  discountOff: (pct: number) => `${pct}% 할인`,
  currentPlan: "현재 사용 중",
  recommended: "추천",
  perMonth: " / 월",
  perYear: " / 년",
  yearlyNote: (perMonth: string) => `월 $${perMonth} 꼴, 연 1회 결제`,
  monthlyNote: "매월 자동 갱신, 언제든 해지",
  taxIncluded: ", 부가세 포함",
  yearlySaving: (saving: number) => `월 결제보다 연 $${saving} 절약`,
  subscribePro: "Pro 구독하기",
  checkoutLoading: "결제 모듈 로딩…",
  checkoutConfirming: "결제 확인 중…",
  loginToSubscribe: "Notion으로 로그인 후 구독",
  refundNote: "결제 후 14일 이내 전액 환불, ",
  freeFeatures: [
    "노드 1,000개 (최근 수정순)",
    "워크스페이스 1개",
    "그래프 전 기능 (관계형 포함)",
    "수동 동기화",
    "핀·숨김은 세션 한정",
    "광고 표시",
  ],
  proFeatures: [
    "노드 무제한",
    "핀·숨김·필터 영구 저장",
    "자동 동기화",
    "이미지 내보내기",
    "광고 제거",
    "워크스페이스 3개+",
  ],

  // 해지 만류
  cancelTitle: "구독 관리",
  cancelSubtitle: "해지하면 다음 기능을 더 쓸 수 없습니다",
  cancelKeeps: [
    "노드 무제한 — Free는 최근 수정순 1,000개까지만 보입니다",
    "숨김과 핀 고정 영구 저장 — Free는 새로고침하면 초기화됩니다",
    "광고 없음 — Free는 화면 하단에 광고가 표시됩니다",
  ],
  cancelNote:
    "해지해도 이미 결제한 기간이 끝날 때까지는 Pro가 그대로 유지되고, 이후 추가 청구는 없습니다. 결제 후 14일 이내라면 전액 환불됩니다.",
  cancelKeep: "계속 사용하기",
  cancelContinue: "해지 진행",
  cancelReasonTitle: "떠나는 이유를 알려주세요",
  cancelReasonSubtitle: "선택 사항입니다. 답하지 않아도 해지할 수 있습니다",
  cancelReasons: [
    "가격이 부담됨",
    "필요한 기능이 없음",
    "생각보다 잘 안 쓰게 됨",
    "오류나 불편함이 있음",
    "다른 서비스를 쓰기로 함",
    "기타",
  ],
  cancelDetailPlaceholder: "더 하고 싶은 말 (선택)",
  skip: "건너뛰기",
  sendAndContinue: "보내고 계속",
  cancelPortalNote: "두 버튼 모두 Paddle 구독 관리 화면으로 이동합니다",

  // 로그인 화면
  tagline: "노션 워크스페이스의 페이지와 데이터베이스를 하나의 노드 그래프로 펼쳐 보는 도구",
  continueWithNotion: "Notion으로 계속하기",
  noSignup: "노션 계정으로 로그인합니다 — 별도 가입 없음",
  agreePrefix: "계속하면 ",
  agreeMiddle: "과 ",
  agreeSuffix: "에 동의하는 것입니다",
  loginError: (e: string) => `연결에 실패했습니다: ${e}`,
  seeWhatItDoes: "어떤 도구인지 보기 ↓",
  guide: "사용 가이드",
  faq: "자주 묻는 질문",
  contact: "문의",
  otherLanguage: "English",
  startWithNotion: "Notion으로 시작",

  // 쿠키 배너
  cookieBody:
    "Free 이용자에게 광고를 보여주기 위해 광고 쿠키를 사용합니다. 로그인 등 필수 쿠키는 동의 없이 항상 사용됩니다.",
  cookieAccept: "동의",
  cookieReject: "거부",

  // 면책
  disclaimer:
    "Notion-mind는 Notion Labs, Inc.와 무관한 독립 서비스입니다. Notion 및 Notion 로고는 Notion Labs, Inc.의 상표입니다.",
};

type Shape = typeof ko;

const en: Shape = {
  close: "Close",
  free: "Free",
  pro: "Pro",

  graphLoading: "Reading your workspace…",
  graphLoadingHint: "Large workspaces take a moment",
  graphReadingPages: (n: string) => `Reading ${n} pages…`,
  graphError: (e: string) => `Could not load the graph: ${e}`,
  graphRelogin: "Sign in again",
  graphEmpty: "Nothing to show yet",
  graphEmptyHint: "Check that you shared at least one page when connecting Notion",
  graphTruncated: (shown: string, total: string) => `Showing ${shown} of ${total} — `,
  graphTruncatedPro: "Pro shows everything",

  searchPlaceholder: "Search pages",
  filter: "Filter",
  comingSoon: "Coming soon",
  settings: "Settings",

  pageCountSuffix: (limit: string) => ` / ${limit} pages`,
  pageCountPages: " pages",
  unlimited: "Unlimited",
  seeAllWithPro: "See everything with Pro",
  viewPlans: "View plans",

  lightMode: "Light mode",
  darkMode: "Dark mode",
  zoom: "Zoom",
  zoomReset: "Reset to 100%",

  hideNode: "Hide",
  unpin: "Unpin",
  pin: "Pin",
  hiddenShowAll: (n: number) => `${n} hidden, show all`,
  hiddenListOpen: "View hidden",
  hiddenListClose: "Close hidden list",
  hiddenPanelTitle: (n: number) => `${n} hidden`,
  hiddenPanelEmpty: "Nothing is hidden",
  show: "Show",
  showAll: "Show all",

  database: "Database",
  page: "Page",
  detailParent: "Lives in",
  detailLoading: "Loading details…",
  detailError: (e: string) => `Could not load: ${e}`,
  detailProperties: "Properties",
  detailLastEdited: "Last edited",
  detailRelations: (n: number) => `Relations ${n}`,
  detailChildren: (n: number) => `Children ${n}`,
  detailBody: "Preview",
  detailMore: "…continue reading in Notion",
  openInNotion: "Open in Notion ↗",
  untitled: "Untitled",
  adSlot: "AD — ad slot (Free)",

  plan: "Plan",
  manageSubscription: "Manage subscription",
  manageSubscriptionHint: "Cancel, change card, receipts",
  connectedPages: "Connected pages",
  connectedPagesHint: "Pick which pages and databases the graph reads",
  change: "Change",
  manualSync: "Sync now",
  lastSync: (time: string) => `Last ${time}`,
  syncing: "Syncing…",
  syncNow: "↻ Sync",
  removeAds: "No ads",
  autoSync: "Automatic sync",
  language: "Language",
  logout: "Sign out",
  logoutConfirm: "Sign out?",
  legend: "Legend",
  legendDbChild: "Page in a database",
  legendPageChild: "Page or database inside a page",
  legendRelation: "Relation property",
  legendHover: "Links from the hovered node",
  terms: "Terms",
  privacy: "Privacy",
  refund: "Refunds",

  paywallTitle: "Upgrade to Pro",
  paywallSubtitle: "This feature is part of the Pro plan",
  paywallCta: (price: number) => `From $${price} a month — see plans`,
  later: "Not now",
  paywallBenefits: [
    "Unlimited nodes (Free stops at 1,000)",
    "Hidden nodes, pins and filters saved for good",
    "Automatic sync",
    "Image export",
    "No ads",
  ],

  backToGraph: "← Back to graph",
  pricingTitle: "Plans",
  pricingSubtitle: "Open up your whole workspace, with nothing held back",
  monthly: "Monthly",
  yearly: "Yearly",
  discountOff: (pct: number) => `Save ${pct}%`,
  currentPlan: "Current plan",
  recommended: "Recommended",
  perMonth: " / month",
  perYear: " / year",
  yearlyNote: (perMonth: string) => `$${perMonth} a month, billed once a year`,
  monthlyNote: "Renews monthly, cancel anytime",
  taxIncluded: ", VAT included",
  yearlySaving: (saving: number) => `Save $${saving} a year versus monthly`,
  subscribePro: "Subscribe to Pro",
  checkoutLoading: "Loading checkout…",
  checkoutConfirming: "Confirming payment…",
  loginToSubscribe: "Sign in with Notion to subscribe",
  refundNote: "Full refund within 14 days, ",
  freeFeatures: [
    "1,000 nodes (most recently edited)",
    "One workspace",
    "Every graph feature, relations included",
    "Manual sync",
    "Hidden nodes and pins last the session",
    "Ads shown",
  ],
  proFeatures: [
    "Unlimited nodes",
    "Hidden nodes, pins and filters saved for good",
    "Automatic sync",
    "Image export",
    "No ads",
    "Three or more workspaces",
  ],

  cancelTitle: "Manage subscription",
  cancelSubtitle: "Cancelling gives up the following",
  cancelKeeps: [
    "Unlimited nodes — Free shows only the 1,000 most recently edited",
    "Hidden nodes and pins saved for good — Free forgets them on refresh",
    "No ads — Free shows a banner at the bottom of the screen",
  ],
  cancelNote:
    "Cancelling keeps Pro running until the period you already paid for ends, and nothing is charged after that. Within 14 days of payment you get a full refund.",
  cancelKeep: "Keep Pro",
  cancelContinue: "Continue to cancel",
  cancelReasonTitle: "Tell us why you are leaving",
  cancelReasonSubtitle: "Optional. You can cancel without answering",
  cancelReasons: [
    "Too expensive",
    "Missing a feature I need",
    "I did not use it as much as I expected",
    "Bugs or rough edges",
    "Switching to something else",
    "Something else",
  ],
  cancelDetailPlaceholder: "Anything else you want to say (optional)",
  skip: "Skip",
  sendAndContinue: "Send and continue",
  cancelPortalNote: "Both buttons open the Paddle subscription page",

  tagline:
    "A tool that lays out the pages and databases of your Notion workspace as one node graph",
  continueWithNotion: "Continue with Notion",
  noSignup: "Sign in with your Notion account — no separate signup",
  agreePrefix: "By continuing you agree to the ",
  agreeMiddle: " and the ",
  agreeSuffix: "",
  loginError: (e: string) => `Connection failed: ${e}`,
  seeWhatItDoes: "See what it does ↓",
  guide: "Guide",
  faq: "FAQ",
  contact: "Contact",
  otherLanguage: "한국어",
  startWithNotion: "Start with Notion",

  cookieBody:
    "We use advertising cookies to show ads to Free users. Strictly necessary cookies, such as the sign-in session, are always used.",
  cookieAccept: "Accept",
  cookieReject: "Reject",

  disclaimer:
    "Notion-mind is an independent service, not affiliated with Notion Labs, Inc. Notion and the Notion logo are trademarks of Notion Labs, Inc.",
};

export const DICT: Record<Lang, Shape> = { ko, en };
export type Dict = Shape;

/** 법률 문서는 한국어판과 영문판 경로가 다르다 */
export function legalPath(lang: Lang, doc: "terms" | "privacy" | "refund"): string {
  return lang === "en" ? `/eu/${doc}` : `/${doc}`;
}
