import type { Metadata } from "next";
import { currentLang } from "@/lib/lang.server";
import { pageMeta } from "@/lib/seo";
import { DICT } from "@/lib/i18n";
import DemoGraphClient from "@/features/demo/DemoGraphClient";
import AdBanner from "@/components/AdBanner";
import DemoIntro from "@/features/demo/DemoIntro";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/demo");
}

// 로그인 없이 실제 그래프를 만져 보는 화면. 노션을 연결하지 않아도 도구가 무엇을 하는지 보인다
export default async function DemoPage() {
  const lang = await currentLang();
  return (
    <div className="flex min-h-screen flex-col bg-white nm-dotgrid dark:bg-[#191919]">
      <div className="h-[72vh] min-h-[420px] shrink-0">
        <DemoGraphClient workspace={DICT[lang].demoWorkspace} />
      </div>
      <DemoIntro lang={lang} />
      <AdBanner />
    </div>
  );
}
