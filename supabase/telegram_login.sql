-- Таблица привязки телефона к Telegram chat_id (для доставки кода входа через бота).
-- Выполнить в Supabase Dashboard -> SQL Editor.

create table if not exists public.telegram_links (
  phone text primary key,
  chat_id bigint not null,
  linked_at timestamptz not null default now()
);

alter table public.telegram_links enable row level security;
-- Доступ только через service_role (Edge Function) и security definer функции — без публичных policy.

-- Обновляем send_sms_hook: теперь код уходит в Telegram, а не в SMS.ru.
create or replace function public.send_sms_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text;
  v_otp text;
  v_chat_id bigint;
  v_bot_token text := '8977556541:AAFsJndOjAbONrYgA5MORtAMNZT6hFNqSUI';
begin
  v_phone := event->'user'->>'phone';
  v_otp := event->'sms'->>'otp';

  select chat_id into v_chat_id from public.telegram_links where phone = v_phone;

  if v_chat_id is null then
    raise exception 'phone_not_linked_to_telegram';
  end if;

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || v_bot_token || '/sendMessage',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('chat_id', v_chat_id, 'text', 'Ваш код для входа в Accord: ' || v_otp)
  );

  return '{}'::jsonb;
end;
$$;

grant execute on function public.send_sms_hook(jsonb) to supabase_auth_admin;
