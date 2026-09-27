"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// Paddle.js 오버레이 체크아웃. 클라이언트 토큰은 공개 가능한 값.
// workspace_id 를 customData 로 실어 보내면 웹훅에서 같은 값으로 우리 유저를 찾음.
export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;
    initializePaddle({
      token,
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") as "sandbox" | "production",
    }).then((p) => p && setPaddle(p));
  }, []);

  const openCheckout = (priceId: string, workspaceId: string, onCompleted?: () => void) => {
    paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { workspace_id: workspaceId },
      settings: { variant: "one-page", successUrl: `${window.location.origin}/pricing?checkout=success` },
    });
    if (onCompleted) paddle?.Update({ eventCallback: (e) => e.name === "checkout.completed" && onCompleted() });
  };

  return { ready: !!paddle, openCheckout };
}
