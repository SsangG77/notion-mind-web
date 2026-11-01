import Link from "next/link";
import { DICT, langHref, type Lang } from "@/lib/i18n";

/**
 * 글 안에 끼우는 유도 블록. 긴 글(가이드, FAQ, 검색어 글)에서 공용으로 쓴다.
 *
 * 목적지가 두 개인 이유: 처음 온 사람을 로그인창으로 바로 보내면 증거를 못 보고 나간다.
 * 글 중간에서는 홈의 예시 그래프로, 다 읽은 끝에서는 로그인으로 보낸다.
 *
 * ⚠️ 로그인은 `/api/auth/google` 이다. `/api/auth/login` 은 노션 연결 단계이고 세션이 있어야
 * 하므로, 로그인 전 방문자를 보내면 노션 동의까지 갔다가 no_session 으로 튕긴다.
 */
export default function CtaBlock({ lang, to }: { lang: Lang; to: "demo" | "login" }) {
  const t = DICT[lang];
  const demo = to === "demo";
  return (
    <div className="not-prose my-7 rounded-[10px] border-[1.5px] border-[#2E2C27] bg-[#F7F6F3] px-5 py-4 shadow-[4px_4px_0_#2E2C27] dark:border-black dark:bg-[#202020] dark:shadow-[4px_4px_0_#000]">
      <Link
        href={demo ? `${langHref(lang, "/")}#demo` : "/api/auth/google"}
        data-testid={demo ? "cta_demo_link" : "cta_login_link"}
        className="inline-block rounded-md bg-[#2383E2] px-4 py-2 text-sm font-semibold text-white no-underline"
      >
        {demo ? t.ctaDemoLabel : t.ctaLoginLabel}
      </Link>
      <p className="mt-2 mb-0 text-xs text-[#91908C]">{demo ? t.ctaDemoNote : t.ctaLoginNote}</p>
    </div>
  );
}
