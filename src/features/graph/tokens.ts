// 디자인 탭 확정 토큰 — 캔버스 드로잉용 JS 상수 (라이트/다크)
export interface Palette {
  bg: string;
  dot: string;
  surface: string;
  pageFace: string;
  dbFace: string;
  extrude: string;
  text: string;
  border: string;
  accent: string;
  /** 소속선(DB 안 페이지, 페이지 안 페이지와 DB) — 뼈대라 배경으로 물러남 */
  edgeHierarchy: string;
  /** 관계형 점선 — 이 제품에서 보는 선이라 소속선보다 진함. 액센트는 호버 표시와 겹쳐 쓰지 않음 */
  edgeRelation: string;
  /** 호버 포커스 밖 엣지의 고스트 색 (배경에 가깝게) */
  edgeDim: string;
}

export const LIGHT: Palette = {
  bg: "#FFFFFF",
  dot: "#E9E9E7",
  surface: "#F7F6F3",
  pageFace: "#FDFDFC",
  dbFace: "#F4F3EF",
  extrude: "#2E2C27",
  text: "#37352F",
  border: "#E9E9E7",
  accent: "#2383E2",
  edgeHierarchy: "#C9C7C1",
  edgeRelation: "#57564F",
  edgeDim: "#E7E6E2",
};

// 다크 노드 면·돌출·텍스트는 디자인 탭 확정값, 엣지 회색·도트는 대비 맞춘 파생값
export const DARK: Palette = {
  bg: "#191919",
  dot: "#2F2F2F",
  surface: "#202020",
  pageFace: "#2B2A27",
  dbFace: "#35342F",
  extrude: "#000000",
  text: "#EDEDEC",
  border: "#2F2F2F",
  accent: "#2383E2",
  edgeHierarchy: "#4A4844",
  edgeRelation: "#A8A6A0",
  edgeDim: "#212120",
};

// 현재 테마 팔레트 — 캔버스 draw 함수들이 매 프레임 참조 (교체는 applyTheme로만)
export const T: Palette = { ...LIGHT };

export function applyTheme(dark: boolean) {
  Object.assign(T, dark ? DARK : LIGHT);
}

// 노드 픽킹 반경(px) — sigma 히트 판정 겸 블록 스케일 기준
export const DB_NODE_SIZE = 12;
export const PAGE_NODE_SIZE = 8;
