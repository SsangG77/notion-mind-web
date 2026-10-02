import { cookies } from "next/headers";
import { getPlan, type Plan } from "./billing";
import { DEV_COOKIE, readDevPlan } from "./devMode";

/**
 * 이 요청의 요금제. 개발 모드가 열려 있으면 그 값이 구독 상태를 덮어쓴다.
 * 서버 컴포넌트용 — 라우트 핸들러는 요청 쿠키를 직접 들고 planFor 를 쓴다.
 */
export async function currentPlan(): Promise<{ plan: Plan; devMode: boolean }> {
  const jar = await cookies();
  const dev = readDevPlan(jar.get(DEV_COOKIE)?.value);
  if (dev) return { plan: dev, devMode: true };
  return { plan: await getPlan(jar.get("nm_ws")?.value), devMode: false };
}

/** 라우트 핸들러용 — NextRequest 의 쿠키에서 같은 판정을 한다 */
export async function planFor(cookieStore: {
  get(name: string): { value: string } | undefined;
}): Promise<Plan> {
  const dev = readDevPlan(cookieStore.get(DEV_COOKIE)?.value);
  if (dev) return dev;
  return getPlan(cookieStore.get("nm_ws")?.value);
}
