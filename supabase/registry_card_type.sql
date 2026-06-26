-- Классификация сервисов реестра: какой картой оплачивается подписка.
-- 'mir' — сервис работает с российскими картами (списываем с карты МИР).
-- 'mc'  — сервис требует зарубежную карту (списываем с карты Mastercard).
-- По умолчанию 'mir', т.к. большинство сидированных сервисов — российские.
alter table public.registry_services
  add column if not exists card_type text not null default 'mir'
  check (card_type in ('mir', 'mc'));
