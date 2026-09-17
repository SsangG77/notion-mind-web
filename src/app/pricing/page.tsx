import PricingView from "@/features/billing/components/PricingView";
import AdBanner from "@/components/AdBanner";

// 화면 5. 요금제 — Free/Pro 카드 (결제 연동 전 스켈레톤)
export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white nm-dotgrid text-[#37352F] dark:bg-[#191919] dark:text-[#EDEDEC]">
      <main className="flex-1">
        <PricingView />
      </main>
      {/* 광고는 Free 전용 — 과금 도입 전까지 전원 Free */}
      <AdBanner />
    </div>
  );
}
