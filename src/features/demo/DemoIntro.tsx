import Link from "next/link";
import { DICT, langHref, type Lang } from "@/lib/i18n";
import { DEMO_COPY } from "./copy";
import AdBanner from "@/components/AdBanner";

/** 예시 화면 아래 설명 — 그래프에서 무엇을 보고 있는지, 어떻게 만져 보는지 */
export default function DemoIntro({ lang }: { lang: Lang }) {
  const t = DICT[lang];
  const c = DEMO_COPY[lang];
  return (
    <section className="mx-auto w-full max-w-[860px] px-6 py-12 text-[#37352F] dark:text-[#EDEDEC]">
      <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
      <p className="mt-3 text-sm leading-7 text-[#555]">{c.lead}</p>

      {/* 리드문 바로 뒤 — 글을 조금만 읽어도 닿는다. 더 뒤로 보내면 스크롤을 한참 해야 나온다 */}
      <AdBanner variant="article" />

      {/* 위 그래프가 WebGL 로 그려져 검색 결과나 공유 카드에는 안 잡힌다 — 같은 장면을 이미지로도 둔다 */}
      <figure className="mt-8">
        <img
          src="/shots/graph-overview.png"
          alt={c.shotAlt}
          width={1280}
          height={540}
          className="w-full rounded-[10px] border-[1.5px] border-[#2E2C27] shadow-[5px_5px_0_#2E2C27] dark:border-black dark:shadow-[5px_5px_0_#000]"
        />
        <figcaption className="mt-2 text-xs text-[#91908C]">{c.shotCaption}</figcaption>
      </figure>

      {c.sections.map((s) => (
        <div key={s.heading}>
          <div className="mt-9">
            <h2 className="text-base font-semibold">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-2 text-sm leading-7 text-[#555]">
                {p}
              </p>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#E9E9E7] pt-6 text-sm dark:border-[#2F2F2F]">
        <a
          href="/api/auth/google"
          className="rounded-lg bg-[#2383E2] px-5 py-2 font-semibold text-white hover:bg-[#1b74cb]"
        >
          {c.cta}
        </a>
        <Link href={langHref(lang, "/guide")} className="text-[#2383E2] underline">
          {t.guide}
        </Link>
        <Link href={langHref(lang, "/pricing")} className="text-[#2383E2] underline">
          {t.pricingTitle}
        </Link>
      </div>
    </section>
  );
}
