import type { Metadata } from "next";
import { LANGS, langHref, type Lang } from "./i18n";

export const SITE_URL = "https://notion-mind.com";
export const SITE_NAME = "Notion-mind";

/** 색인 대상 공개 경로 — 접두사 없는 형태로 적는다. sitemap 과 메타데이터가 같은 목록을 쓴다 */
export const PUBLIC_PATHS = [
  "/",
  "/guide",
  "/faq",
  "/pricing",
  "/blog",
  "/blog/notion-mind-map",
  "/blog/notion-graph-view",
  "/blog/notion-vs-obsidian-graph-view",
  "/blog/notion-relation-property",
  "/blog/how-to-make-mind-map-in-notion",
  "/blog/notion-backlinks",
  "/blog/notion-second-brain",
  "/blog/notion-knowledge-graph",
  "/terms",
  "/privacy",
  "/refund",
] as const;
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
    "/blog": {
      title: "Posts",
      description:
        "Guides and answers about Notion's views, links between pages, and seeing a workspace as a graph.",
    },
    "/blog/notion-mind-map": {
      title: "Does Notion have mind maps?",
      description:
        "Notion has no mind map view. What to use for mapping new ideas, and how to see the pages you already have as a map without drawing one.",
    },
    "/blog/notion-graph-view": {
      title: "Does Notion have a graph view?",
      description:
        "Notion has no graph view like Obsidian's. What its sidebar, backlinks, relations and database views show instead, the workarounds, and where each stops.",
    },
    "/blog/notion-vs-obsidian-graph-view": {
      title: "Notion vs Obsidian: the graph view gap",
      description:
        "Notion vs Obsidian compared: where notes live, offline use, databases, collaboration and the graph view only Obsidian has. Plus what to do if you stay on Notion.",
    },
    "/blog/notion-relation-property": {
      title: "Notion relation vs rollup: what each one shows",
      description:
        "A relation ties pages together; a rollup brings a value back across it. Setup steps, one-way vs two-way, common snags, and what neither property shows.",
    },
    "/blog/how-to-make-mind-map-in-notion": {
      title: "How to make a mind map in Notion",
      description:
        "Two ways to make a mind map in Notion: nested toggles, or an embedded Miro or Excalidraw board. Steps, tips, a comparison table, and when to use which.",
    },
    "/blog/notion-backlinks": {
      title: "Notion backlinks: where they show and why not",
      description:
        "What creates a Notion backlink, what does not, and four reasons one is missing. When to use a relation instead, and the one thing the list cannot show.",
    },
    "/blog/notion-second-brain": {
      title: "Notion second brain: where it stalls",
      description:
        "A Notion second brain stalls when you can no longer see what is tied to what. Why PARA does not fix it, habits that help, and how to see the links you have.",
    },
    "/blog/notion-knowledge-graph": {
      title: "Building a knowledge graph in Notion",
      description:
        "How to build a zettelkasten-style knowledge graph in Notion with a Notes database and relations, the one thing Notion lacks, and how to read the result.",
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
    "/blog": {
      title: "게시글",
      description: "노션의 보기, 페이지 사이의 연결, 워크스페이스를 그래프로 보는 것에 대한 정리와 답.",
    },
    "/blog/notion-mind-map": {
      title: "노션에 마인드맵 기능이 있나요?",
      description:
        "노션에는 마인드맵 보기가 없습니다. 새 생각을 그릴 때 쓰는 방법 두 가지와, 이미 써 둔 페이지를 그리지 않고 지도로 보는 방법.",
    },
    "/blog/notion-graph-view": {
      title: "노션에 그래프뷰가 있나요?",
      description:
        "노션에는 옵시디언 같은 그래프뷰가 없습니다. 사이드바, 백링크, 관계형, 데이터베이스 보기가 대신 보여 주는 것과 우회 방법, 각각의 한계.",
    },
    "/blog/notion-vs-obsidian-graph-view": {
      title: "노션 vs 옵시디언, 그래프뷰 차이",
      description:
        "노션과 옵시디언 비교. 노트가 있는 곳, 오프라인, 데이터베이스, 함께 쓰기, 그리고 옵시디언에만 있는 그래프뷰. 노션에 남는다면 할 수 있는 것.",
    },
    "/blog/notion-relation-property": {
      title: "노션 관계형 속성, 롤업과 뭐가 다른가요?",
      description:
        "관계형은 페이지를 잇고, 롤업은 그 연결을 건너 값을 가져옵니다. 만드는 순서, 한 방향과 양방향, 자주 막히는 지점, 둘 다 못 보여 주는 것.",
    },
    "/blog/how-to-make-mind-map-in-notion": {
      title: "노션에서 마인드맵 만드는 법",
      description:
        "노션에서 마인드맵을 만드는 두 가지 방법. 토글 중첩과 Miro, Excalidraw 임베드. 순서, 요령, 비교표, 어느 쪽을 언제 쓰는지.",
    },
    "/blog/notion-backlinks": {
      title: "노션 백링크, 어디서 보고 왜 안 보이나",
      description:
        "노션 백링크가 생기는 경우와 안 생기는 경우, 안 보이는 이유 넷. 관계형을 써야 할 때와 백링크 목록이 못 보여 주는 한 가지.",
    },
    "/blog/notion-second-brain": {
      title: "노션 세컨드 브레인, 몇 달 뒤에 막히는 지점",
      description:
        "노션 세컨드 브레인은 무엇이 무엇과 엮였는지 안 보일 때 막힙니다. PARA 로 안 풀리는 이유, 노션 안에서 되는 습관, 이미 있는 연결을 보는 방법.",
    },
    "/blog/notion-knowledge-graph": {
      title: "노션으로 지식 그래프 만들기",
      description:
        "노트 데이터베이스와 관계형으로 노션에 제텔카스텐식 지식 그래프를 만드는 순서, 노션에 빠진 한 가지, 만든 그래프를 읽는 방법.",
    },
    "/terms": { title: "이용약관", description: "Notion-mind 이용에 적용되는 약관. 구독과 해지, 14일 환불 기간을 포함합니다." },
    "/privacy": { title: "개인정보 처리방침", description: "Notion-mind 가 워크스페이스에서 읽는 것, 저장하는 것, 처리를 맡기는 곳과 이용자의 권리." },
    "/refund": { title: "환불정책", description: "갱신 결제를 포함해 결제 후 14일 안에는 이유를 묻지 않고 전액 환불합니다." },
  },
};

