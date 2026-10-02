import { cookies } from "next/headers";
import { getPlan, type Plan } from "./billing";
import { DEV_COOKIE, DEV_PARAM, isUnlocked, planFromParam } from "./devMode";

export interface PlanState {
  plan: Plan;
  /** 설정 패널에 요금제 토글을 보여줄지 — 비밀번호를 아는 사람에게만 */
  unlocked: boolean;
  /** 지금 이 요청에 개발 모드가 실제로 적용됐는지(주소에 표시가 있는지) */
  devActive: boolean;
}

/** 서버 컴포넌트용. 주소의 dev 파라미터를 함께 넘겨야 적용된다 */
export async function currentPlan(devParam?: string | string[]): Promise<PlanState> {
  const jar = await cookies();
  const unlocked = isUnlocked(jar.get(DEV_COOKIE)?.value);
  const forced = unlocked ? planFromParam(Array.isArray(devParam) ? devParam[0] : devParam) : null;
  if (forced) return { plan: forced, unlocked, devActive: true };
  return { plan: await getPlan(jar.get("nm_ws")?.value), unlocked, devActive: false };
}

/** 라우트 핸들러용 — 요청의 쿠키와 쿼리에서 같은 판정을 한다 */
export async function planFor(req: {
  cookies: { get(name: string): { value: string } | undefined };
  nextUrl: { searchParams: URLSearchParams };
}): Promise<Plan> {
  if (isUnlocked(req.cookies.get(DEV_COOKIE)?.value)) {
    const forced = planFromParam(req.nextUrl.searchParams.get(DEV_PARAM));
    if (forced) return forced;
  }
  return getPlan(req.cookies.get("nm_ws")?.value);
}
