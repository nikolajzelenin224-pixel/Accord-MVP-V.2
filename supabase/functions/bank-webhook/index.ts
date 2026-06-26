// Вебхук для MacroDroid: телефон админа ловит SMS/пуш от банка о входящем переводе
// и шлёт сюда сырой текст. Функция парсит сумму, ищет самую старую заявку на
// пополнение (balance_topups, status='pending') с такой же суммой и зачисляет
// баланс на нужную карту (mir/mc) того пользователя.
// Деплоить с --no-verify-jwt (MacroDroid не умеет в Supabase JWT, проверяем своим секретом).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('TG_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('BANK_WEBHOOK_SECRET')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function parseAmount(text: string): number | null {
  // Ищем число рядом с пометкой валюты: "1 234,56 руб", "1234.56 RUB", "+5000р", "1500 ₽", "+399р" (формат Сбера),
  // "20.51 USD", "$20.51" (формат Freedom Bank).
  const match = text.match(/(?:\$\s*(\d[\d\s]*(?:[.,]\d{1,2})?))|(?:(\d[\d\s]*(?:[.,]\d{1,2})?)\s*(?:₽|руб\.?|RUB|rub|USD|usd|\$|р(?![а-яёa-z])))/i);
  if (!match) return null;
  const raw = match[1] ?? match[2];
  if (!raw) return null;
  const normalized = raw.replace(/\s/g, '').replace(',', '.');
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('unauthorized', { status: 401 });
  }

  const { text } = await req.json().catch(() => ({ text: '' }));
  const amount = text ? parseAmount(text) : null;

  let matchedId: string | null = null;

  if (amount !== null) {
    const { data: candidates } = await supabase
      .from('balance_topups')
      .select('id, user_id, card_type, amount')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    const match = candidates?.find((c) => Math.abs(Number(c.amount) - amount) < 0.01);

    if (match) {
      matchedId = match.id;

      await supabase
        .from('balance_topups')
        .update({ status: 'confirmed', confirmed_by: 'admin' })
        .eq('id', match.id);

      const { data: card } = await supabase
        .from('cards')
        .select('id, balance')
        .eq('user_id', match.user_id)
        .eq('type', match.card_type)
        .maybeSingle();

      if (card) {
        await supabase
          .from('cards')
          .update({ balance: Number(card.balance) + amount })
          .eq('id', card.id);
      }
    }
  }

  await supabase.from('bank_webhook_log').insert({
    raw_text: text ?? null,
    parsed_amount: amount,
    matched_topup_id: matchedId,
  });

  return new Response(JSON.stringify({ ok: true, parsed_amount: amount, matched: Boolean(matchedId) }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
