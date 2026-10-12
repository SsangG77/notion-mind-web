// Pro 가격 — Paddle 카탈로그(lib/paddle.ts PRICE_IDS)와 반드시 같은 값이어야 한다.
// 화면 여러 곳(요금제, 페이월, 소개)에서 쓰므로 서버 전용 모듈과 떨어뜨려 둔다.
export const PRO_PRICE = { monthly: 7, yearly: 48 } as const;
/** 연간 결제를 월로 환산한 금액 — 두 요금을 같은 단위로 세워야 비교가 된다 */
export const YEARLY_PER_MONTH = PRO_PRICE.yearly / 12;
export const YEARLY_DISCOUNT = Math.round((1 - PRO_PRICE.yearly / (PRO_PRICE.monthly * 12)) * 100);
export const YEARLY_SAVING = PRO_PRICE.monthly * 12 - PRO_PRICE.yearly;
