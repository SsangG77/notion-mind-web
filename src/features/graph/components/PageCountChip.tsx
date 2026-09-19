"use client";

import Link from "next/link";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

const FREE_LIMIT = 1000;

/**
 * 연결된 페이지 수 — 우상단. Free 한도를 계속 체감시켜 Pro 전환을 유도하고,
 * 누르면 요금제 화면으로 간다.
 */
export default function PageCountChip({
  nodeCount,
  truncated,
}: {
  nodeCount: number;
  truncated: boolean;
}) {
  if (nodeCount === 0) return null;
  const over = truncated || nodeCount >= FREE_LIMIT * 0.8;

  return (
    <Link
      data-testid="page_count_chip"
      href="/pricing"
      className={`${BLOCK} ${BLOCK_PRESS} absolute right-3 top-3 z-10 flex h-9 items-center gap-2.5 px-3`}
      title="요금제 보기"
    >
      <span className="flex flex-col justify-center gap-[5px] leading-none">
        <span className="text-[11px]">
          <b>{nodeCount.toLocaleString()}</b>
          <span className="text-[#91908C]"> / {FREE_LIMIT.toLocaleString()} 페이지</span>
        </span>
        <span className="block h-1 w-28 overflow-hidden rounded-full bg-[#E9E9E7] dark:bg-black">
          <span
            className={`block h-full rounded-full ${over ? "bg-[#D44C47]" : "bg-[#2383E2]"}`}
            style={{ width: `${Math.min(100, (nodeCount / FREE_LIMIT) * 100)}%` }}
          />
        </span>
      </span>
      {truncated && <span className="text-[10px] font-bold text-[#2383E2]">Pro로 전체 보기</span>}
    </Link>
  );
}
