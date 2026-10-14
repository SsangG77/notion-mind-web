import type { Metadata } from "next";
import { LANGS, langHref, type Lang } from "./i18n";

export const SITE_URL = "https://notion-mind.com";
export const SITE_NAME = "Notion-mind";

/** 색인 대상 공개 경로 — 접두사 없는 형태로 적는다. sitemap 과 메타데이터가 같은 목록을 쓴다 */
export const PUBLIC_PATHS = ["/", "/demo", "/guide", "/faq", "/pricing", "/terms", "/privacy", "/refund"] as const;
export type PublicPath = (typeof PUBLIC_PATHS)[number];

interface Meta {
  title: string;
  description: string;
}

// 검색 결과에 그대로 노출되는 문구. 화면 사전(i18n.ts)과 분리 — 쓰임과 길이 제약이 다르다.
const META: Record<Lang, Record<PublicPath, Meta>> = {
  en: {
    "/": {
      title: "Graph view for your Notion workspace",
      description:
        "See every Notion page and database as one connected graph — database membership, subpages and relation properties on a single screen, the way Obsidian graphs notes.",
    },
    "/demo": {
      title: "Live example",
      description:
        "Open an example Notion workspace as a graph without signing in. Projects, meetings, clients and releases drawn from their relation properties, with hover focus, pinning and the unconnected filter.",
    },
    "/guide": {
      title: "Guide",
      description:
        "From signing in with Notion to reading the graph, dragging and pinning nodes, the detail panel and the plans.",
    },
    "/faq": {
      title: "Common questions",
      description:
        "Questions about permissions, what the graph shows, large workspaces, pricing, refunds and where your Notion content is stored.",
    },
    "/pricing": {
      title: "Pricing",
      description:
        "Free covers 1,000 pages with ads. Pro removes the ads, stores hidden nodes and pins, and raises the limit — $7 a month or $48 a year, refundable for 14 days.",
    },
    "/terms": { title: "Terms of Service", description: "The terms that apply to using Notion-mind, including subscriptions, cancellation and the 14-day refund window." },
    "/privacy": { title: "Privacy Notice", description: "What Notion-mind reads from your workspace, what it stores, who processes it and the rights you have over it." },
    "/refund": { title: "Refund Policy", description: "Payments, including renewals, are fully refundable within 14 days, no reason required." },
  },
  ko: {
    "/": {
      title: "노션 워크스페이스를 그래프로 보기",
      description:
        "노션의 페이지와 데이터베이스를 하나의 연결된 그래프로 봅니다. 소속 관계, 하위 페이지, 관계형 속성을 한 화면에 — 옵시디언이 노트를 그리는 방식 그대로.",
    },
    "/demo": {
      title: "예시로 바로 보기",
      description:
        "로그인 없이 예시 노션 워크스페이스를 그래프로 열어 봅니다. 프로젝트, 회의, 고객, 릴리스가 관계형 속성으로 이어진 모습과 호버 포커스, 핀 고정, 연결 없는 노드 필터를 그대로 만져 볼 수 있습니다.",
    },
    "/guide": {
      title: "사용 가이드",
      description: "노션 로그인부터 그래프 읽는 법, 노드 드래그와 핀 고정, 상세 패널, 요금제까지.",
    },
    "/faq": {
      title: "자주 묻는 질문",
      description: "권한, 그래프에 보이는 것, 큰 워크스페이스, 요금과 환불, 노션 내용이 어디에 저장되는지에 대한 답.",
    },
    "/pricing": {
      title: "요금제",
      description:
        "Free 는 1,000개 페이지까지 광고와 함께. Pro 는 광고를 없애고 숨김과 핀을 저장하며 상한을 올립니다 — 월 $7 또는 연 $48, 14일 전액 환불.",
    },
    "/terms": { title: "이용약관", description: "Notion-mind 이용에 적용되는 약관. 구독과 해지, 14일 환불 기간을 포함합니다." },
    "/privacy": { title: "개인정보 처리방침", description: "Notion-mind 가 워크스페이스에서 읽는 것, 저장하는 것, 처리를 맡기는 곳과 이용자의 권리." },
    "/refund": { title: "환불정책", description: "갱신 결제를 포함해 결제 후 14일 안에는 이유를 묻지 않고 전액 환불합니다." },
  },
};

/**
 * 한 페이지의 메타데이터 — 제목, 설명, 자기 참조 canonical, 언어 대체 주소.
 * 구글은 언어마다 주소가 따로 있고 서로를 가리킬 것을 요구하므로 두 언어와 x-default 를 함께 적는다.
 */
export function pageMeta(lang: Lang, path: PublicPath): Metadata {
  const m = META[lang][path];
  const languages = Object.fromEntries([
    ...LANGS.map((l) => [l, langHref(l, path)]),
    ["x-default", path],
  ]) as Record<string, string>;
  return {
    title: path === "/" ? { absolute: `${m.title} — ${SITE_NAME}` } : m.title,
    description: m.description,
    alternates: { canonical: langHref(lang, path), languages },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: lang === "ko" ? "ko_KR" : "en_US",
      url: langHref(lang, path),
      title: `${m.title} — ${SITE_NAME}`,
      description: m.description,
    },
    twitter: { card: "summary_large_image", title: `${m.title} — ${SITE_NAME}`, description: m.description },
  };
}

/** 사이트 운영자 — 검색 결과에서 같은 주체임을 묶어 준다 */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  email: "sangjincha719@gmail.com",
} as const;

/** 문서 안쪽 페이지의 위치 — 검색 결과 경로 표시 */
export function breadcrumbJsonLd(lang: Lang, path: PublicPath) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}${langHref(lang, "/")}` },
      { "@type": "ListItem", position: 2, name: META[lang][path].title, item: `${SITE_URL}${langHref(lang, path)}` },
    ],
  };
}
