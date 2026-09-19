"use client";

import { useState } from "react";
import SearchPanel from "./SearchPanel";
import SettingsPanel from "./SettingsPanel";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

/** 상단 바 — 앱 이름(=설정) + 검색(+필터). 전부 노드 박스 스타일 */
export default function TopBar({
  loading,
  lastSync,
  onReload,
  workspace,
}: {
  loading: boolean;
  lastSync: number | null;
  onReload: () => void;
  workspace?: string;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
      {/* 좌측: 앱 이름(누르면 설정) + 검색 + 필터 */}
      <div className="pointer-events-auto flex items-start gap-2">
        <button
          data-testid="settings_button"
          title="설정"
          onClick={() => setSettingsOpen((v) => !v)}
          className={`${BLOCK} ${BLOCK_PRESS} flex h-9 items-center gap-2 px-3 text-sm font-semibold`}
        >
          {/* 기어(톱니) 아이콘 — 아이콘 먼저, 앱 이름 뒤 */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Notion-mind
        </button>
        <SearchPanel />
        {settingsOpen && (
          <SettingsPanel
            onClose={() => setSettingsOpen(false)}
            loading={loading}
            lastSync={lastSync}
            onReload={onReload}
            workspace={workspace}
          />
        )}
      </div>

    </div>
  );
}
