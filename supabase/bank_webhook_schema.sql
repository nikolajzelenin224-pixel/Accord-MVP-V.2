-- Баланс хранится на самой карте (у каждой карты — свой реальный баланс).
alter table public.cards
  add column if not exists balance numeric(10,2) not null default 0;

-- Заявка на пополнение должна знать, какую карту пополняем.
alter table public.balance_topups
  add column if not exists card_type text check (card_type in ('mir', 'mc'));

-- Лог входящих вебхуков от MacroDroid — для отладки парсинга, не критично для работы.
create table if not exists public.bank_webhook_log (
  id uuid primary key default gen_random_uuid(),
  raw_text text,
  parsed_amount numeric(10,2),
  matched_topup_id uuid references public.balance_topups(id),
  created_at timestamptz not null default now()
);

alter table public.bank_webhook_log enable row level security;
-- Доступ только через service_role (Edge Function), обычным юзерам не нужен.
