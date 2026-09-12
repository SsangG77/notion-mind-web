// Free 전용 하단 가로 배너 광고 슬롯.
// ponytail: 광고 네트워크 미정 — 플레이스홀더. 네트워크 확정 시 스크립트 삽입으로 교체.
export default function AdBanner() {
  return (
    <div
      data-testid="ad_banner_bottom"
      className="flex h-[60px] w-full shrink-0 items-center justify-center border-t border-[#E9E9E7] bg-[#F7F6F3]"
    >
      <span className="text-xs tracking-wide text-[#91908C]">AD — 광고 영역 (Free)</span>
    </div>
  );
}
