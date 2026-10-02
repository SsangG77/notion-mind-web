import { notFound } from "next/navigation";
import { devModeConfigured } from "@/lib/devMode";
import UnlockForm from "./UnlockForm";

// 환경변수가 없으면 이 경로 자체가 없는 것처럼 동작한다
export const metadata = { robots: { index: false, follow: false } };

export default function DevPage() {
  if (!devModeConfigured()) notFound();
  return (
    <main className="nm-dotgrid flex min-h-screen items-center justify-center bg-white dark:bg-[#191919]">
      <UnlockForm />
    </main>
  );
}
