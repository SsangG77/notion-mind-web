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
      {/* 글 폭에 맞춘 박스 안에 가둔다 — 화면을 가로지르면 휠이 어디서 확대이고 어디서 스크롤인지
          경계가 안 보인다. 박스 밖이면 늘 페이지 스크롤, 안이면 그래프 조작. 패널도 박스 안에서 열린다.
          높이는 광고가 첫 화면 안에 들어올 만큼만 */}
      <div className="mx-auto w-full max-w-[1040px] shrink-0 px-4 pt-6 sm:px-6 sm:pt-10">
        {/* 테두리는 얇은 선 하나 — 노드 박스 스타일(1.5px 보더 + 하드 섀도)은 노드와 UI 크롬의 언어라
            그걸 담는 그릇에 쓰면 노드 안에 노드가 든 것처럼 보인다.
            transform-gpu: 변형이 걸린 요소는 그 안의 position:fixed 기준이 화면이 아니라 이 박스다
            — 설정, 숨김, 상세 패널이 박스 밖으로 안 튀어나가게 하는 한 줄(패널은 /graph 와 공용) */}
        <div className="relative h-[520px] max-h-[62vh] min-h-[320px] transform-gpu [--nm-adbar:0px] overflow-hidden rounded-[12px] border border-[#E9E9E7] dark:border-[#2F2F2F]">
          <DemoGraphClient workspace={DICT[lang].demoWorkspace} />
        </div>
      </div>
      {/* 광고는 소개 글 안(DemoIntro)에 끼워 둔다 — 띠로 가로지르는 것보다 읽는 흐름에 맞는다.
          요금제와 무관하게 항상 나온다: 예시 화면은 제품이 아니라 공개 전시용이고,
          광고가 실제로 어떻게 보이는지가 AdSense 심사에서 확인돼야 한다 */}
      <DemoIntro lang={lang} />
    </div>
  );
}
