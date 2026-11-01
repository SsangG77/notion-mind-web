-- 이벤트 Pro 체험 쿠폰. Supabase SQL 편집기에서 한 번 실행.
-- 코드는 공용 한 개고, 1회 제한은 코드가 아니라 계정과 워크스페이스에 걸린다.
create table public.promo_coupons (
  code text primary key,
  days integer not null default 30,
  note text,
  -- 이벤트 마감일. 공용 코드는 받은 사람이 남에게 넘길 수 있으므로 받는 쪽에 끝을 둔다
  closes_on date not null,
  created_at timestamptz not null default now()
);

-- 사용 기록 — 1계정 1회, 1워크스페이스 1회를 기본키와 유니크로 막는다(앱 코드가 아니라 DB 가)
create table public.promo_redemptions (
  user_id text primary key,
  workspace_id text not null unique,
  code text not null references public.promo_coupons(code),
  redeemed_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- 요금제 판정이 매 요청마다 "내 유효한 기간" 을 찾는다
create index promo_redemptions_active on public.promo_redemptions (user_id, expires_at);

-- 다른 테이블과 같은 방침: RLS 켜고 정책 없음 → 서버의 service 키로만 접근
alter table public.promo_coupons enable row level security;
alter table public.promo_redemptions enable row level security;

-- 쿠폰 등록 (이벤트 하나 = 한 줄)
insert into public.promo_coupons (code, days, note, closes_on)
values ('NM1030', 30, 'event-connect', '2026-11-30');
