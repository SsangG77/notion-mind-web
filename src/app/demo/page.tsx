import type { Metadata } from "next";
import { currentLang } from "@/lib/lang.server";
import { pageMeta } from "@/lib/seo";
import { DICT } from "@/lib/i18n";
import DemoGraphClient from "@/features/demo/DemoGraphClient";
import DemoIntro from "@/features/demo/DemoIntro";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/demo");
}

// 로그인 없이 실제 그래프를 만져 보는 화면. 노션을 연결하지 않아도 도구가 무엇을 하는지 보인다
export default async function DemoPage() {
  const lang = await currentLang();
  return (
    <div className="flex min-h-screen flex-col bg-white nm-dotgrid dark:bg-[#191919]">
      {/* 그래프를 조금 줄여 광고가 첫 화면 안에 들어오게 한다 — 맨 아래에 두면 스크롤해야 보인다 */}
      <div className="h-[60vh] min-h-[360px] shrink-0">
        <DemoGraphClient workspace={DICT[lang].demoWorkspace} />
      </div>
      {/* 광고는 소개 글 안(DemoIntro)에 끼워 둔다 — 띠로 가로지르는 것보다 읽는 흐름에 맞는다.
          요금제와 무관하게 항상 나온다: 예시 화면은 제품이 아니라 공개 전시용이고,
          광고가 실제로 어떻게 보이는지가 AdSense 심사에서 확인돼야 한다 */}
      <DemoIntro lang={lang} />
    </div>
  );
}
