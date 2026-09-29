import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

// Paddle 서버 SDK — 웹훅 서명 검증, 구독 조회. 클라이언트 토큰과 별개.
// 환경은 NEXT_PUBLIC_PADDLE_ENV 하나로 서버/브라우저가 같이 봄 — 둘이 어긋나면 결제는 되는데 웹훅 검증이 실패함.
export const PADDLE_ENV = (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") as "sandbox" | "production";

// 카탈로그 가격 ID — scripts/seed-paddle-catalog.ts 가 만든 값. 환경별로 다름.
export const PRICE_IDS = {
  production: {
    monthly: "pri_01m3pqh2v852ywseg77pjsjh5n",
    yearly: "pri_01m3f78ns67kg3m9wf0j4abjhd",
  },
  sandbox: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_YEARLY ?? "",
  },
}[PADDLE_ENV];

let instance: Paddle | null = null;

export function paddle() {
  if (instance) return instance;
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("PADDLE_API_KEY is not set");
  instance = new Paddle(key, {
    environment: PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  });
  return instance;
}
