import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GraphView from "@/features/graph/components/GraphViewClient";
import AdBanner from "@/components/AdBanner";
import { currentPlan } from "@/lib/plan.server";
import { langHref } from "@/lib/i18n";
import { currentLang } from "@/lib/lang.server";

export default async function GraphPage({
  searchParams,
}: {
  searchParams: Promise<{ dev?: string | string[] }>;
}) {
  const jar = await cookies();
  if (!jar.get("nm_token")?.value) redirect(langHref(await currentLang(), "/"));
  const workspace = jar.get("nm_workspace")?.value;
  const { plan, unlocked } = await currentPlan((await searchParams).dev);

  // 캔버스 앱 관례대로 전용 헤더 줄 없음 — 앱 이름은 좌상단 로고 박스(= 설정 버튼)가 맡음
  return (
    <div className="flex h-screen flex-col bg-white nm-dotgrid dark:bg-[#191919]">
      <main className="min-h-0 flex-1">
        <GraphView workspace={workspace} plan={plan} unlocked={unlocked} />
      </main>
      {plan === "free" && <AdBanner />}
    </div>
  );
}
