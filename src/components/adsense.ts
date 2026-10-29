// AdSense 게시자 ID — 공개 값(ads.txt 에도 있음). 서버(메타 태그)와 클라이언트(스크립트) 양쪽에서 씀
export const ADSENSE_CLIENT = "ca-pub-3545555975398754";

/**
 * 광고 단위 slot ID. 승인 전에는 빈 값이고, 그동안 광고 자리는 **아무것도 그리지 않는다**.
 *
 * ⚠️ 승인 전에 "광고 자리" 빈 상자를 띄우지 말 것. 구글은 심사에 코드 스니펫, ads.txt, 메타 태그
 * 중 하나만 요구하고 "사이트가 승인되기 전에는 광고가 게재되지 않습니다"라고 명시한다
 * (support.google.com/adsense/answer/7584263). 보여 줄 광고가 없으므로 빈 상자는 심사에 득이 없고,
 * 게시자 정책이 금지하는 "아직 미완성 상태인 화면"으로 읽힌다
 * (support.google.com/publisherpolicies/answer/11112688).
 *
 * 승인되면 여기에 slot ID 를 넣는다 — 그 순간 모든 자리가 실제 광고로 바뀐다.
 */
export const AD_SLOTS = {
  page: "",
  panel: "",
  article: "",
} as const;

export type AdVariant = keyof typeof AD_SLOTS;

/** 그 자리에 실제 광고가 그려지는지 — 레이아웃이 자리를 비울지 결정할 때 쓴다 */
export const hasAdSlot = (variant: AdVariant) => !!AD_SLOTS[variant];
