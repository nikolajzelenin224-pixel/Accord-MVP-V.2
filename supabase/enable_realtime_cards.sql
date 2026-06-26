-- Включаем Realtime для cards: без этого UPDATE баланса (из bank-webhook) не долетит
-- до клиента, и карта на главном экране не обновится без перезагрузки страницы.
alter publication supabase_realtime add table public.cards;

-- Тоже нужно: TopUpModal слушает статус своей заявки, чтобы само окно
-- переключилось на "Успешно", если пользователь его не закрыл.
alter publication supabase_realtime add table public.balance_topups;
