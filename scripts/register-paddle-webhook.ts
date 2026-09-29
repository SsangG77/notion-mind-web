// Paddle 알림 대상(웹훅) 등록 — 한 번만. 시크릿은 응답에서만 볼 수 있어 .env 에 바로 써넣고 화면엔 안 찍음.
// 실행: PADDLE_ENV=production npx tsx --env-file=.env scripts/register-paddle-webhook.ts
import { appendFileSync } from "node:fs";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const env = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const destination = process.env.WEBHOOK_URL ?? "https://notion-mind.com/api/billing/webhook";
// 샌드박스는 별도 계정 — 키도 별도(PADDLE_SANDBOX_API_KEY)
const key = env === Environment.production ? process.env.PADDLE_API_KEY : (process.env.PADDLE_SANDBOX_API_KEY ?? process.env.PADDLE_API_KEY);
const paddle = new Paddle(key!, { environment: env });

async function main() {
  const existing = await paddle.notificationSettings.list();
  const dup = existing.find((n) => n.destination === destination);
  if (dup) {
    console.log("already registered:", dup.id, "(시크릿은 대시보드 알림 설정에서 확인)");
    return;
  }
  const created = await paddle.notificationSettings.create({
    description: `notion-mind ${env}`,
    destination,
    type: "url",
    subscribedEvents: ["subscription.created", "subscription.updated", "subscription.canceled"],
  });
  const varName = env === Environment.production ? "PADDLE_WEBHOOK_SECRET" : "PADDLE_SANDBOX_WEBHOOK_SECRET";
  appendFileSync(".env", `\n${varName}=${created.endpointSecretKey}\n`);
  console.log(JSON.stringify({ env, id: created.id, destination, secretWrittenTo: ".env" }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
