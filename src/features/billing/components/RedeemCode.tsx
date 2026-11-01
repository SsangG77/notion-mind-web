"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BLOCK_PRESS } from "@/components/blockStyle";
import { useLang, useT } from "@/features/i18n/LangProvider";
import { formatDay } from "@/lib/i18n";

type Reason = "invalid" | "closed" | "already_joined" | "already_pro" | "no_login" | "error";

/** 이벤트 체험 코드 입력 — 성공하면 서버 판정이 바뀌므로 화면을 다시 받아온다 */
export default function RedeemCode() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<Reason | null>(null);

  const message: Record<Reason, string> = {
    invalid: t.redeemInvalid,
    closed: t.redeemClosed,
    already_joined: t.redeemAlreadyJoined,
    already_pro: t.redeemAlreadyPro,
    no_login: t.redeemNoLogin,
    error: t.redeemError,
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/billing/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await r.json().catch(() => null)) as
        | { ok: true; until: string }
        | { ok: false; reason: Reason }
        | null;
      if (body?.ok) {
        setDone(body.until);
        router.refresh();
      } else {
        setError(body?.reason ?? "error");
      }
    } catch {
      setError("error");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p data-testid="redeem_success" className="mt-5 text-xs font-semibold text-[#2383E2]">
        {t.redeemOk(formatDay(done, lang))}
      </p>
    );
  }

  return (
    <div className="mt-5 border-t border-[#E9E9E7] pt-4 dark:border-[#2F2F2F]">
      <p className="text-xs font-semibold">{t.redeemTitle}</p>
      <p className="mt-0.5 text-[10px] text-[#91908C]">{t.redeemHint}</p>
      <form
        className="mt-2 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy && code.trim()) void submit();
        }}
      >
        <input
          data-testid="redeem_input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.redeemPlaceholder}
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-[6px] border-[1.5px] border-[#E9E9E7] bg-white px-2 py-1.5 text-xs tracking-wide outline-none focus:border-[#2383E2] dark:border-[#2F2F2F] dark:bg-[#202020]"
        />
        <button
          data-testid="redeem_button"
          type="submit"
          disabled={busy || !code.trim()}
          className={`${BLOCK_PRESS} shrink-0 rounded-[6px] border-[1.5px] border-[#2E2C27] bg-[#F4F3EF] px-3 py-1.5 text-xs font-semibold shadow-[2px_2px_0_#2E2C27] disabled:opacity-50 dark:border-black dark:bg-[#35342F] dark:shadow-[2px_2px_0_#000]`}
        >
          {busy ? t.redeemApplying : t.redeemButton}
        </button>
      </form>
      {error && (
        <p data-testid="redeem_error" className="mt-1.5 text-[10px] text-[#D44C47]">
          {message[error]}
        </p>
      )}
    </div>
  );
}
