// Paddle 카탈로그 시드 — Pro 상품 + 월/연 가격. 한 번만 실행.
// 가격은 src/features/billing/components/PricingView.tsx 의 PRO_PRICE 와 일치해야 함(결제사 심사 항목).
// 실행: PADDLE_ENV=production npx tsx --env-file=.env scripts/seed-paddle-catalog.ts   (기본은 sandbox)
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const env = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
// 샌드박스는 별도 계정 — 키도 별도(PADDLE_SANDBOX_API_KEY)
const key = env === Environment.production ? process.env.PADDLE_API_KEY : (process.env.PADDLE_SANDBOX_API_KEY ?? process.env.PADDLE_API_KEY);
const paddle = new Paddle(key!, { environment: env });

async function seed() {
  const existing = await paddle.products.list({ include: ["prices"] }).next();
  const dup = existing.find((p) => p.name === "Notion-mind Pro");
  if (dup) {
    console.log("already exists", JSON.stringify({ productId: dup.id, prices: dup.prices?.map((p) => [p.id, p.description]) }));
    return;
  }

  const pro = await paddle.products.create({
    name: "Notion-mind Pro",
    taxCategory: "saas",
    description: "Unlimited nodes, persistent settings, automatic sync, image export, no ads.",
  });
  const monthly = await paddle.prices.create({
    productId: pro.id,
    description: "Pro monthly USD",
    name: "Monthly",
    unitPrice: { amount: "500", currencyCode: "USD" }, // $5.00
    billingCycle: { interval: "month", frequency: 1 },
  });
  const yearly = await paddle.prices.create({
    productId: pro.id,
    description: "Pro yearly USD",
    name: "Yearly",
    unitPrice: { amount: "4800", currencyCode: "USD" }, // $48.00
    billingCycle: { interval: "year", frequency: 1 },
  });

  console.log(JSON.stringify({ env, productId: pro.id, monthlyId: monthly.id, yearlyId: yearly.id }, null, 2));
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
