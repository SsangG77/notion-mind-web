"use client";

import { useState } from "react";
import { BLOCK } from "@/components/blockStyle";
import { useT } from "@/features/i18n/LangProvider";

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
  const t = useT();
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
                  <p className="text-base font-bold">{t.cancelTitle}</p>
                  <p className="mt-0.5 text-xs text-[#91908C]">{t.cancelSubtitle}</p>
                </div>
                <ul className="space-y-2.5 px-5 py-4 text-sm">
                  {t.cancelKeeps.map((k) => (
                    <li key={k} className="flex gap-2">
                      <span className="text-[#91908C]">·</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
                <p className="px-5 pb-4 text-xs leading-relaxed text-[#91908C]">
                  {t.cancelNote}
                </p>
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    data-testid="cancel_keep_button"
                    onClick={() => setStep(0)}
                    className="flex-1 rounded-md bg-[#2383E2] py-2 text-sm font-semibold text-white hover:bg-[#1b74cb]"
                  >
                    {t.cancelKeep}
                  </button>
                  <button
                    data-testid="cancel_continue_button"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-md border border-[#E9E9E7] py-2 text-sm hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
                  >
                    {t.cancelContinue}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-[#E9E9E7] px-5 py-4 dark:border-[#2F2F2F]">
                  <p className="text-base font-bold">{t.cancelReasonTitle}</p>
                  <p className="mt-0.5 text-xs text-[#91908C]">{t.cancelReasonSubtitle}</p>
                </div>
                <div className="max-h-[40vh] space-y-1.5 overflow-y-auto px-5 py-4 text-sm">
                  {t.cancelReasons.map((r) => (
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
                    placeholder={t.cancelDetailPlaceholder}
                    className="mt-2 w-full resize-none rounded-md border border-[#E9E9E7] bg-transparent p-2 text-xs outline-none focus:border-[#2383E2] dark:border-[#2F2F2F]"
                  />
                </div>
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    data-testid="cancel_skip_button"
                    onClick={() => openPortal(false)}
                    className="flex-1 rounded-md border border-[#E9E9E7] py-2 text-sm hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
                  >
                    {t.skip}
                  </button>
                  <button
                    data-testid="cancel_submit_button"
                    onClick={() => openPortal(true)}
                    className="flex-1 rounded-md bg-[#2383E2] py-2 text-sm font-semibold text-white hover:bg-[#1b74cb]"
                  >
                    {t.sendAndContinue}
                  </button>
                </div>
                <p className="px-5 pb-5 text-center text-[10px] text-[#91908C]">
                  {t.cancelPortalNote}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
