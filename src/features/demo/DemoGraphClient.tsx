"use client";

import dynamic from "next/dynamic";
import { DEMO_ITEMS } from "./data";

// sigma 는 WebGL 전제라 서버에서 모듈이 평가되면 죽는다 — 브라우저 전용 로드
const GraphView = dynamic(() => import("@/features/graph/components/GraphView"), { ssr: false });

export default function DemoGraphClient({ workspace }: { workspace: string }) {
  // 예시 화면은 로그인이 없으므로 Free 로 그린다. 개발 모드 토글도 숨긴다
  return <GraphView workspace={workspace} plan="free" unlocked={false} demoItems={DEMO_ITEMS} />;
}
