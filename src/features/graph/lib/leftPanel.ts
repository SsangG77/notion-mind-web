// 좌측 슬라이드 패널은 한 번에 하나만(설정 / 숨긴 목록). 둘이 다른 컴포넌트에 살아서 모듈 스토어로 조정
export type LeftPanel = "settings" | "hidden" | null;

let active: LeftPanel = null;
const listeners = new Set<() => void>();

export const getLeftPanel = () => active;
export const getLeftPanelServer = (): LeftPanel => null;
export function setLeftPanel(v: LeftPanel) {
  if (active === v) return;
  active = v;
  listeners.forEach((l) => l());
}
export function subscribeLeftPanel(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
