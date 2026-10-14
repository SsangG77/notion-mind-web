import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { adminGate } from "@/lib/adminMode";
import { getAdminStats } from "@/lib/analytics";
import { BLOCK } from "@/components/blockStyle";
import UnlockForm from "@/components/UnlockForm";
import StatTile from "@/features/admin/components/StatTile";
import TimeSeriesChart from "@/features/admin/components/TimeSeriesChart";
import BarList from "@/features/admin/components/BarList";
import LockButton from "@/features/admin/components/LockButton";

// 운영 대시보드. DEV_UNLOCK_SECRET(개발 모드 비밀번호) 미설정이면 404, 비밀번호 쿠키 없으면 잠금 화면.
// 항상 최신 집계 — 캐시하지 않는다
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const RANGES = [7, 30, 90] as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!adminGate.configured()) notFound();
  const jar = await cookies();
  if (!adminGate.isUnlocked(jar.get(adminGate.cookie)?.value)) {
    return (
      <main className="nm-dotgrid flex min-h-screen items-center justify-center bg-white dark:bg-[#191919]">
        <UnlockForm endpoint="/api/admin" next="/admin" testId="admin" />
      </main>
    );
  }

  const requested = Number((await searchParams).days);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 30;
  const s = await getAdminStats(days);
  const fmt = (iso: string) => iso.slice(0, 10);

  return (
    <main className="nm-dotgrid min-h-screen bg-white px-4 py-8 text-[#37352F] dark:bg-[#191919] dark:text-[#EDEDEC]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Notion-mind 운영 현황</h1>
            <p className="text-xs text-[#8A8883]">
              {s.since} 부터 오늘까지 {days}일, UTC 기준. 가입과 접속 기록은 대시보드를 켠 시점부터 쌓입니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <nav className={`${BLOCK} flex h-8 items-center overflow-hidden text-xs font-semibold`} aria-label="기간">
              {RANGES.map((r) => (
                <Link
                  key={r}
                  href={`/admin?days=${r}`}
                  data-testid={`admin_range_${r}`}
                  className={`flex h-full items-center px-3 ${r === days ? "bg-[#2383E2] text-white" : ""}`}
                >
                  {r}일
                </Link>
              ))}
            </nav>
            <LockButton />
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="핵심 지표">
          <StatTile label="누적 워크스페이스" value={s.totals.workspaces} hint="노션 로그인 기준" />
          <StatTile label={`신규 가입 (${days}일)`} value={s.totals.newInRange} />
          <StatTile label={`활성 이용자 (${days}일)`} value={s.totals.activeInRange} hint="그래프를 연 워크스페이스" />
          <StatTile label="월 환산 매출" value={`$${s.totals.mrr}`} hint={`Pro ${s.totals.pro} (월 ${s.totals.monthly} / 연 ${s.totals.yearly})`} />
        </section>

        <section className={`${BLOCK} p-4`}>
          <TimeSeriesChart title="누적 가입자" points={s.cumulativeWorkspaces} summary="last" />
        </section>
        <section className={`${BLOCK} p-4`}>
          <TimeSeriesChart title="일별 신규 가입" points={s.signups} />
        </section>
        <section className={`${BLOCK} p-4`}>
          <TimeSeriesChart title="일별 활성 이용자" points={s.activeUsers} />
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div className={`${BLOCK} p-4`}>
            <BarList
              title="구독 상태"
              rows={s.subscriptionStatus.map((r) => ({ label: r.status, count: r.count }))}
              empty="구독 기록이 아직 없습니다"
            />
          </div>
          <div className={`${BLOCK} p-4`}>
            <BarList
              title="해지 사유"
              rows={s.cancellationReasons.map((r) => ({ label: r.reason, count: r.count }))}
              empty="해지 사유가 아직 없습니다"
            />
          </div>
        </section>

        <section className={`${BLOCK} overflow-x-auto p-4`}>
          <h3 className="mb-2 text-sm font-semibold">최근 가입 워크스페이스</h3>
          {s.recentWorkspaces.length === 0 ? (
            <p className="text-xs text-[#8A8883]">아직 기록된 워크스페이스가 없습니다</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[#8A8883]">
                <tr>
                  <th className="py-1 font-medium">워크스페이스</th>
                  <th className="py-1 font-medium">요금제</th>
                  <th className="py-1 font-medium">첫 접속</th>
                  <th className="py-1 font-medium">마지막 접속</th>
                </tr>
              </thead>
              <tbody>
                {s.recentWorkspaces.map((w, i) => (
                  <tr key={i} className="border-t border-[#E9E9E7] dark:border-[#2F2F2F]">
                    <td className="py-1.5 pr-3">{w.name}</td>
                    <td className="py-1.5 pr-3">{w.plan === "pro" ? "Pro" : "Free"}</td>
                    <td className="py-1.5 pr-3">{fmt(w.firstSeen)}</td>
                    <td className="py-1.5">{fmt(w.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
