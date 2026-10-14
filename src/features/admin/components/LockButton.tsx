"use client";

import { useRouter } from "next/navigation";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

/** 대시보드 쿠키를 지우고 잠금 화면으로 */
export default function LockButton() {
  const router = useRouter();
  const lock = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "lock" }),
    }).catch(() => null);
    router.refresh();
  };
  return (
    <button data-testid="admin_lock_button" onClick={lock} className={`${BLOCK} ${BLOCK_PRESS} h-8 px-3 text-xs font-semibold`}>
      잠그기
    </button>
  );
}
