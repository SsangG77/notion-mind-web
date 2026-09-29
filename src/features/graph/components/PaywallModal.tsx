"use client";

import Link from "next/link";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

const BENEFITS = [
  "노드 무제한 (Free는 1,000개)",
  "핀·숨김·필터 영구 저장",
  "자동 동기화",
  "이미지 내보내기",
  "광고 제거",
];

/** Pro 페이월 — 노드 박스 디자인 모달. 결제는 요금제 화면에서 */
export default function PaywallModal({ onClose }: { onClose: () => void }) {
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
          <p className="text-base font-bold">Pro로 업그레이드</p>
          <p className="mt-0.5 text-xs text-[#91908C]">이 기능은 Pro 요금제에서 제공됩니다</p>
        </div>
        <ul className="space-y-2 px-5 py-4 text-sm">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-[#2383E2]">✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="px-5 pb-5">
          <Link
            data-testid="paywall_subscribe_button"
            href="/pricing"
            className={`${BLOCK_PRESS} block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-center text-sm font-semibold text-white shadow-[3px_3px_0_#2E2C27] hover:bg-[#1b74cb] dark:border-black dark:shadow-[3px_3px_0_#000]`}
          >
            월 $7 부터 — 요금제 보기
          </Link>
          <button
            data-testid="paywall_close_button"
            onClick={onClose}
            className="mt-2 w-full py-1 text-center text-xs text-[#91908C] hover:underline"
          >
            나중에
          </button>
        </div>
        {/* Free 전용 광고 슬롯 — 네트워크 미정, 플레이스홀더 */}
        <div
          data-testid="ad_banner_paywall"
          className="flex h-[52px] items-center justify-center border-t border-[#E9E9E7] bg-[#F7F6F3] dark:border-[#2F2F2F] dark:bg-[#202020]"
        >
          <span className="text-xs tracking-wide text-[#91908C]">AD — 광고 영역 (Free)</span>
        </div>
      </div>
    </div>
  );
}
