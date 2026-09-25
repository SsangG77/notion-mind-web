import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// 정식 주소는 notion-mind.com 하나. www와 옛 vercel.app 주소는 영구 리디렉션으로 모아
// 노션 OAuth 콜백·쿠키·검색 노출이 한 호스트에만 쌓이게 한다.
const CANONICAL_HOST = "notion-mind.com";
const ALIAS_HOSTS = ["www.notion-mind.com", "notion-mind-web.vercel.app"];

// 약관·개인정보처리방침은 MDX 문서(src/content/legal). 플러그인은 Turbopack 직렬화 때문에 문자열로 지정
const withMDX = createMDX({
  options: { remarkPlugins: [["remark-gfm"]] },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  async redirects() {
    return ALIAS_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default withMDX(nextConfig);
