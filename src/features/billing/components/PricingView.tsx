"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

const FREE_FEATURES = [
  "노드 1,000개 (최근 수정순)",
  "워크스페이스 1개",
  "그래프 전 기능 (관계형 포함)",
  "수동 동기화",
  "핀·숨김은 세션 한정",
  "광고 표시",
];

const PRO_FEATURES = [
  "노드 무제한",
  "핀·숨김·필터 영구 저장",
  "자동 동기화",
  "이미지 내보내기",
  "광고 제거",
  "워크스페이스 3개+",
];

/** 요금제 화면 — Free/Pro 카드 + 월/연 토글. 결제 연동 전 스켈레톤 */
export default function PricingView() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center px-6 py-10">
      <Link
        href="/graph"
        className="self-start text-sm text-[#91908C] hover:text-[#37352F] dark:hover:text-[#EDEDEC]"
      >
        ← 그래프로
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">요금제</h1>
      <p className="mt-1 text-sm text-[#91908C]">워크스페이스 전체를 제한 없이 펼쳐보세요</p>

      {/* 월/연 토글 */}
      <div className={`${BLOCK} mt-6 flex overflow-hidden text-sm`}>
        <button
          data-testid="billing_monthly_button"
          onClick={() => setYearly(false)}
          className={`px-4 py-1.5 ${!yearly ? "bg-[#F4F3EF] font-semibold dark:bg-[#35342F]" : "text-[#91908C]"}`}
        >
          월간
        </button>
        <span className="w-px bg-[#E9E9E7] dark:bg-[#2F2F2F]" />
        <button
          data-testid="billing_yearly_button"
          onClick={() => setYearly(true)}
          className={`px-4 py-1.5 ${yearly ? "bg-[#F4F3EF] font-semibold dark:bg-[#35342F]" : "text-[#91908C]"}`}
        >
          연간 <span className="text-[10px] text-[#2383E2]">할인 예정</span>
        </button>
      </div>

      <div className="mt-8 grid w-full gap-6 sm:grid-cols-2">
        {/* Free */}
        <div className={`${BLOCK} flex flex-col p-6`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Free</span>
            <span className="rounded-full bg-[#F4F3EF] px-2.5 py-0.5 text-xs font-semibold dark:bg-[#35342F]">
              현재 사용 중
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            ₩0<span className="text-sm font-normal text-[#91908C]"> / 월</span>
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {FREE_FEATURES.map((f) => (
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
              추천
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            가격 공개 예정
            <span className="block text-xs font-normal text-[#91908C]">
              {yearly ? "연간 결제 — 할인 적용 예정" : "월간 결제"}
            </span>
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[#2383E2]">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            data-testid="pricing_subscribe_button"
            disabled
            className={`${BLOCK_PRESS} mt-6 w-full cursor-not-allowed rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-sm font-semibold text-white opacity-70 shadow-[3px_3px_0_#2E2C27] dark:border-black dark:shadow-[3px_3px_0_#000]`}
          >
            곧 출시
          </button>
        </div>
      </div>
    </div>
  );
}
