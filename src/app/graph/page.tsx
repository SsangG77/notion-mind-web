import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GraphView from "@/features/graph/components/GraphViewClient";
import AdBanner from "@/components/AdBanner";

// 도트 그리드 캔버스 배경 (디자인 탭 확정)
const dotGrid = {
  backgroundImage: "radial-gradient(#E9E9E7 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

export default async function GraphPage() {
  const jar = await cookies();
  if (!jar.get("nm_token")?.value) redirect("/");
  const workspace = jar.get("nm_workspace")?.value;

  return (
    <div className="flex h-screen flex-col bg-white" style={dotGrid}>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#E9E9E7] bg-white/80 px-4 backdrop-blur">
        <span className="text-sm font-semibold text-[#37352F]">Notion-mind</span>
        {workspace && <span className="text-xs text-[#91908C]">{workspace}</span>}
      </header>
      <main className="min-h-0 flex-1">
        <GraphView />
      </main>
      {/* 광고는 Free 전용 — 과금 도입 전까지 전원 Free */}
      <AdBanner />
    </div>
  );
}
