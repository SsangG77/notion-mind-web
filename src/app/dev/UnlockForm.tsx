"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

// 숨겨진 개발 모드 진입. 어디에도 링크하지 않고 robots.txt 로도 막는다.
// 문구는 일부러 밋밋한 영어 — 무엇을 여는 화면인지 드러내지 않는다.
export default function UnlockForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/dev", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password, plan: "pro" }),
    }).catch(() => null);
    if (!res?.ok) {
      setState("error");
      setPassword("");
      return;
    }
    router.replace("/graph");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className={`${BLOCK} flex w-[320px] flex-col gap-3 p-6`}>
      <label htmlFor="k" className="text-sm font-semibold">
        Access
      </label>
      <input
        id="k"
        data-testid="dev_password_input"
        type="password"
        autoComplete="off"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-9 rounded-md border border-[#E9E9E7] bg-transparent px-3 text-sm outline-none focus:border-[#2383E2] dark:border-[#2F2F2F]"
      />
      <button
        data-testid="dev_unlock_button"
        disabled={state === "sending" || password.length === 0}
        className={`${BLOCK_PRESS} h-9 rounded-md bg-[#2383E2] text-sm font-semibold text-white disabled:opacity-50`}
      >
        {state === "sending" ? "…" : "Continue"}
      </button>
      {state === "error" && <p className="text-xs text-[#D44C47]">Incorrect.</p>}
    </form>
  );
}
