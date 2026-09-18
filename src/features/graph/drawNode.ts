import { DB_NODE_SIZE, PAGE_NODE_SIZE, T } from "./tokens";

interface BlockData {
  key?: string;
  x: number;
  y: number;
  size: number;
  label?: string | null;
  color?: string;
}

// 호버 포커스 — 설정되면 중심·이웃 외 노드는 흐리게 (옵시디언식 강조)
let focus: { center: string; connected: Set<string> } | null = null;
export function setFocus(next: { center: string; connected: Set<string> } | null) {
  focus = next;
}

// 상세 패널에서 선택된 노드 — 액센트 테두리 + 글로우 유지
let selected: string | null = null;
export function setSelected(id: string | null) {
  selected = id;
}

// 텍스트 최대 너비(기준 스케일 px) — 초과 시 2줄 랩, 그래도 넘치면 말줄임
export const NODE_MAX_TEXT_W = 195; // 글자 30% 확대에 맞춰 비례 확대

// 줌 스케일이 이보다 작으면 타이틀 숨기고 정사각 박스만 표시 (호버 시 원래 블록으로 확장).
// 기본 0.7, 레이아웃 후 실제 밀도 기준으로 재계산됨 — 블록끼리 안 겹치는 줌부터 실물 표시
// 0.38 = 줌 약 14.4% 경계 — 15%까지는 타이틀 블록, 14%부터 정사각
let compactS = 0.38;
export function setCompactS(v: number) {
  compactS = v;
}
export function getCompactS() {
  return compactS;
}

// 블록 최소 표시 스케일 — 축소해도 이 밑으로는 안 작아짐 (글자 가독성 유지)
export const MIN_BLOCK_S = 0.8;

// 블록 절반 크기 추정 (noverlap 충돌 반경 + 호버 히트 판정용)
// ponytail: 캔버스 실측 대신 글자폭 휴리스틱 — 오차 크면 measureText 실측으로 교체
export function estimateBlockHalf(
  title: string,
  isDb: boolean,
): { halfW: number; halfH: number } {
  let raw = 0;
  for (const ch of title) raw += ch.charCodeAt(0) > 0x2e80 ? 17.5 : 9.8; // CJK/라틴 대략폭 (글자 130%)
  const textW = Math.min(raw, NODE_MAX_TEXT_W);
  const font = isDb ? 18 : 17;
  const lines = raw > NODE_MAX_TEXT_W ? 2 : 1;
  const halfW = (textW + (isDb ? 16 * 2 + 16 : 12 * 2)) / 2; // 패딩 + DB 아이콘 폭
  const halfH = (font + (lines - 1) * font * 1.3 + (isDb ? 10 : 7) * 2) / 2;
  return { halfW, halfH };
}

// 축소 상태의 미니 정사각 노드 (화면 px 고정 크기)
function drawCompactSquare(ctx: CanvasRenderingContext2D, data: BlockData, isDb: boolean) {
  const side = isDb ? 16 : 12;
  const off = 3;
  const r = 3;
  const x = data.x - side / 2;
  const y = data.y - side / 2;
  ctx.beginPath();
  ctx.roundRect(x + off, y + off, side, side, r);
  ctx.fillStyle = T.extrude;
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x, y, side, side, r);
  ctx.fillStyle = isDb ? T.dbFace : T.pageFace;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = T.extrude;
  ctx.stroke();
}

/** maxW 안에 들어가는 최장 prefix 글자 수 */
function fitChars(ctx: CanvasRenderingContext2D, text: string, maxW: number): number {
  let n = text.length;
  while (n > 1 && ctx.measureText(text.slice(0, n)).width > maxW) n--;
  return n;
}

/** maxLines까지 랩, 초과분은 말줄임 (maxLines=Infinity면 전체 표시). ctx.font 설정 후 호출 */
function wrapLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let rest = text;
  while (rest && lines.length < maxLines) {
    if (ctx.measureText(rest).width <= maxW) {
      lines.push(rest);
      return lines;
    }
    if (lines.length === maxLines - 1) {
      const fit = fitChars(ctx, rest, maxW - ctx.measureText("…").width);
      lines.push(rest.slice(0, fit).trimEnd() + "…");
      return lines;
    }
    // 공백 경계 우선 절단 (너무 앞이면 강제 절단)
    const fit = fitChars(ctx, rest, maxW);
    const space = rest.lastIndexOf(" ", fit);
    const cut = space >= fit * 0.6 ? space : fit;
    lines.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  return lines;
}

