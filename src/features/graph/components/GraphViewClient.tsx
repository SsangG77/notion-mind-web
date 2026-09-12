"use client";

import dynamic from "next/dynamic";

// sigma는 WebGL 전제 — 서버 모듈 평가 시 WebGL2RenderingContext 미정의로 죽음. 브라우저에서만 로드.
const GraphView = dynamic(() => import("./GraphView"), { ssr: false });

export default GraphView;
