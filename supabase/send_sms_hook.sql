-- Альтернатива HTTPS Edge Function hook: Postgres-функция для Send SMS hook.
-- Используется из-за ограничения GoTrue с новой системой JWT-ключей (нет legacy secret
-- для подписи внутреннего токена авторизации HTTPS-хуков).
-- Выполнить в Supabase Dashboard -> SQL Editor.

create extension if not exists pg_net;

create or replace function public.send_sms_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text;
  v_otp text;
  v_api_id text := '7CFBFFF6-A758-E1EC-C043-05D80B14C263';
begin
  v_phone := event->'user'->>'phone';
  v_otp := event->'sms'->>'otp';

  perform net.http_get(
    url := 'https://sms.ru/sms/send'
      || '?api_id=' || v_api_id
      || '&to=' || v_phone
      || '&msg=' || replace('Accord code: ' || v_otp, ' ', '%20')
      || '&json=1'
  );

  return '{}'::jsonb;
end;
$$;

grant execute on function public.send_sms_hook(jsonb) to supabase_auth_admin;
