import Link from "next/link";
import { LANDING } from "../content";
import { DEMO_COPY } from "@/features/demo/copy";
import { langHref, type Lang } from "@/lib/i18n";
import { PRO_PRICE, YEARLY_PER_MONTH } from "@/lib/pricing";

/**
 * 홈 하단 소개 — 서버 렌더 텍스트. 광고 심사와 검색 크롤러는 로그인 뒤 그래프를 못 보므로 여기서 서비스를 설명한다.
 *
 * 바로 위에 예시 그래프가 실제로 떠 있으므로(`DemoGraphClient`), 설명은 그 화면을 가리키는 순서로 간다:
 * 무엇이 문제인가 → 지금 보이는 선과 호버와 필터가 무엇인가 → 자기 워크스페이스에서는 어떻게 되는가 → 요금 → FAQ.
 * ⚠️ 기능을 카드로 다시 나열하지 않는다 — 예전에는 `/demo` 의 설명과 홈의 기능 카드가 같은 내용을 두 번 적고 있었고,
 * 구글은 "원본 가치를 더하지 않은 중복 콘텐츠"를 가치 없는 콘텐츠로 본다(adsense/answer/10015918).
 */
const H2 = "text-xl font-bold tracking-tight";
const CARD =
  "rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#FDFDFC] p-5 shadow-[3px_3px_0_#2E2C27] dark:border-black dark:bg-[#2B2A27] dark:shadow-[3px_3px_0_#000]";
const BODY = "mt-2 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]";

export default function LandingContent({ lang }: { lang: Lang }) {
  const c = LANDING[lang];
  const d = DEMO_COPY[lang];
  // 마지막 절("자기 워크스페이스를 열면")은 아래 "작동 방식"과 FAQ 가 같은 내용을 다룬다 — 빼고 그쪽에 맡긴다
  const graphSections = d.sections.slice(0, -1);

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

      {/* 위 그래프를 그대로 가리키는 설명 — 예전 /demo 페이지의 본문 */}
      <section data-testid="landing_graph_guide">
        <h2 className={H2}>{d.title}</h2>
        <p className="mt-3 leading-relaxed">{d.lead}</p>
        {graphSections.map((s) => (
          <div key={s.heading} className="mt-8">
            <h3 className="font-semibold">{s.heading}</h3>
            {s.body.map((b) => (
              <p key={b} className={BODY}>
                {b}
              </p>
            ))}
          </div>
        ))}
      </section>

      <section data-testid="landing_steps">
        <h2 className={H2}>{c.stepsTitle}</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {c.steps.map((s) => (
            <li key={s.n} className={CARD}>
              <span className="text-xs font-bold text-[#2383E2]">{s.n}</span>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className={BODY}>{s.body}</p>
            </li>
          ))}
        </ol>
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
            <p className={BODY}>{c.freeBody}</p>
          </div>
          <div className={`${CARD} border-[#2383E2] shadow-[3px_3px_0_#2383E2] dark:border-[#2383E2]`}>
            <h3 className="font-semibold">{c.proName}</h3>
            <p className="mt-1 text-2xl font-bold">
              ${YEARLY_PER_MONTH}
              <span className="text-sm font-normal text-[#91908C]">{c.proUnit(PRO_PRICE.yearly)}</span>
            </p>
            <p className={BODY}>{c.proBody}</p>
          </div>
        </div>
        <p className="mt-3 text-sm">
          <Link href={langHref(lang, "/pricing")} className="text-[#2383E2] underline">
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
          <Link href={langHref(lang, "/faq")} className="text-[#2383E2] underline">
            {c.faqMore}
          </Link>
          {" , "}
          <Link href={langHref(lang, "/guide")} className="text-[#2383E2] underline">
            {c.guideMore}
          </Link>
        </p>
      </section>
    </div>
  );
}
