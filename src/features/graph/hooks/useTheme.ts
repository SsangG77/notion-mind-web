"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "nm:theme";

/** 시스템 따름 + 수동 토글(저장). dark 여부와 토글 반환 */
export function useTheme(): { dark: boolean; toggle: () => void } {
  const [pref, setPref] = useState<"light" | "dark" | null>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  });
  const [sysDark, setSysDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const dark = pref ? pref === "dark" : sysDark;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setPref(() => {
      const next = dark ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // 스토리지 불가 환경 무시
      }
      return next;
    });
  }, [dark]);

  return { dark, toggle };
}
