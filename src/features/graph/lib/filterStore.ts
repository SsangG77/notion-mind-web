import { DEFAULT_FILTER, type FilterState } from "./graphFilter";

// 필터 상태는 필터 패널, 호버 메뉴, 하단 칩이 함께 읽고 바꾼다 — 서로 다른 컴포넌트라 모듈 스토어로 공유
// ponytail: 세션 한정. Pro 영구 저장이 필요해지면 workspace_settings 에 컬럼 추가
let state: FilterState = DEFAULT_FILTER;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const getFilter = () => state;
export const getFilterServer = () => DEFAULT_FILTER;
export function setFilter(patch: Partial<FilterState>) {
  state = { ...state, ...patch };
  notify();
}
/** 상태는 그대로 두고 다시 거르게 한다 — 사용자가 숨긴 노드를 다시 보이게 한 뒤 */
export const refreshFilter = notify;
export function subscribeFilter(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function toggleCollapsed(db: string) {
  const next = new Set(state.collapsed);
  if (next.has(db)) next.delete(db);
  else next.add(db);
  setFilter({ collapsed: next });
}
