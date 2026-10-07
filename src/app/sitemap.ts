import type { MetadataRoute } from "next";
import { LANGS, langHref } from "@/lib/i18n";
import { PUBLIC_PATHS, SITE_URL } from "@/lib/seo";

// 양 언어의 모든 공개 주소. changefreq 와 priority 는 구글이 무시한다고 공식 문서에 적혀 있어 넣지 않는다.
// lastmod 는 정확할 때만 쓰이므로 배포 시각을 쓴다(배포가 곧 내용 변경 시점).
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.flatMap((path) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}${langHref(lang, path)}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `${SITE_URL}${langHref(l, path)}`]),
        ),
      },
    })),
  );
}
