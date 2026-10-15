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
  /**
   * page    = 화면 하단 가로 띠
   * panel   = 노드 상세 패널 하단(폭이 좁고 더 낮다)
   * article = 글 사이에 끼우는 카드(본문 폭에 맞춤)
   */
  variant?: "page" | "panel" | "article";
}) {
  const t = useT();
  if (variant === "article") {
    return (
      <aside
        data-testid="ad_banner_article"
        /* ⚠️ 글처럼 보이게 만들지 않는다 — 구글: "may not implement Google ads in a manner that
           disguises the ads in any way. This includes formatting neighboring content to look
           similar to the ads."(answer/1346295) 그래서 테두리와 라벨을 남긴다 */
        className="my-10 rounded-[10px] border border-dashed border-[#D6D5D1] bg-[#FBFBFA] px-4 py-5 dark:border-[#3A3A3A] dark:bg-[#1C1C1C]"
      >
        <span className="block text-[10px] uppercase tracking-widest text-[#A3A29E]">
          {t.adLabel}
        </span>
        <div className="mt-3 flex h-[90px] items-center justify-center">
          <span className="text-xs tracking-wide text-[#91908C]">{t.adSlot}</span>
        </div>
      </aside>
    );
  }
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
