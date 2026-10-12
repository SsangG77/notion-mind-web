// 이미지 내보내기의 전제 조건을 고정한다.
// sigma 는 preserveDrawingBuffer 를 끄므로, afterRender 밖에서 캔버스를 읽으면 빈 그림이 나온다.
import { readFileSync } from "node:fs";
import assert from "node:assert";

const src = readFileSync("src/features/graph/lib/exportImage.ts", "utf8");
const sigma = readFileSync("node_modules/sigma/dist/sigma.esm.js", "utf8");

assert.ok(
  /preserveDrawingBuffer:\s*false/.test(sigma),
  "sigma 가 preserveDrawingBuffer 를 켜게 바뀌었다면 이 검사와 주석을 갱신할 것",
);
assert.ok(/afterRender/.test(src), "afterRender 밖에서 읽으면 WebGL 캔버스가 비어 나온다");
assert.ok(/querySelectorAll\("canvas"\)/.test(src), "캔버스를 전부 합성해야 선과 블록이 다 들어간다");
assert.ok(/fillRect/.test(src), "배경을 깔지 않으면 투명 PNG 가 나온다");
assert.ok(/clearTimeout|timed out/.test(src), "렌더가 안 오면 영원히 멈춘다");

console.log("✓ 이미지 내보내기 전제 5건 통과");
