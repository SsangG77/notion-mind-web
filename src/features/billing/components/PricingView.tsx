"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";
import NotionDisclaimer from "@/components/NotionDisclaimer";
import { PRICE_IDS } from "@/lib/paddle";
import type { Plan } from "@/lib/billing";
import { usePaddle } from "../hooks/usePaddle";
import ManageSubscriptionButton from "./ManageSubscriptionButton";
import { useLang, useT } from "@/features/i18n/LangProvider";
import { langHref, legalPath } from "@/lib/i18n";
import { PRO_PRICE, YEARLY_DISCOUNT, YEARLY_SAVING } from "@/lib/pricing";
import { apiUrl } from "@/lib/apiUrl";

/** 요금제 화면 — Free/Pro 카드 + 월/연 토글 + Paddle 오버레이 체크아웃 */
export default function PricingView({ plan, workspaceId }: { plan: Plan; workspaceId?: string }) {
  const t = useT();
  const lang = useLang();
  const [yearly, setYearly] = useState(true);
  const { ready, openCheckout } = usePaddle();
  const router = useRouter();
  const params = useSearchParams();
  // 결제 직후: 웹훅이 몇 초 뒤 도착하므로 Pro 반영될 때까지 폴링 후 새로고침
  const [waiting, setWaiting] = useState(params.get("checkout") === "success" && plan === "free");
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const id = setInterval(async () => {
      const r = await fetch(apiUrl("/api/billing/status")).then((r) => r.json()).catch(() => null);
      if (r?.plan === "pro" || ++tries > 20) {
        clearInterval(id);
        setWaiting(false);
        router.replace(langHref(lang, "/pricing"));
        router.refresh();
      }
    }, 1500);
    return () => clearInterval(id);
  }, [waiting, router, lang]);
  const isPro = plan === "pro";
  const priceId = yearly ? PRICE_IDS.yearly : PRICE_IDS.monthly;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center px-6 py-10">
      <Link
        href={langHref(lang, "/graph")}
        className="self-start text-sm text-[#91908C] hover:text-[#37352F] dark:hover:text-[#EDEDEC]"
      >
        {t.backToGraph}
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">{t.pricingTitle}</h1>
      <p className="mt-1 text-sm text-[#91908C]">{t.pricingSubtitle}</p>

      {/* 월/연 토글 */}
      <div className={`${BLOCK} mt-6 flex overflow-hidden text-sm`}>
        <button
          data-testid="billing_monthly_button"
          onClick={() => setYearly(false)}
          className={`px-4 py-1.5 ${!yearly ? "bg-[#F4F3EF] font-semibold dark:bg-[#35342F]" : "text-[#91908C]"}`}
        >
          {t.monthly}
        </button>
        <span className="w-px bg-[#E9E9E7] dark:bg-[#2F2F2F]" />
        <button
          data-testid="billing_yearly_button"
          onClick={() => setYearly(true)}
          className={`px-4 py-1.5 ${yearly ? "bg-[#F4F3EF] font-semibold dark:bg-[#35342F]" : "text-[#91908C]"}`}
        >
          {t.yearly} <span className="text-[10px] text-[#2383E2]">{t.discountOff(YEARLY_DISCOUNT)}</span>
        </button>
      </div>

      <div className="mt-8 grid w-full gap-6 sm:grid-cols-2">
        {/* Free */}
        <div className={`${BLOCK} flex flex-col p-6`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Free</span>
            {!isPro && (
              <span className="rounded-full bg-[#F4F3EF] px-2.5 py-0.5 text-xs font-semibold dark:bg-[#35342F]">
                {t.currentPlan}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold">
            $0<span className="text-sm font-normal text-[#91908C]">{t.perMonth}</span>
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {t.freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[#91908C]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className={`${BLOCK} flex flex-col border-[#2383E2] p-6 shadow-[5px_5px_0_#2383E2] dark:border-[#2383E2] dark:shadow-[5px_5px_0_#1b5a99]`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Pro</span>
            <span className="rounded-full bg-[#2383E2] px-2.5 py-0.5 text-xs font-semibold text-white">
              {isPro ? t.currentPlan : t.recommended}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold" data-testid="pro_price">
            ${yearly ? PRO_PRICE.yearly : PRO_PRICE.monthly}
            <span className="text-sm font-normal text-[#91908C]">{yearly ? t.perYear : t.perMonth}</span>
            <span className="block text-xs font-normal text-[#91908C]">
              {yearly ? t.yearlyNote((PRO_PRICE.yearly / 12).toFixed(0)) : t.monthlyNote}
              {t.taxIncluded}
            </span>
            {yearly && (
              <span className="mt-1 inline-block rounded-full bg-[#2383E2] px-2 py-0.5 text-[10px] font-semibold text-white">
                {t.yearlySaving(YEARLY_SAVING)}
              </span>
            )}
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {t.proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[#2383E2]">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <ManageSubscriptionButton
              className={`${BLOCK_PRESS} mt-6 block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#F4F3EF] py-2.5 text-center text-sm font-semibold shadow-[3px_3px_0_#2E2C27] hover:bg-[#EDECE7] dark:border-black dark:bg-[#35342F] dark:shadow-[3px_3px_0_#000]`}
            >
              {t.manageSubscription}
            </ManageSubscriptionButton>
          ) : workspaceId ? (
            <button
              data-testid="pricing_subscribe_button"
              disabled={!ready || waiting}
              onClick={() => openCheckout(priceId, workspaceId, () => setWaiting(true))}
              className={`${BLOCK_PRESS} mt-6 w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#2E2C27] hover:bg-[#1b74cb] disabled:cursor-wait disabled:opacity-70 dark:border-black dark:shadow-[3px_3px_0_#000]`}
            >
              {waiting ? t.checkoutConfirming : ready ? t.subscribePro : t.checkoutLoading}
            </button>
          ) : (
            <a
              data-testid="pricing_login_button"
              href="/api/auth/login"
              className={`${BLOCK_PRESS} mt-6 block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-center text-sm font-semibold text-white shadow-[3px_3px_0_#2E2C27] hover:bg-[#1b74cb] dark:border-black dark:shadow-[3px_3px_0_#000]`}
            >
              {t.loginToSubscribe}
            </a>
          )}
          <p className="mt-3 text-center text-[10px] text-[#91908C]">
            {t.refundNote}
            <Link href={legalPath(lang, "refund")} className="underline">
              {t.refund}
            </Link>
          </p>
        </div>
      </div>

      <NotionDisclaimer className="mt-10 text-center" />
    </div>
  );
}
