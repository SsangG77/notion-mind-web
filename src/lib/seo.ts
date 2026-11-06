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
        "Short answers about Notion's views, links between pages, and seeing a workspace as a graph.",
    },
    "/blog/notion-mind-map": {
      title: "Does Notion have mind maps?",
      description:
        "Notion has no mind map or graph view — its database views are table, board, timeline, calendar, list, gallery and chart. The three options that remain, and when each one is the right answer.",
    },
    "/blog/notion-graph-view": {
      title: "Does Notion have a graph view?",
      description:
        "Notion has no graph view like Obsidian's and no official plugin that adds one. What its database views actually show, and how to see the links between your pages instead.",
    },
    "/blog/notion-vs-obsidian-graph-view": {
      title: "Notion vs Obsidian: the graph view gap",
      description:
        "Only Obsidian has a graph view; Notion does not. What that screen actually shows, why the choice splits on it, and how to get the same picture of a Notion workspace without moving.",
    },
    "/blog/notion-relation-property": {
      title: "Notion relation property vs rollup: what each one shows",
      description:
        "A relation ties pages together; a rollup walks across the tie and brings a value back. One-way vs two-way, where people get stuck, and the one thing neither property can show.",
    },
    "/blog/how-to-make-mind-map-in-notion": {
      title: "How to make a mind map in Notion",
      description:
        "Notion has no mind map feature, so there are two ways: nested toggles, or an embedded Miro or Excalidraw board. The steps for each, what each one cannot do, and what to use for pages you already wrote.",
    },
    "/blog/notion-backlinks": {
      title: "Notion backlinks: where they show, and why they sometimes don't",
      description:
        "Backlinks list the pages that point at the one you are on, above the title. The three reasons one is missing — nothing links yet, it is a relation, or permissions — and the one thing the list cannot show.",
    },
    "/blog/notion-second-brain": {
      title: "Notion second brain: where it stalls a few months in",
      description:
        "A second brain in Notion builds fine and stalls later, when you can no longer see what is tied to what. Why PARA does not solve that, the three symptoms, and how to see the links you already have.",
    },
    "/blog/notion-knowledge-graph": {
      title: "Building a knowledge graph in Notion",
      description:
        "A zettelkasten and a knowledge graph both want the shape linked notes make, not a single note. What mentions, relations and subpages already give you in Notion, the one thing missing, and how to see it.",
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
      description: "노션의 보기, 페이지 사이의 연결, 워크스페이스를 그래프로 보는 것에 대한 짧은 답.",
    },
    "/blog/notion-mind-map": {
      title: "노션에 마인드맵 기능이 있나요?",
      description:
        "노션에는 마인드맵 뷰도 그래프 뷰도 없습니다. 지원하는 보기는 표, 보드, 타임라인, 캘린더, 목록, 갤러리, 차트 일곱 가지뿐. 남은 방법 세 가지와 어느 쪽이 맞는지.",
    },
    "/blog/notion-graph-view": {
      title: "노션에 그래프뷰가 있나요?",
      description:
        "노션에는 옵시디언 같은 그래프뷰도, 그 기능을 더해 주는 공식 플러그인도 없습니다. 노션의 보기가 실제로 보여 주는 것과, 페이지 사이의 연결을 한 화면에서 보는 방법.",
    },
    "/blog/notion-vs-obsidian-graph-view": {
      title: "노션 vs 옵시디언, 그래프뷰 차이",
      description:
        "그래프뷰는 옵시디언에만 있고 노션에는 없습니다. 그 화면이 실제로 보여 주는 것, 선택이 갈리는 지점, 노션을 옮기지 않고 같은 그림을 보는 방법.",
    },
    "/blog/notion-relation-property": {
      title: "노션 관계형 속성, 롤업과 뭐가 다른가요?",
      description:
        "관계형은 페이지를 잇고 롤업은 그 연결을 건너가 값을 가져옵니다. 한 방향과 양방향의 차이, 헷갈리는 지점, 두 속성 다 못 보여 주는 한 가지.",
    },
    "/blog/how-to-make-mind-map-in-notion": {
      title: "노션에서 마인드맵 만드는 법",
      description:
        "노션에는 마인드맵 기능이 없어 토글로 흉내 내거나 Miro, Excalidraw 를 임베드하는 두 가지 방법뿐입니다. 각각의 순서와 한계, 이미 써 둔 페이지는 어떻게 보는지.",
    },
    "/blog/notion-backlinks": {
      title: "노션 백링크, 어디서 보고 왜 안 보이나",
      description:
        "백링크는 이 페이지를 가리키는 페이지 목록이고 제목 위에 뜹니다. 안 보이는 이유 셋 — 아직 링크가 없음, 관계형임, 권한 — 과 그 목록이 못 보여 주는 한 가지.",
    },
    "/blog/notion-second-brain": {
      title: "노션 세컨드 브레인, 몇 달 뒤에 막히는 지점",
      description:
        "노션 세컨드 브레인은 잘 만들어지고 몇 달 뒤에 막힙니다. 무엇이 무엇과 엮였는지 안 보이기 때문. PARA 로 안 풀리는 이유, 세 가지 증상, 이미 있는 연결을 보는 방법.",
    },
    "/blog/notion-knowledge-graph": {
      title: "노션으로 지식 그래프 만들기",
      description:
        "제텔카스텐과 지식 그래프가 원하는 건 노트 한 장이 아니라 이어진 모양입니다. 노션의 멘션, 관계형, 하위 페이지로 이미 되는 것과 빠진 것 하나, 그걸 보는 방법.",
    },
    "/terms": { title: "이용약관", description: "Notion-mind 이용에 적용되는 약관. 구독과 해지, 14일 환불 기간을 포함합니다." },
    "/privacy": { title: "개인정보 처리방침", description: "Notion-mind 가 워크스페이스에서 읽는 것, 저장하는 것, 처리를 맡기는 곳과 이용자의 권리." },
    "/refund": { title: "환불정책", description: "갱신 결제를 포함해 결제 후 14일 안에는 이유를 묻지 않고 전액 환불합니다." },
  },
};

/** 글 목록에 나오는 순서 — 새 글은 맨 앞에 넣는다. 날짜는 공개일(화면 표시용) */
export const BLOG_POSTS = [
  { path: "/blog/notion-knowledge-graph", date: "2026-11-06" },
  { path: "/blog/notion-second-brain", date: "2026-11-05" },
  { path: "/blog/notion-backlinks", date: "2026-11-04" },
  { path: "/blog/how-to-make-mind-map-in-notion", date: "2026-11-04" },
  { path: "/blog/notion-relation-property", date: "2026-11-03" },
  { path: "/blog/notion-vs-obsidian-graph-view", date: "2026-11-01" },
  { path: "/blog/notion-graph-view", date: "2026-11-01" },
  { path: "/blog/notion-mind-map", date: "2026-11-01" },
] as const satisfies
  readonly { path: PublicPath; date: string }[];

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
