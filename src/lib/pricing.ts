// Pro 가격 — Paddle 카탈로그(lib/paddle.ts PRICE_IDS)와 반드시 같은 값이어야 한다.
// 화면 여러 곳(요금제, 페이월, 소개)에서 쓰므로 서버 전용 모듈과 떨어뜨려 둔다.
export const PRO_PRICE = { monthly: 7, yearly: 48 } as const;
export const YEARLY_DISCOUNT = Math.round((1 - PRO_PRICE.yearly / (PRO_PRICE.monthly * 12)) * 100);
export const YEARLY_SAVING = PRO_PRICE.monthly * 12 - PRO_PRICE.yearly;
