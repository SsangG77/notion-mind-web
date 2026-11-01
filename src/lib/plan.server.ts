import { cookies } from "next/headers";
import { getPlan, getPlanInfo, type Plan } from "./billing";
import { DEV_COOKIE, DEV_PARAM, isUnlocked, planFromParam } from "./devMode";
import { readUid, UID_COOKIE } from "./session";

export interface PlanState {
  plan: Plan;
  /** 설정 패널에 요금제 토글을 보여줄지 — 비밀번호를 아는 사람에게만 */
  unlocked: boolean;
  /** 지금 이 요청에 개발 모드가 실제로 적용됐는지(주소에 표시가 있는지) */
  devActive: boolean;
  /** 이벤트 코드로 받은 Pro 의 만료 시각(ISO). 결제 구독이면 null — 화면이 "구독 관리" 대신 남은 기간을 보여준다 */
  promoUntil: string | null;
}

/** 서버 컴포넌트용. 주소의 dev 파라미터를 함께 넘겨야 적용된다 */
export async function currentPlan(devParam?: string | string[]): Promise<PlanState> {
  const jar = await cookies();
  const unlocked = isUnlocked(jar.get(DEV_COOKIE)?.value);
  const forced = unlocked ? planFromParam(Array.isArray(devParam) ? devParam[0] : devParam) : null;
  if (forced) return { plan: forced, unlocked, devActive: true, promoUntil: null };
  // 요금제는 자체 계정에 걸려 있다 — 워크스페이스를 바꿔도 구독이 따라온다
  const userId = readUid(jar.get(UID_COOKIE)?.value);
  const { plan, promoUntil } = await getPlanInfo(userId ?? undefined);
  return { plan, unlocked, devActive: false, promoUntil };
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
  return getPlan(readUid(req.cookies.get(UID_COOKIE)?.value) ?? undefined);
}
