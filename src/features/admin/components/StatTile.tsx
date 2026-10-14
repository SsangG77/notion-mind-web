import { BLOCK } from "@/components/blockStyle";

/** 현재 값 하나 — 막대 하나짜리 차트 대신 숫자 타일 */
export default function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className={`${BLOCK} flex flex-col gap-1 p-4`}>
      <span className="text-xs text-[#8A8883]">{label}</span>
      <span className="text-3xl font-bold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</span>
      {hint && <span className="text-xs text-[#8A8883]">{hint}</span>}
    </div>
  );
}
