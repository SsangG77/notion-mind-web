import type { MDXComponents } from "mdx/types";

// App Router MDX 필수 파일 — 위치(src/ 바로 아래) 바뀌면 런타임 에러
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
