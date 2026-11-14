import type { MetadataRoute } from "next";
import { LANGS, langHref } from "@/lib/i18n";
import { BLOG_POSTS, PUBLIC_PATHS, SITE_URL } from "@/lib/seo";

// 양 언어의 모든 공개 주소. changefreq 와 priority 는 구글이 무시한다고 공식 문서에 적혀 있어 넣지 않는다.
// lastmod 는 정확할 때만 쓰인다. 글은 본문을 마지막으로 고친 날(BLOG_POSTS 의 updated)을 쓰고,
// 나머지는 배포 시각을 쓴다(배포가 곧 내용 변경 시점). 전부 배포 시각이면 글을 고쳐도 구별이 안 된다.
const deployedAt = new Date();
const lastModifiedOf = (path: string) => {
  const post = BLOG_POSTS.find((p) => p.path === path);
  return post ? new Date(post.updated) : deployedAt;
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.flatMap((path) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}${langHref(lang, path)}`,
      lastModified: lastModifiedOf(path),
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `${SITE_URL}${langHref(l, path)}`]),
        ),
      },
    })),
  );
}
