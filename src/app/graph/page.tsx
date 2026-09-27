import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GraphView from "@/features/graph/components/GraphViewClient";
import AdBanner from "@/components/AdBanner";
import { getPlan } from "@/lib/billing";

export default async function GraphPage() {
  const jar = await cookies();
  if (!jar.get("nm_token")?.value) redirect("/");
  const workspace = jar.get("nm_workspace")?.value;
  const plan = await getPlan(jar.get("nm_ws")?.value);

  // 캔버스 앱 관례대로 전용 헤더 줄 없음 — 앱 이름은 좌상단 로고 박스(= 설정 버튼)가 맡음
  return (
    <div className="flex h-screen flex-col bg-white nm-dotgrid dark:bg-[#191919]">
      <main className="min-h-0 flex-1">
        <GraphView workspace={workspace} plan={plan} />
      </main>
      {plan === "free" && <AdBanner />}
    </div>
  );
}
