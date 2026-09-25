"use client";

import { openCookieSettings } from "./cookieConsent";

export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      data-testid="cookie_settings_link"
      onClick={openCookieSettings}
      className="text-[#2383E2] underline"
    >
      {label}
    </button>
  );
}
