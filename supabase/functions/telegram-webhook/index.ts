// Webhook для Telegram-бота @accord_sup_bot.
// Однокнопочный вход: deep link t.me/<bot>?start=<token> -> бот привязывает chat_id к token,
// после шаринга контакта узнаёт phone, шлёт код через signInWithOtp (наш Send SMS hook доставит его сюда же).
// Деплоить с --no-verify-jwt (Telegram вызывает без авторизации).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('TG_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return '7' + digits.slice(1);
  if (digits.length === 11 && digits.startsWith('7')) return digits;
  if (digits.length === 10) return '7' + digits;
  return digits;
}

async function sendMessage(chatId: number, text: string, replyMarkup?: Record<string, unknown>) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
  });
}

Deno.serve(async (req) => {
  const update = await req.json();
  const message = update.message;
  if (!message) return new Response('ok');

  const chatId = message.chat.id;

  if (message.contact?.phone_number) {
    const phone = normalizePhone(message.contact.phone_number);

    await supabase.from('telegram_links').upsert({ phone, chat_id: chatId });

    const { data: attempt } = await supabase
      .from('login_attempts')
      .select('token')
      .eq('chat_id', chatId)
      .is('phone', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    await sendMessage(chatId, 'Готово! Отправляю код входа...');

    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: '+' + phone });

    if (otpError) {
      await sendMessage(chatId, `Не удалось отправить код: ${otpError.message}`);
      return new Response('ok');
    }

    if (attempt?.token) {
      await supabase
        .from('login_attempts')
        .update({ phone, status: 'code_sent' })
        .eq('token', attempt.token);
    }

    return new Response('ok');
  }

  if (message.text?.startsWith('/start')) {
    const parts = message.text.split(' ');
    const token = parts[1];
    if (token) {
      await supabase.from('login_attempts').upsert({ token, chat_id: chatId });
    }
    await sendMessage(chatId, 'Здравствуйте! Чтобы войти в Accord, поделитесь своим номером телефона.', {
      keyboard: [[{ text: 'Поделиться номером', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    });
    return new Response('ok');
  }

  await sendMessage(chatId, 'Нажмите /start в приложении Accord, чтобы войти.');
  return new Response('ok');
});
