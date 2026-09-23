// 노션 상표 면책 문구 — 외부에 보이는 화면(로그인·설정·요금제) 공통.
// 노션 상표 가이드라인은 앱 이름에 "Notion" 사용을 금지하지만, 이름을 유지하기로 결정(2026-09-23).
// 살아남은 유사 서비스(NotionApps)가 쓰는 방식대로 비제휴·상표 귀속을 명시해 혼동 소지를 줄인다.
// "with permission" 문구는 노션 허가가 있을 때만 쓰는 것이라 넣지 않음.
export default function NotionDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      data-testid="notion_disclaimer"
      className={`text-[11px] leading-relaxed text-[#91908C] ${className}`}
    >
      Notion-mind는 Notion Labs, Inc.와 무관한 독립 서비스입니다. Notion 및 Notion 로고는
      Notion Labs, Inc.의 상표입니다.
    </p>
  );
}
