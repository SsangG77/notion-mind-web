"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PaywallModal from "./PaywallModal";
import { BLOCK } from "@/components/blockStyle";
import NotionDisclaimer from "@/components/NotionDisclaimer";
import ManageSubscriptionButton from "@/features/billing/components/ManageSubscriptionButton";
import type { Plan } from "@/lib/billing";
import { useLang, useSetLang, useT } from "@/features/i18n/LangProvider";
import { LANG_LABEL, LANGS, langHref, legalPath } from "@/lib/i18n";
import { DEV_PARAM } from "@/lib/apiUrl";

const ROW =
  "flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#2F2F2F]";

/** Pro 전용 기능 스위치 — Free 가 켜려고 하면 페이월, Pro 는 켜짐 고정(개별 끄기는 추후) */
function ProSwitch({ testid, on, onAttempt }: { testid: string; on: boolean; onAttempt: () => void }) {
  return (
    <button
      data-testid={testid}
      onClick={on ? undefined : onAttempt}
      className={`relative h-[18px] w-[34px] rounded-full ${on ? "bg-[#2383E2]" : "bg-[#E9E9E7] dark:bg-black"}`}
      aria-checked={on}
      role="switch"
    >
      <span
        className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow ${on ? "left-[18px]" : "left-[2px]"}`}
      />
    </button>
  );
}

/** 설정 사이드 패널 — 노드 박스 디자인, 상단 바 아래에서 세로 확장 */
export default function SettingsPanel({
  onClose,
  loading,
  lastSync,
  onReload,
  workspace,
  plan,
  unlocked,
}: {
  onClose: () => void;
  loading: boolean;
  lastSync: number | null;
  onReload: () => void;
  /** 연결된 노션 워크스페이스 이름 — 상단 헤더가 사라져 이 패널이 표시 자리 */
  workspace?: string;
  plan: Plan;
/** 비밀번호를 입력해 둔 사람에게만 요금제 토글이 보인다 */
  unlocked: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const setLang = useSetLang();
  const router = useRouter();
  const [paywall, setPaywall] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  // 개발 모드는 주소에 남는다 — 링크를 타고 나가면 표시가 떨어져 저절로 일반 모드로 돌아간다
  const devParam = params.get(DEV_PARAM);
  const setDevPlan = (p: Plan | null) => {
    const next = new URLSearchParams(params.toString());
    if (p) next.set(DEV_PARAM, p);
    else next.delete(DEV_PARAM);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
    router.refresh();
  };
  const lockDev = async () => {
    await fetch("/api/dev", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "lock" }),
    }).catch(() => {});
    setDevPlan(null);
  };
  const [closing, setClosing] = useState(false);
  // 닫기 애니메이션이 끝난 뒤 실제 언마운트
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };
  const syncTime = lastSync
    ? new Date(lastSync).toLocaleTimeString(lang === "ko" ? "ko-KR" : "en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <>
      {/* 배경 딤 — 클릭 시 닫힘 */}
      <div
        data-testid="settings_backdrop"
        className={`pointer-events-auto fixed inset-0 z-10 bg-black/25 ${
          closing ? "nm-fade-out" : "nm-fade-in"
        }`}
        onClick={close}
      />
      <div
        data-testid="settings_panel"
        className={`${BLOCK} ${
          closing ? "nm-slide-out" : "nm-slide-in"
        } pointer-events-auto fixed bottom-[116px] left-3 top-[60px] z-20 flex w-[332px] flex-col overflow-hidden`}
      >
        <div className={`${ROW} shrink-0`}>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{t.settings}</span>
            {workspace && (
              <span className="mt-0.5 block truncate text-[10px] text-[#91908C]">
                {workspace}
              </span>
            )}
          </span>
          <button
            data-testid="settings_close_button"
            onClick={close}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
            aria-label={t.close}
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto text-sm">
          <Link
            data-testid="plan_row"
            href={langHref(lang, "/pricing")}
            className={`${ROW} hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}
          >
            <span>{t.plan}</span>
            <span className="flex items-center gap-1.5">
              <span
                data-testid="plan_badge"
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  plan === "pro" ? "bg-[#2383E2] text-white" : "bg-[#F4F3EF] dark:bg-[#35342F]"
                }`}
              >
                {plan === "pro" ? t.pro : t.free}
              </span>
              <span className="text-[#91908C]">›</span>
            </span>
          </Link>
          {plan === "pro" && (
            <ManageSubscriptionButton className={`${ROW} w-full text-left hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}>
              <span>
                {t.manageSubscription}
                <span className="mt-0.5 block text-[10px] text-[#91908C]">{t.manageSubscriptionHint}</span>
              </span>
              <span className="text-[#91908C]">›</span>
            </ManageSubscriptionButton>
          )}
          <div className={ROW}>
            <span>
              {t.connectedPages}
              <span className="mt-0.5 block text-[10px] text-[#91908C]">
                {t.connectedPagesHint}
              </span>
            </span>
            <a
              data-testid="reconnect_pages_button"
              href="/api/auth/login"
              className="shrink-0 rounded-md border border-[#E9E9E7] px-2.5 py-1 text-xs hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
            >
              {t.change}
            </a>
          </div>
          <div className={ROW}>
            <span>
              {t.manualSync}
              {syncTime && (
                <span className="ml-1 block text-[10px] text-[#91908C]">{t.lastSync(syncTime)}</span>
              )}
            </span>
            <button
              data-testid="sync_button"
              disabled={loading}
              onClick={onReload}
              className="rounded-md border border-[#E9E9E7] px-2.5 py-1 text-xs hover:bg-[#F4F3EF] disabled:opacity-50 dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
            >
              {loading ? t.syncing : t.syncNow}
            </button>
          </div>
          <div className={ROW}>
            <span>
              {t.removeAds} <span className="ml-1 text-[10px] text-[#91908C]">Pro</span>
            </span>
            <ProSwitch testid="ad_free_switch" on={plan === "pro"} onAttempt={() => setPaywall(true)} />
          </div>
          <div className={ROW}>
            <span>
              {t.autoSync} <span className="ml-1 text-[10px] text-[#91908C]">Pro</span>
            </span>
            <ProSwitch testid="auto_sync_switch" on={plan === "pro"} onAttempt={() => setPaywall(true)} />
          </div>
          {/* 개발 모드 — /dev 에서 비밀번호로 연 사람에게만 보인다 */}
          {unlocked && (
            <div className={ROW}>
              <span>
                {t.devMode}
                <span className="mt-0.5 block text-[10px] text-[#91908C]">{t.devModeHint}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="flex overflow-hidden rounded-md border border-[#E9E9E7] text-xs dark:border-[#2F2F2F]">
                  {(["free", "pro"] as const).map((p) => (
                    <button
                      key={p}
                      data-testid={`dev_plan_${p}_button`}
                      onClick={() => setDevPlan(p)}
                      aria-pressed={devParam === p}
                      className={`px-2.5 py-1 ${
                        devParam === p
                          ? "bg-[#2383E2] font-semibold text-white"
                          : "hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
                      }`}
                    >
                      {p === "pro" ? t.pro : t.free}
                    </button>
                  ))}
                </span>
                <button
                  data-testid="dev_lock_button"
                  onClick={lockDev}
                  className="text-[10px] text-[#91908C] underline"
                >
                  {t.turnOff}
                </button>
              </span>
            </div>
          )}
          {/* 화면 언어 — 쿠키에 저장되고 서버 컴포넌트까지 같이 바뀐다 */}
          <div className={ROW}>
            <span>{t.language}</span>
            <span className="flex overflow-hidden rounded-md border border-[#E9E9E7] text-xs dark:border-[#2F2F2F]">
              {LANGS.map((l) => (
                <button
                  key={l}
                  data-testid={`lang_${l}_button`}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-2.5 py-1 ${
                    lang === l
                      ? "bg-[#2383E2] font-semibold text-white"
                      : "hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
                  }`}
                >
                  {LANG_LABEL[l]}
                </button>
              ))}
            </span>
          </div>
          {/* 로그아웃 — 목록 마지막, 파괴적 액션 = 빨간 텍스트 + 확인 단계 (HIG) */}
          <a
            data-testid="logout_button"
            href="/api/auth/logout"
            onClick={(e) => {
              if (!window.confirm(t.logoutConfirm)) e.preventDefault();
            }}
            className="block px-4 py-3 text-sm text-[#D44C47] hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
          >
            {t.logout}
          </a>
        </div>

        <div className="shrink-0 border-t border-[#E9E9E7] p-3 dark:border-[#2F2F2F]">
          {/* 그래프 범례 — 패널 맨 아래 */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[#91908C]">{t.legend}</p>
            <div className="space-y-1.5 text-[12px] leading-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#2E2C27] dark:border-[#8D8A83]" />
                {t.legendDbChild}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#C9C7C1] dark:border-[#4A4844]" />
                {t.legendPageChild}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-dashed border-[#C9C7C1] dark:border-[#4A4844]" />
                {t.legendRelation}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#2383E2]" />
                {t.legendHover}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-3 border-t border-[#E9E9E7] pt-3 text-[10px] text-[#91908C] dark:border-[#2F2F2F]">
            <Link href={legalPath(lang, "terms")} className="underline">{t.terms}</Link>
            <Link href={legalPath(lang, "privacy")} className="underline">{t.privacy}</Link>
            <Link href={legalPath(lang, "refund")} className="underline">{t.refund}</Link>
          </div>
          <NotionDisclaimer className="mt-2 text-[10px]" />
        </div>
      </div>
      {paywall && <PaywallModal onClose={() => setPaywall(false)} />}
    </>
  );
}
