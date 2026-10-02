"use client";

import Link from "next/link";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";
import { useLang, useT } from "@/features/i18n/LangProvider";
import { langHref } from "@/lib/i18n";
import { PRO_PRICE } from "@/lib/pricing";

/** Pro 페이월 — 노드 박스 디자인 모달. 결제는 요금제 화면에서 */
export default function PaywallModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const lang = useLang();
  return (
    <div
      data-testid="paywall_modal"
      className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className={`${BLOCK} w-80 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#E9E9E7] px-5 py-4 dark:border-[#2F2F2F]">
          <p className="text-base font-bold">{t.paywallTitle}</p>
          <p className="mt-0.5 text-xs text-[#91908C]">{t.paywallSubtitle}</p>
        </div>
        <ul className="space-y-2 px-5 py-4 text-sm">
          {t.paywallBenefits.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-[#2383E2]">✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="px-5 pb-5">
          <Link
            data-testid="paywall_subscribe_button"
            href={langHref(lang, "/pricing")}
            className={`${BLOCK_PRESS} block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-center text-sm font-semibold text-white shadow-[3px_3px_0_#2E2C27] hover:bg-[#1b74cb] dark:border-black dark:shadow-[3px_3px_0_#000]`}
          >
            {t.paywallCta(PRO_PRICE.monthly)}
          </Link>
          <button
            data-testid="paywall_close_button"
            onClick={onClose}
            className="mt-2 w-full py-1 text-center text-xs text-[#91908C] hover:underline"
          >
            {t.later}
          </button>
        </div>
        {/* Free 전용 광고 슬롯 — 네트워크 미정, 플레이스홀더 */}
        <div
          data-testid="ad_banner_paywall"
          className="flex h-[52px] items-center justify-center border-t border-[#E9E9E7] bg-[#F7F6F3] dark:border-[#2F2F2F] dark:bg-[#202020]"
        >
          <span className="text-xs tracking-wide text-[#91908C]">{t.adSlot}</span>
        </div>
      </div>
    </div>
  );
}
