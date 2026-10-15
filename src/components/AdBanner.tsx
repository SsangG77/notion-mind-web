"use client";
import { useT } from "@/features/i18n/LangProvider";

/**
 * 광고 자리. 지금은 플레이스홀더다.
 *
 * ⚠️ AdSense 승인이 나면 **이 파일 하나만** 실제 광고 단위(`<ins class="adsbygoogle" data-ad-slot=...>`)로
 * 바꾸면 홈, /demo, /guide, /faq, /pricing, /graph, 노드 상세 패널이 한 번에 바뀐다.
 * 자리마다 따로 심지 말 것.
 */
export default function AdBanner({
  variant = "page",
}: {
  /** page = 화면 하단 가로 배너 / panel = 노드 상세 패널 하단(폭이 좁고 더 낮다) */
  variant?: "page" | "panel";
}) {
  const t = useT();
  const panel = variant === "panel";
  return (
    <div
      data-testid={panel ? "ad_banner_detail" : "ad_banner_bottom"}
      className={`flex ${panel ? "h-[52px]" : "h-[60px] w-full"} shrink-0 items-center justify-center border-t border-[#E9E9E7] bg-[#F7F6F3] dark:border-[#2F2F2F] dark:bg-[#202020]`}
    >
      <span className="text-xs tracking-wide text-[#91908C]">{t.adSlot}</span>
    </div>
  );
}
