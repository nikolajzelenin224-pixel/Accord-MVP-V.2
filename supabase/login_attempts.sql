-- Однокнопочный вход через Telegram: клиент генерирует случайный token,
-- открывает deep link t.me/<bot>?start=<token>, бот привязывает chat_id к token,
-- после шаринга контакта бот узнаёт phone, шлёт код и помечает attempt как code_sent.
-- Клиент поллингом узнаёт phone и переходит на экран ввода кода.

create table if not exists public.login_attempts (
  token text primary key,
  chat_id bigint,
  phone text,
  status text not null default 'pending', -- pending -> code_sent
  created_at timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
-- Доступ только через security definer RPC ниже, без публичных policy.

create or replace function public.get_login_attempt(p_token text)
returns table(phone text, status text)
language sql
security definer
set search_path = ''
as $$
  select phone, status from public.login_attempts where token = p_token;
$$;

grant execute on function public.get_login_attempt(text) to anon, authenticated;
