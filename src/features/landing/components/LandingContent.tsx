import Link from "next/link";
import { LANDING } from "../content";
import type { Lang } from "@/lib/i18n";
import { PRO_PRICE } from "@/lib/pricing";

// 홈 하단 소개 — 서버 렌더 텍스트. 광고 심사와 검색 크롤러는 로그인 뒤 그래프를 못 보므로 여기서 서비스를 설명한다
const H2 = "text-xl font-bold tracking-tight";
const CARD =
  "rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#FDFDFC] p-5 shadow-[3px_3px_0_#2E2C27] dark:border-black dark:bg-[#2B2A27] dark:shadow-[3px_3px_0_#000]";

export default function LandingContent({ lang }: { lang: Lang }) {
  const c = LANDING[lang];
  const perMonth = Math.round(PRO_PRICE.yearly / 12);
  return (
    <div className="mx-auto max-w-[880px] space-y-16 px-6 py-16 text-[#37352F] dark:text-[#EDEDEC]">
      <section data-testid="landing_intro">
        <h2 className={H2}>{c.introTitle}</h2>
        {c.introBody.map((p) => (
          <p key={p} className="mt-3 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <section data-testid="landing_steps">
        <h2 className={H2}>{c.stepsTitle}</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {c.steps.map((s) => (
            <li key={s.n} className={CARD}>
              <span className="text-xs font-bold text-[#2383E2]">{s.n}</span>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section data-testid="landing_features">
        <h2 className={H2}>{c.featuresTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {c.features.map((f) => (
            <li key={f.title} className={CARD}>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section data-testid="landing_use_cases">
        <h2 className={H2}>{c.useCasesTitle}</h2>
        <ul className="mt-5 space-y-4">
          {c.useCases.map((u) => (
            <li key={u.title}>
              <h3 className="font-semibold">{u.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">{u.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section data-testid="landing_pricing">
        <h2 className={H2}>{c.pricingTitle}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className={CARD}>
            <h3 className="font-semibold">{c.freeName}</h3>
            <p className="mt-1 text-2xl font-bold">$0</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">
              {c.freeBody}
            </p>
          </div>
          <div className={`${CARD} border-[#2383E2] shadow-[3px_3px_0_#2383E2] dark:border-[#2383E2]`}>
            <h3 className="font-semibold">{c.proName}</h3>
            <p className="mt-1 text-2xl font-bold">
              ${perMonth}
              <span className="text-sm font-normal text-[#91908C]">{c.proUnit(PRO_PRICE.yearly)}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">
              {c.proBody}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/pricing" className="text-[#2383E2] underline">
            {c.pricingMore}
          </Link>
        </p>
      </section>

      <section data-testid="landing_faq">
        <h2 className={H2}>{c.faqTitle}</h2>
        <dl className="mt-5 space-y-5">
          {c.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm">
          <Link href="/faq" className="text-[#2383E2] underline">
            {c.faqMore}
          </Link>
          {" , "}
          <Link href="/guide" className="text-[#2383E2] underline">
            {c.guideMore}
          </Link>
        </p>
      </section>
    </div>
  );
}