/** 글 목록에 나오는 순서 — 새 글은 맨 앞에 넣는다. date 는 공개일(화면 표시용), updated 는 본문을 마지막으로 고친 날(sitemap lastmod 와 구조화 데이터의 dateModified — 본문을 고치면 같이 고친다) */
export const BLOG_POSTS = [
  { path: "/blog/notion-knowledge-graph", updated: "2026-11-14", date: "2026-11-06" },
  { path: "/blog/notion-second-brain", updated: "2026-11-14", date: "2026-11-05" },
  { path: "/blog/notion-backlinks", updated: "2026-11-14", date: "2026-11-04" },
  { path: "/blog/how-to-make-mind-map-in-notion", updated: "2026-11-14", date: "2026-11-04" },
  { path: "/blog/notion-relation-property", updated: "2026-11-14", date: "2026-11-03" },
  { path: "/blog/notion-vs-obsidian-graph-view", updated: "2026-11-14", date: "2026-11-01" },
  { path: "/blog/notion-graph-view", updated: "2026-11-14", date: "2026-11-01" },
  { path: "/blog/notion-mind-map", updated: "2026-11-14", date: "2026-11-01" },
] as const satisfies
  readonly { path: PublicPath; date: string; updated: string }[];

/** 글 공개일 — 화면에 쓰는 형식으로. 목록과 글 본문이 같은 값을 쓴다 */
export function postDate(lang: Lang, path: PublicPath) {
  const post = BLOG_POSTS.find((p) => p.path === path);
  if (!post) return null;
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.date));
}

/** 목록 화면이 제목과 요약을 가져다 쓴다 — 검색 결과와 같은 문구를 쓰려고 한 곳에 둔다 */
export const metaOf = (lang: Lang, path: PublicPath): Meta => META[lang][path];

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

/**
 * 문서 안쪽 페이지의 위치 — 검색 결과 경로 표시.
 * 글(`/blog/...`)은 목록을 중간에 끼운다 — 주소 계층과 표시가 어긋나면 안 된다.
 */
export function breadcrumbJsonLd(lang: Lang, path: PublicPath) {
  const trail: PublicPath[] = path.startsWith("/blog/") ? ["/blog", path] : [path];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}${langHref(lang, "/")}` },
      ...trail.map((p, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: META[lang][p].title,
        item: `${SITE_URL}${langHref(lang, p)}`,
      })),
    ],
  };
}

/**
 * 글 한 편의 구조화 데이터 — 공개일과 수정일을 검색 쪽에 알린다.
 * 글쓴이는 운영 주체(Organization)로 적는다 — 개인 이름은 공개하지 않는다.
 */
export function blogPostingJsonLd(lang: Lang, path: PublicPath) {
  const post = BLOG_POSTS.find((p) => p.path === path);
  if (!post) return null;
  const url = `${SITE_URL}${langHref(lang, path)}`;
  const org = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: META[lang][path].title,
    description: META[lang][path].description,
    inLanguage: lang,
    datePublished: post.date,
    dateModified: post.updated,
    mainEntityOfPage: url,
    url,
    image: `${url}/opengraph-image`,
    author: org,
    publisher: org,
  };
}
