import type { NextConfig } from "next";

// 정식 주소는 notion-mind.com 하나. www와 옛 vercel.app 주소는 영구 리디렉션으로 모아
// 노션 OAuth 콜백·쿠키·검색 노출이 한 호스트에만 쌓이게 한다.
const CANONICAL_HOST = "notion-mind.com";
const ALIAS_HOSTS = ["www.notion-mind.com", "notion-mind-web.vercel.app"];

const nextConfig: NextConfig = {
  async redirects() {
    return ALIAS_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
