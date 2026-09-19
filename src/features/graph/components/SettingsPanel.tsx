"use client";

import { useState } from "react";
import Link from "next/link";
import PaywallModal from "./PaywallModal";
import { BLOCK } from "@/components/blockStyle";

const ROW =
  "flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#2F2F2F]";

/** Pro 전용 기능 스위치 — 켜려고 하면 페이월 노출 */
function ProSwitch({ testid, onAttempt }: { testid: string; onAttempt: () => void }) {
  return (
    <button
      data-testid={testid}
      onClick={onAttempt}
      className="relative h-[18px] w-[34px] rounded-full bg-[#E9E9E7] dark:bg-black"
      aria-checked="false"
      role="switch"
    >
      <span className="absolute left-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow" />
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
}: {
  onClose: () => void;
  loading: boolean;
  lastSync: number | null;
  onReload: () => void;
  /** 연결된 노션 워크스페이스 이름 — 상단 헤더가 사라져 이 패널이 표시 자리 */
  workspace?: string;
}) {
  const [paywall, setPaywall] = useState(false);
  const [closing, setClosing] = useState(false);
  // 닫기 애니메이션이 끝난 뒤 실제 언마운트
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };
  const syncTime = lastSync
    ? new Date(lastSync).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
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
            <span className="block text-sm font-semibold">설정</span>
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
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto text-sm">
          <Link
            data-testid="plan_row"
            href="/pricing"
            className={`${ROW} hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}
          >
            <span>요금제</span>
            <span className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#F4F3EF] px-2.5 py-0.5 text-xs font-semibold dark:bg-[#35342F]">
                Free
              </span>
              <span className="text-[#91908C]">›</span>
            </span>
          </Link>
          <div className={ROW}>
            <span>
              연결된 페이지
              <span className="mt-0.5 block text-[10px] text-[#91908C]">
                그래프에 넣을 페이지·DB를 다시 고름
              </span>
            </span>
            <a
              data-testid="reconnect_pages_button"
              href="/api/auth/login"
              className="shrink-0 rounded-md border border-[#E9E9E7] px-2.5 py-1 text-xs hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
            >
              변경
            </a>
          </div>
          <div className={ROW}>
            <span>
              수동 동기화
              {syncTime && (
                <span className="ml-1 block text-[10px] text-[#91908C]">마지막 {syncTime}</span>
              )}
            </span>
            <button
              data-testid="sync_button"
              disabled={loading}
              onClick={onReload}
              className="rounded-md border border-[#E9E9E7] px-2.5 py-1 text-xs hover:bg-[#F4F3EF] disabled:opacity-50 dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
            >
              {loading ? "동기화 중…" : "↻ 동기화"}
            </button>
          </div>
          <div className={ROW}>
            <span>
              광고 제거 <span className="ml-1 text-[10px] text-[#91908C]">Pro</span>
            </span>
            <ProSwitch testid="ad_free_switch" onAttempt={() => setPaywall(true)} />
          </div>
          <div className={ROW}>
            <span>
              자동 동기화 <span className="ml-1 text-[10px] text-[#91908C]">Pro</span>
            </span>
            <ProSwitch testid="auto_sync_switch" onAttempt={() => setPaywall(true)} />
          </div>
          {/* 로그아웃 — 목록 마지막, 파괴적 액션 = 빨간 텍스트 + 확인 단계 (HIG) */}
          <a
            data-testid="logout_button"
            href="/api/auth/logout"
            onClick={(e) => {
              if (!window.confirm("로그아웃할까요?")) e.preventDefault();
            }}
            className="block px-4 py-3 text-sm text-[#D44C47] hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
          >
            로그아웃
          </a>
        </div>

        <div className="shrink-0 border-t border-[#E9E9E7] p-3 dark:border-[#2F2F2F]">
          {/* 그래프 범례 — 패널 맨 아래 */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[#91908C]">그래프 범례</p>
            <div className="space-y-1.5 text-[12px] leading-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#2E2C27] dark:border-[#8D8A83]" />
                DB 소속 페이지
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#C9C7C1] dark:border-[#4A4844]" />
                페이지 안 페이지·DB
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-dashed border-[#C9C7C1] dark:border-[#4A4844]" />
                관계형(relation)
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#2383E2]" />
                호버한 노드의 연결
              </div>
            </div>
          </div>
        </div>
      </div>
      {paywall && <PaywallModal onClose={() => setPaywall(false)} />}
    </>
  );
}