// 확정 디자인: 우·하단 돌출 입체 블록 노드.
// 타입 판별은 face 색으로 (DB=#F4F3EF / 페이지=#FDFDFC) — drawLabel 에는 커스텀 속성이 안 넘어옴.
function drawBlock(
  ctx: CanvasRenderingContext2D,
  data: BlockData,
  highlighted: boolean,
) {
  if (!data.label) return;
  const isDb = data.color?.startsWith(T.dbFace) ?? false; // 색에 투명 알파(00)가 붙어 있음
  // 포커스 밖 노드는 반투명 처리 (중심·이웃 제외)
  const dimmed =
    focus != null &&
    data.key != null &&
    data.key !== focus.center &&
    !focus.connected.has(data.key);
  if (dimmed) {
    ctx.save();
    ctx.globalAlpha = 0.15;
  }
  // 포커스 중심만 확장·글로우. 이웃은 호버 레이어에 "선명한 일반 블록"으로만 (하이라이트 효과)
  const isCenter = focus == null || data.key == null || data.key === focus.center;
  const isSelected = selected != null && data.key === selected;
  const emph = (highlighted && isCenter) || isSelected;
  let s = data.size / (isDb ? DB_NODE_SIZE : PAGE_NODE_SIZE); // 줌 스케일
  if (s < compactS) {
    if (!emph) {
      drawCompactSquare(ctx, data, isDb);
      if (dimmed) ctx.restore();
      return;
    }
    s = 1; // 축소 상태에서 호버하면 원래 크기 블록으로 확장해 타이틀 표시
  }
  s = Math.max(s, MIN_BLOCK_S); // 최소 표시 크기 — 축소 시 가독성 유지
  const font = (isDb ? 18 : 17) * s; // 기존 14/13에서 30% 확대
  const weight = isDb ? 600 : 400;
  ctx.font = `${weight} ${font}px -apple-system, "Segoe UI", sans-serif`;

  const iconW = isDb ? font * 1.15 : 0; // DB 디스크 아이콘 영역
  const padX = (isDb ? 16 : 12) * s;
  const padY = (isDb ? 10 : 7) * s;
  // 호버 시 2줄 고정 유지, 최대 너비를 풀어 좌우로 확장 — 전체 타이틀 표시
  let maxW = NODE_MAX_TEXT_W * s;
  if (emph) {
    const fullW = ctx.measureText(data.label).width;
    // 기존 너비 이상으로만 확장 (절반씩 2줄 + 절단 여유) — 줄어들면 뒤의 일반 블록이 비져나옴
    maxW = Math.max(maxW, fullW / 2 + font * 1.5);
  }
  const lines = wrapLabel(ctx, data.label, maxW, 2);
  const textW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const lineH = font * 1.3;
  const w = textW + iconW + padX * 2;
  const h = font + (lines.length - 1) * lineH + padY * 2;
  const x = data.x - w / 2;
  const y = data.y - h / 2;
  const r = 8 * s;
  const off = 4.5 * s; // 돌출 두께 (우·하 4~5px)

  // 돌출면 (우·하 오프셋 블록)
  ctx.beginPath();
  ctx.roundRect(x + off, y + off, w, h, r);
  ctx.fillStyle = T.extrude;
  ctx.fill();

  // 본면
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = isDb ? T.dbFace : T.pageFace;
  if (emph) {
    ctx.save();
    ctx.shadowColor = isSelected ? "rgba(35, 131, 226, 0.4)" : "rgba(35, 131, 226, 0.14)";
    ctx.shadowBlur = (isSelected ? 14 : 5) * s;
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fill();
  }
  ctx.lineWidth = (isSelected ? 2.5 : 1.5) * s;
  ctx.strokeStyle = emph ? T.accent : T.extrude;
  ctx.stroke();

  // DB 디스크 아이콘 (1.5px 스트로크 실린더)
  let textX = x + padX;
  if (isDb) {
    const cx = x + padX + iconW * 0.38;
    const cy = data.y;
    const rw = font * 0.42;
    const rh = font * 0.16;
    const bh = font * 0.55;
    ctx.lineWidth = 1.5 * s;
    ctx.strokeStyle = T.text;
    ctx.beginPath();
    ctx.ellipse(cx, cy - bh / 2, rw, rh, 0, 0, Math.PI * 2);
    ctx.moveTo(cx - rw, cy - bh / 2);
    ctx.lineTo(cx - rw, cy + bh / 2);
    ctx.moveTo(cx + rw, cy - bh / 2);
    ctx.lineTo(cx + rw, cy + bh / 2);
    ctx.moveTo(cx - rw, cy + bh / 2);
    ctx.ellipse(cx, cy + bh / 2, rw, rh, 0, 0, Math.PI, false);
    ctx.stroke();
    textX += iconW;
  }

  ctx.fillStyle = T.text;
  ctx.textBaseline = "middle";
  const firstLineY = data.y - ((lines.length - 1) * lineH) / 2;
  lines.forEach((line, i) => ctx.fillText(line, textX, firstLineY + i * lineH));
  if (dimmed) ctx.restore();
}

export function drawNodeLabel(ctx: CanvasRenderingContext2D, data: BlockData) {
  drawBlock(ctx, data, false);
}

export function drawNodeHover(ctx: CanvasRenderingContext2D, data: BlockData) {
  drawBlock(ctx, data, true);
}
