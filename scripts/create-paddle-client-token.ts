// 클라이언트 측 토큰 생성(공개 값, 결제창 여는 데 씀) — 대시보드 대신 API 로. 샌드박스 기본.
// 실행: npx tsx --env-file=.env scripts/create-paddle-client-token.ts
import { appendFileSync } from "node:fs";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const env = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const key = env === Environment.production ? process.env.PADDLE_API_KEY : (process.env.PADDLE_SANDBOX_API_KEY ?? process.env.PADDLE_API_KEY);
const paddle = new Paddle(key!, { environment: env });

async function main() {
  const t = await paddle.clientTokens.create({ name: `notion-mind web (${env})` });
  const varName = env === Environment.production ? "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" : "NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN";
  appendFileSync(".env", `\n${varName}=${t.token}\n`);
  console.log(JSON.stringify({ env, id: t.id, prefix: t.token.slice(0, 5), writtenTo: ".env" }));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
