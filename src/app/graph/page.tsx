import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GraphView from "@/features/graph/components/GraphViewClient";
import AdBanner from "@/components/AdBanner";
import { hasAdSlot } from "@/components/adsense";
import { currentPlan } from "@/lib/plan.server";
import { langHref } from "@/lib/i18n";
import { currentLang } from "@/lib/lang.server";
import { sessionState } from "@/lib/session.server";

export default async function GraphPage({
  searchParams,
}: {
  searchParams: Promise<{ dev?: string | string[] }>;
}) {
  const jar = await cookies();
  const session = await sessionState();
  if (session === "anonymous") redirect(langHref(await currentLang(), "/"));
  if (session === "no_connection") redirect("/api/auth/login");
  const workspace = jar.get("nm_workspace")?.value;
  const { plan, unlocked } = await currentPlan((await searchParams).dev);

  // 캔버스 앱 관례대로 전용 헤더 줄 없음 — 앱 이름은 좌상단 로고 박스(= 설정 버튼)가 맡음
  // 하단 광고 띠가 실제로 그려질 때만 패널이 그 높이를 비운다 — 승인 전에는 띠가 없으므로 0.
  // 이 값을 안 맞추면 패널 아래끝이 줌 컨트롤보다 띠 높이만큼 위에서 끝난다
  const adBar = plan === "free" && hasAdSlot("page");
  return (
    <div
      className={`flex h-screen flex-col bg-white nm-dotgrid dark:bg-[#191919] ${
        adBar ? "[--nm-adbar:60px]" : "[--nm-adbar:0px]"
      }`}
    >
      <main className="min-h-0 flex-1">
        <GraphView workspace={workspace} plan={plan} unlocked={unlocked} />
      </main>
      {adBar && <AdBanner />}
    </div>
  );
}
