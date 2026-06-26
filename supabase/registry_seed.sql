-- Сид реестра популярных RU-подписок. Выполнить в Supabase Dashboard -> SQL Editor.
-- logo_url использует logo.dev по домену сервиса (как и в LOGO_LIBRARY на фронте).

insert into public.registry_services (name, logo_url, default_price, category) values
  ('Яндекс Плюс', 'https://img.logo.dev/yandex.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 399, 'streaming'),
  ('Кинопоиск', 'https://img.logo.dev/kinopoisk.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 299, 'streaming'),
  ('Иви (ivi)', 'https://img.logo.dev/ivi.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 399, 'streaming'),
  ('Okko', 'https://img.logo.dev/okko.tv?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 399, 'streaming'),
  ('VK Музыка', 'https://img.logo.dev/vk.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 199, 'music'),
  ('Звук', 'https://img.logo.dev/zvuk.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 299, 'music'),
  ('МТС Premium', 'https://img.logo.dev/mts.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 399, 'mobile'),
  ('Литрес', 'https://img.logo.dev/litres.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 299, 'books'),
  ('MyBook', 'https://img.logo.dev/mybook.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 299, 'books'),
  ('Telegram Premium', 'https://img.logo.dev/telegram.org?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 399, 'social'),
  ('Spotify', 'https://img.logo.dev/spotify.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 299, 'music'),
  ('Netflix', 'https://img.logo.dev/netflix.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 999, 'streaming'),
  ('YouTube Premium', 'https://img.logo.dev/youtube.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 399, 'streaming'),
  ('ChatGPT Plus', 'https://img.logo.dev/openai.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 1900, 'software'),
  ('Notion', 'https://img.logo.dev/notion.so?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 1000, 'software'),
  ('Figma', 'https://img.logo.dev/figma.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 1200, 'software'),
  ('Adobe Creative Cloud', 'https://img.logo.dev/adobe.com?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 6500, 'software'),
  ('Bitrix24', 'https://img.logo.dev/bitrix24.ru?token=pk_UjleSCvmTMOONUsbHVGhLg&retina=true', 2490, 'software')
on conflict do nothing;
