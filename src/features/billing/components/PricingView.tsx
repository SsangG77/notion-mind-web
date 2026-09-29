"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";
import NotionDisclaimer from "@/components/NotionDisclaimer";
import { PRICE_IDS } from "@/lib/paddle";
import type { Plan } from "@/lib/billing";
import { usePaddle } from "../hooks/usePaddle";

const FREE_FEATURES = [
  "노드 1,000개 (최근 수정순)",
  "워크스페이스 1개",
  "그래프 전 기능 (관계형 포함)",
  "수동 동기화",
  "핀·숨김은 세션 한정",
  "광고 표시",
];

// Pro 가격 — Paddle 카탈로그와 반드시 일치시킬 것(심사 항목). 통화 USD, 세금은 결제 화면에서 별도 계산
const PRO_PRICE = { monthly: 7, yearly: 48 } as const;
// 연간 할인율 표시 — 월 결제 12번 대비
const YEARLY_DISCOUNT = Math.round((1 - PRO_PRICE.yearly / (PRO_PRICE.monthly * 12)) * 100);

const PRO_FEATURES = [
  "노드 무제한",
  "핀·숨김·필터 영구 저장",
  "자동 동기화",
  "이미지 내보내기",
  "광고 제거",
  "워크스페이스 3개+",
];

/** 요금제 화면 — Free/Pro 카드 + 월/연 토글 + Paddle 오버레이 체크아웃 */
export default function PricingView({ plan, workspaceId }: { plan: Plan; workspaceId?: string }) {
  const [yearly, setYearly] = useState(false);
  const { ready, openCheckout } = usePaddle();
  const router = useRouter();
  const params = useSearchParams();
  // 결제 직후: 웹훅이 몇 초 뒤 도착하므로 Pro 반영될 때까지 폴링 후 새로고침
  const [waiting, setWaiting] = useState(params.get("checkout") === "success" && plan === "free");
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const id = setInterval(async () => {
      const r = await fetch("/api/billing/status").then((r) => r.json()).catch(() => null);
      if (r?.plan === "pro" || ++tries > 20) {
        clearInterval(id);
        setWaiting(false);
        router.replace("/pricing");
        router.refresh();
      }
    }, 1500);
    return () => clearInterval(id);
  }, [waiting, router]);
  const isPro = plan === "pro";
  const priceId = yearly ? PRICE_IDS.yearly : PRICE_IDS.monthly;

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
          연간 <span className="text-[10px] text-[#2383E2]">{YEARLY_DISCOUNT}% 할인</span>
        </button>
      </div>

      <div className="mt-8 grid w-full gap-6 sm:grid-cols-2">
        {/* Free */}
        <div className={`${BLOCK} flex flex-col p-6`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Free</span>
            {!isPro && (
              <span className="rounded-full bg-[#F4F3EF] px-2.5 py-0.5 text-xs font-semibold dark:bg-[#35342F]">
                현재 사용 중
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold">
            $0<span className="text-sm font-normal text-[#91908C]"> / 월</span>
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
              {isPro ? "현재 사용 중" : "추천"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold" data-testid="pro_price">
            ${yearly ? PRO_PRICE.yearly : PRO_PRICE.monthly}
            <span className="text-sm font-normal text-[#91908C]"> / {yearly ? "년" : "월"}</span>
            <span className="block text-xs font-normal text-[#91908C]">
              {yearly
                ? `월 $${(PRO_PRICE.yearly / 12).toFixed(0)} 꼴, 연 1회 결제`
                : "매월 자동 갱신, 언제든 해지"}
              , 부가세 포함
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
          {isPro ? (
            <a
              data-testid="manage_subscription_button"
              href="/api/billing/portal"
              target="_blank"
              rel="noopener"
              className={`${BLOCK_PRESS} mt-6 block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#F4F3EF] py-2.5 text-center text-sm font-semibold shadow-[3px_3px_0_#2E2C27] hover:bg-[#EDECE7] dark:border-black dark:bg-[#35342F] dark:shadow-[3px_3px_0_#000]`}
            >
              구독 관리 ↗
            </a>
          ) : workspaceId ? (
            <button
              data-testid="pricing_subscribe_button"
              disabled={!ready || waiting}
              onClick={() => openCheckout(priceId, workspaceId, () => setWaiting(true))}
              className={`${BLOCK_PRESS} mt-6 w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#2E2C27] hover:bg-[#1b74cb] disabled:cursor-wait disabled:opacity-70 dark:border-black dark:shadow-[3px_3px_0_#000]`}
            >
              {waiting ? "결제 확인 중…" : ready ? "Pro 구독하기" : "결제 모듈 로딩…"}
            </button>
          ) : (
            <a
              data-testid="pricing_login_button"
              href="/api/auth/login"
              className={`${BLOCK_PRESS} mt-6 block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#2383E2] py-2.5 text-center text-sm font-semibold text-white shadow-[3px_3px_0_#2E2C27] hover:bg-[#1b74cb] dark:border-black dark:shadow-[3px_3px_0_#000]`}
            >
              Notion으로 로그인 후 구독
            </a>
          )}
          <p className="mt-3 text-center text-[10px] text-[#91908C]">
            결제 후 14일 이내 전액 환불,{" "}
            <Link href="/refund" className="underline">
              환불정책
            </Link>
          </p>
        </div>
      </div>

      <NotionDisclaimer className="mt-10 text-center" />
    </div>
  );
}
