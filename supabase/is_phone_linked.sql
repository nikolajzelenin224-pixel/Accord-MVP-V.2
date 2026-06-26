-- Публичная RPC-функция: проверка, привязан ли номер к Telegram (без раскрытия chat_id).
-- Выполнить в Supabase Dashboard -> SQL Editor.

create or replace function public.is_phone_linked(p_phone text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists(select 1 from public.telegram_links where phone = p_phone);
$$;

grant execute on function public.is_phone_linked(text) to anon, authenticated;
