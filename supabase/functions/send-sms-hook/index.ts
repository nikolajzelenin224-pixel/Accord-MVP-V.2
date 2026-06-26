// Supabase Auth "Send SMS hook" — вызывается на каждую попытку отправки OTP-кода.
// Регистрируется в Dashboard → Authentication → Hooks → Send SMS hook.
// Отправляет код через SMS.ru вместо встроенных провайдеров (Twilio и т.п.).

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const SMSRU_API_ID = Deno.env.get('SMSRU_API_ID')!;
const HOOK_SECRET = Deno.env.get('SEND_SMS_HOOK_SECRET')!; // тот же секрет, что задан в настройках хука

Deno.serve(async (req) => {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let data;
  try {
    const wh = new Webhook(HOOK_SECRET);
    data = wh.verify(payload, headers);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  const { user, sms } = data as { user: { phone: string }; sms: { otp: string } };

  const url = new URL('https://sms.ru/sms/send');
  url.searchParams.set('api_id', SMSRU_API_ID);
  url.searchParams.set('to', user.phone);
  url.searchParams.set('msg', `Accord: ваш код ${sms.otp}`);
  url.searchParams.set('json', '1');

  const res = await fetch(url.toString());
  const result = await res.json();

  if (result.status !== 'OK' || result.sms?.[user.phone]?.status !== 'OK') {
    return new Response(JSON.stringify({ error: 'SMS.ru send failed', details: result }), { status: 500 });
  }

  return new Response(JSON.stringify({}), { status: 200 });
});
