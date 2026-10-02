import { Suspense } from "react";
import { cookies } from "next/headers";
import PricingView from "@/features/billing/components/PricingView";
import AdBanner from "@/components/AdBanner";
import { currentPlan } from "@/lib/plan.server";

// 화면 5. 요금제 — Free/Pro 카드. 로그인 상태면 체크아웃 가능, 아니면 로그인 유도
export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ dev?: string | string[] }>;
}) {
  const jar = await cookies();
  const workspaceId = jar.get("nm_ws")?.value;
  const { plan } = await currentPlan((await searchParams).dev);
  return (
    <div className="flex min-h-screen flex-col bg-white nm-dotgrid text-[#37352F] dark:bg-[#191919] dark:text-[#EDEDEC]">
      <main className="flex-1">
        <Suspense>
          <PricingView plan={plan} workspaceId={workspaceId} />
        </Suspense>
      </main>
      {plan === "free" && <AdBanner />}
    </div>
  );
}
