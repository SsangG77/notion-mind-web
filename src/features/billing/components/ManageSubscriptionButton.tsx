"use client";

import { useState } from "react";
import { BLOCK } from "@/components/blockStyle";

const KEEPS = [
  "노드 무제한 — Free는 최근 수정순 1,000개까지만 보입니다",
  "숨김과 핀 고정 영구 저장 — Free는 새로고침하면 초기화됩니다",
  "광고 없음 — Free는 화면 하단에 광고가 표시됩니다",
];

const REASONS = [
  "가격이 부담됨",
  "필요한 기능이 없음",
  "생각보다 잘 안 쓰게 됨",
  "오류나 불편함이 있음",
  "다른 서비스를 쓰기로 함",
  "기타",
];

/**
 * 구독 관리 진입 — 바로 Paddle 포털로 보내지 않고 (1) 잃는 것 안내 (2) 해지 사유(선택) 를 거친다.
 * 어느 단계에서도 해지를 막지 않는다 — 두 단계 모두 곧장 포털로 나가는 버튼이 있고, 사유는 건너뛸 수 있다.
 * (해지 자체는 Paddle 이 모든 구독 메일에 넣는 링크로도 가능하므로 막는 설계는 애초에 불가능)
 */
export default function ManageSubscriptionButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");

  const openPortal = (withFeedback: boolean) => {
    if (withFeedback && (reason || detail.trim())) {
      // 보내고 나서 포털을 열되, 저장 실패가 해지를 막지 않도록 기다리지 않는다
      void fetch("/api/billing/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason, detail: detail.trim() || null }),
      }).catch(() => {});
    }
    window.open("/api/billing/portal", "_blank", "noopener");
    setStep(0);
  };

  return (
    <>
      <button data-testid="manage_subscription_button" className={className} onClick={() => setStep(1)}>
        {children}
      </button>

      {step > 0 && (
        <div
          data-testid="cancel_retention_modal"
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setStep(0)}
        >
          <div className={`${BLOCK} w-full max-w-[380px] overflow-hidden`} onClick={(e) => e.stopPropagation()}>
            {step === 1 ? (
              <>
                <div className="border-b border-[#E9E9E7] px-5 py-4 dark:border-[#2F2F2F]">
                  <p className="text-base font-bold">구독 관리</p>
                  <p className="mt-0.5 text-xs text-[#91908C]">해지하면 다음 기능을 더 쓸 수 없습니다</p>
                </div>
                <ul className="space-y-2.5 px-5 py-4 text-sm">
                  {KEEPS.map((k) => (
                    <li key={k} className="flex gap-2">
                      <span className="text-[#91908C]">·</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
                <p className="px-5 pb-4 text-xs leading-relaxed text-[#91908C]">
                  해지해도 이미 결제한 기간이 끝날 때까지는 Pro가 그대로 유지되고, 이후 추가 청구는 없습니다.
                  결제 후 14일 이내라면 전액 환불됩니다.
                </p>
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    data-testid="cancel_keep_button"
                    onClick={() => setStep(0)}
                    className="flex-1 rounded-md bg-[#2383E2] py-2 text-sm font-semibold text-white hover:bg-[#1b74cb]"
                  >
                    계속 사용하기
                  </button>
                  <button
                    data-testid="cancel_continue_button"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-md border border-[#E9E9E7] py-2 text-sm hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
                  >
                    해지 진행
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-[#E9E9E7] px-5 py-4 dark:border-[#2F2F2F]">
                  <p className="text-base font-bold">떠나는 이유를 알려주세요</p>
                  <p className="mt-0.5 text-xs text-[#91908C]">선택 사항입니다. 답하지 않아도 해지할 수 있습니다</p>
                </div>
                <div className="max-h-[40vh] space-y-1.5 overflow-y-auto px-5 py-4 text-sm">
                  {REASONS.map((r) => (
                    <label key={r} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="radio"
                        name="cancel_reason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-[#2383E2]"
                      />
                      {r}
                    </label>
                  ))}
                  <textarea
                    data-testid="cancel_reason_detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    rows={3}
                    placeholder="더 하고 싶은 말 (선택)"
                    className="mt-2 w-full resize-none rounded-md border border-[#E9E9E7] bg-transparent p-2 text-xs outline-none focus:border-[#2383E2] dark:border-[#2F2F2F]"
                  />
                </div>
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    data-testid="cancel_skip_button"
                    onClick={() => openPortal(false)}
                    className="flex-1 rounded-md border border-[#E9E9E7] py-2 text-sm hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
                  >
                    건너뛰기
                  </button>
                  <button
                    data-testid="cancel_submit_button"
                    onClick={() => openPortal(true)}
                    className="flex-1 rounded-md bg-[#2383E2] py-2 text-sm font-semibold text-white hover:bg-[#1b74cb]"
                  >
                    보내고 계속
                  </button>
                </div>
                <p className="px-5 pb-5 text-center text-[10px] text-[#91908C]">
                  두 버튼 모두 Paddle 구독 관리 화면으로 이동합니다
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
