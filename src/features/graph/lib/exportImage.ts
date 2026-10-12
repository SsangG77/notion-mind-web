import type Sigma from "sigma";
import { T } from "../tokens";

/**
 * 보이는 그래프를 PNG 로 뽑는다.
 *
 * sigma 는 캔버스를 여러 장 겹쳐 쓴다(WebGL 노드와 엣지, 2D 라벨, 그리고 우리가 끼워 넣은 relation 점선).
 * 한 장만 읽으면 선이나 블록이 빠지므로 컨테이너 안의 모든 캔버스를 DOM 순서대로 합성한다.
 *
 * ⚠️ sigma 는 WebGL 컨텍스트를 `preserveDrawingBuffer: false` 로 만든다(라이브러리에 하드코딩).
 * 프레임이 화면에 합성되고 나면 그 캔버스는 비어 버리므로, 바깥에서 읽으면 노드가 통째로 빠진 그림이 나온다.
 * 그래서 `afterRender` 안에서, 즉 그리기가 끝나고 합성되기 전에 읽는다.
 */
export function exportGraphPng(sigma: Sigma, dark: boolean): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      sigma.off("afterRender", onRender);
      reject(new Error("render timed out"));
    }, 5000);

    function onRender() {
      sigma.off("afterRender", onRender);
      clearTimeout(timeout);
      try {
        const container = sigma.getContainer();
        const { width, height } = sigma.getDimensions();
        const dpr = window.devicePixelRatio || 1;

        const out = document.createElement("canvas");
        out.width = Math.round(width * dpr);
        out.height = Math.round(height * dpr);
        const ctx = out.getContext("2d");
        if (!ctx) throw new Error("canvas 2d context unavailable");

        // 투명 PNG 는 노션이나 슬랙에 붙이면 읽을 수 없다. 화면과 같은 배경을 깔아 준다
        ctx.fillStyle = dark ? "#191919" : T.bg;
        ctx.fillRect(0, 0, out.width, out.height);

        for (const c of container.querySelectorAll("canvas")) {
          if (c.width === 0 || c.height === 0) continue;
          ctx.drawImage(c, 0, 0, out.width, out.height);
        }
        out.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
          "image/png",
        );
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    }

    sigma.on("afterRender", onRender);
    sigma.refresh();
  });
}

/** 파일 이름 — 워크스페이스 이름이 있으면 쓰고, 날짜를 붙여 덮어쓰기를 피한다 */
export function exportFileName(workspace?: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const base = (workspace ?? "notion-mind").replace(/[^\w가-힣 -]/g, "").trim() || "notion-mind"; // i18n-allow: 화면 문구가 아니라 파일명에 허용할 문자 범위
  return `${base} ${day}.png`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 클릭 직후 해제하면 일부 브라우저가 저장을 못 끝낸다
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
