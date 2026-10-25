import { PRICING_COPY } from "../pricingCopy";
import type { Lang } from "@/lib/i18n";

/** 요금제 카드 아래 설명 — 카드가 숫자만 보여 주므로 그 숫자가 무슨 뜻인지 여기서 답한다 */
export default function PricingDetails({ lang }: { lang: Lang }) {
  const c = PRICING_COPY[lang];
  return (
    <section
      data-testid="pricing_details"
      className="mx-auto w-full max-w-3xl px-6 pb-16 text-[#37352F] dark:text-[#EDEDEC]"
    >
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <dl className="mt-6 space-y-7">
        {c.blocks.map((b) => (
          <div key={b.heading}>
            <dt className="font-semibold">{b.heading}</dt>
            {b.body.map((p) => (
              <dd key={p} className="mt-2 text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">
                {p}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </section>
  );
}
