-- Добавляет ранжирование популярности для дефолтного экрана поиска подписок.
-- Выполнить в Supabase Dashboard -> SQL Editor.

alter table public.registry_services add column if not exists popularity_rank int;

update public.registry_services set popularity_rank = 1 where name = 'Яндекс Плюс';
update public.registry_services set popularity_rank = 2 where name = 'Кинопоиск';
update public.registry_services set popularity_rank = 3 where name = 'Spotify';
update public.registry_services set popularity_rank = 4 where name = 'VK Музыка';
update public.registry_services set popularity_rank = 5 where name = 'Telegram Premium';
update public.registry_services set popularity_rank = 6 where name = 'Иви (ivi)';
update public.registry_services set popularity_rank = 7 where name = 'Okko';
update public.registry_services set popularity_rank = 8 where name = 'YouTube Premium';
update public.registry_services set popularity_rank = 9 where name = 'Netflix';
update public.registry_services set popularity_rank = 10 where name = 'МТС Premium';
