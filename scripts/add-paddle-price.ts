// Paddle 가격 추가 — 가격은 만든 뒤 금액 수정이 안 되므로 새 가격을 만들고 코드의 ID 를 갈아끼운다.
// 옛 가격은 건드리지 않음(기존 구독이 붙어 있을 수 있음). 결제창엔 코드가 가리키는 ID 만 쓰인다.
// 실행: PADDLE_ENV=production npx tsx --env-file=.env scripts/add-paddle-price.ts <month|year> <달러금액>
//   예: PADDLE_ENV=production npx tsx --env-file=.env scripts/add-paddle-price.ts month 7
import { readFileSync, writeFileSync } from "node:fs";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const [interval, dollars] = process.argv.slice(2) as ["month" | "year", string];
if (!["month", "year"].includes(interval) || !/^\d+(\.\d{1,2})?$/.test(dollars ?? "")) {
  console.error("usage: add-paddle-price.ts <month|year> <dollars>");
  process.exit(1);
}
const env = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const key = env === Environment.production ? process.env.PADDLE_API_KEY : (process.env.PADDLE_SANDBOX_API_KEY ?? process.env.PADDLE_API_KEY);
const paddle = new Paddle(key!, { environment: env });

async function main() {
  const products = await paddle.products.list({ status: ["active"] }).next();
  const pro = products.find((p) => p.name === "Notion-mind Pro");
  if (!pro) throw new Error("Notion-mind Pro 상품이 없음 — seed-paddle-catalog.ts 먼저");
  const cents = String(Math.round(Number(dollars) * 100));
  const price = await paddle.prices.create({
    productId: pro.id,
    description: `Pro ${interval === "month" ? "monthly" : "yearly"} USD ${dollars}`,
    name: interval === "month" ? "Monthly" : "Yearly",
    unitPrice: { amount: cents, currencyCode: "USD" },
    billingCycle: { interval, frequency: 1 },
  });
  // 코드의 PRICE_IDS 갱신 — 환경(production/sandbox) 블록 안의 해당 키만
  const file = "src/lib/paddle.ts";
  const src = readFileSync(file, "utf8");
  const block = env === Environment.production ? "production" : "sandbox";
  const keyName = interval === "month" ? "monthly" : "yearly";
  const re = new RegExp(`(${block}: \\{[\\s\\S]*?${keyName}: )("[^"]*"|process\\.env\\.[A-Z_]+ \\?\\? "")`);
  if (!re.test(src)) throw new Error(`PRICE_IDS.${block}.${keyName} 를 못 찾음 — 수동으로 넣어라: ${price.id}`);
  writeFileSync(file, src.replace(re, `$1"${price.id}"`));
  console.log(JSON.stringify({ env: block, interval, dollars, priceId: price.id, updated: file }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
