/**
 * 항목별 수량 — 가로 막대. 한 가지 색(크기만 비교), 값은 텍스트 색으로 직접 표기.
 * 항목이 많거나 이름이 길어도 가로라 읽힌다.
 */
export default function BarList({ title, rows, empty }: { title: string; rows: { label: string; count: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-[#8A8883]">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[120px_1fr_40px] items-center gap-2 text-xs">
              <span className="truncate" title={r.label}>
                {r.label}
              </span>
              <span className="h-3 rounded-[3px] bg-[#2383E2]" style={{ width: `${(r.count / max) * 100}%` }} aria-hidden />
              <span className="text-right font-semibold">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
