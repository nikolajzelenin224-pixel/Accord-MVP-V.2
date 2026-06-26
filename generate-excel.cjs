const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

function sheet(name, columns, rows = []) {
  const headers = columns.map(c => c.header);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows.map(r => columns.map(c => r[c.key] ?? ''))]);

  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));

  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[addr]) ws[addr].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F2937" } }, alignment: { wrapText: true } };
  }
  for (let R = 1; R <= range.e.r; R++) {
    for (let C = 0; C < columns.length; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      if (C === 0) ws[addr].s = { font: { bold: true } };
      else if (C === 1) ws[addr].s = { font: { color: { rgb: "6366F1" }, italic: true } };
      else ws[addr].s = { alignment: { wrapText: true } };
    }
  }
  XLSX.utils.book_append_sheet(wb, ws, name);
}

sheet('users', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 26 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 50 },
], [
  { field: 'id', type: 'UUID (PK)', desc: 'Первичный ключ', purpose: 'Уникальный номер пользователя в системе. Нужен, чтобы связывать все остальные данные (подписки, счёт, транзакции) с конкретным человеком.' },
  { field: 'email', type: 'VARCHAR(255) UNIQUE', desc: 'Email пользователя', purpose: 'Логин для входа в приложение. На него будут приходить уведомления о списаниях, просрочках и пополнениях.' },
  { field: 'password_hash', type: 'VARCHAR(255)', desc: 'bcrypt hash пароля', purpose: 'Зашифрованный пароль для защиты аккаунта. Хранится в обезличенном виде — даже администратор не узнает ваш пароль.' },
  { field: 'language', type: "VARCHAR(2) DEFAULT 'ru'", desc: "'en' или 'ru'", purpose: 'Язык интерфейса. При входе приложение сразу покажется на русском или английском — как вы выбрали.' },
  { field: 'auto_payment', type: 'BOOLEAN DEFAULT false', desc: 'Автопополнение', purpose: 'Флаг: включено ли автопополнение баланса. Если да — система сама будет докидывать деньги, когда баланс на нуле.' },
  { field: 'payment_date', type: 'SMALLINT nullable', desc: 'День списания (1-31)', purpose: 'Число месяца, когда происходят списания по подпискам. Например, 15-го числа каждого месяца.' },
  { field: 'created_at', type: 'TIMESTAMP', desc: 'Дата создания', purpose: 'Когда пользователь зарегистрировался. Нужно для аналитики и статистики.' },
  { field: 'updated_at', type: 'TIMESTAMP', desc: 'Дата обновления', purpose: 'Когда в последний раз менялись настройки пользователя. Помогает отслеживать активность.' },
]);

sheet('accounts', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 26 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 50 },
], [
  { field: 'id', type: 'UUID (PK)', desc: 'Первичный ключ', purpose: 'Уникальный номер счёта. У каждого пользователя — один счёт, как банковский.' },
  { field: 'user_id', type: 'UUID (FK → users.id)', desc: 'Владелец счёта', purpose: 'Привязка счёта к конкретному пользователю. Один пользователь = один счёт.' },
  { field: 'balance', type: 'INTEGER DEFAULT 0', desc: 'Текущий баланс в RUB', purpose: 'Сколько денег сейчас на счету. Это то, что вы видите на виртуальной карте Accord — ваш доступный остаток.' },
  { field: 'currency', type: "VARCHAR(3) DEFAULT 'RUB'", desc: 'Валюта счёта', purpose: 'Валюта, в которой хранятся деньги. Пока только рубли, но в будущем можно добавить доллары/евро.' },
  { field: 'created_at', type: 'TIMESTAMP', desc: 'Дата создания', purpose: 'Когда открыт счёт. Обычно совпадает с датой регистрации.' },
]);

sheet('subscriptions', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 28 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 55 },
], [
  { field: 'id', type: 'UUID (PK)', desc: 'Первичный ключ', purpose: 'Уникальный номер подписки. Нужен, чтобы можно было найти, отредактировать или удалить конкретную подписку.' },
  { field: 'user_id', type: 'UUID (FK → users.id)', desc: 'Владелец подписки', purpose: 'Привязка подписки к пользователю. Каждый видит только свои подписки.' },
  { field: 'name', type: 'VARCHAR(255)', desc: 'Название сервиса', purpose: 'Как называется сервис: Netflix, Spotify, Яндекс.Плюс — то, что отображается в списке подписок.' },
  { field: 'price', type: 'INTEGER', desc: 'Цена в RUB в месяц', purpose: 'Сколько стоит подписка в месяц. Из этих сумм складывается общая нагрузка на баланс.' },
  { field: 'active', type: 'BOOLEAN DEFAULT true', desc: 'Статус (активна/отключена)', purpose: 'Включена ли подписка сейчас. Можно отключить (не удалять) — тогда за неё не списываются деньги, но она остаётся в списке.' },
  { field: 'icon_name', type: 'VARCHAR(50) nullable', desc: 'Ключ иконки-заглушки', purpose: 'Если нет логотипа сервиса — показывается иконка по умолчанию (например, "музыка" для Spotify, "кино" для Netflix).' },
  { field: 'logo_id', type: 'VARCHAR(50) nullable', desc: 'ID логотипа', purpose: 'Ссылка на изображение логотипа сервиса (берётся с logo.dev). Нужен для красивого отображения в списке.' },
  { field: 'plan', type: 'VARCHAR(100) nullable', desc: 'Тариф/план подписки', purpose: 'Название тарифа: "Стандарт", "Премиум", "Бизнес". Одна подписка может быть на разных условиях.' },
  { field: 'card_number', type: 'VARCHAR(19) nullable', desc: 'PAN виртуальной карты', purpose: 'Номер виртуальной карты, если подписка добавлена вручную (Path B). Карта привязана только к этому сервису.' },
  { field: 'expiry_date', type: 'VARCHAR(5) nullable', desc: 'Срок действия карты (MM/YY)', purpose: 'Срок действия виртуальной карты. Формат "12/28" — месяц/год.' },
  { field: 'bank_id', type: 'VARCHAR(50) nullable', desc: 'ID банка (если найдена синхронизацией)', purpose: 'Если подписка обнаружена автоматически через банк — тут указано, через какой именно банк.' },
  { field: 'created_at', type: 'TIMESTAMP', desc: 'Дата создания', purpose: 'Когда добавили подписку в аккаунт.' },
  { field: 'updated_at', type: 'TIMESTAMP', desc: 'Дата обновления', purpose: 'Когда в последний раз меняли подписку (цену, название, статус).' },
]);

sheet('transactions', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 26 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 55 },
], [
  { field: 'id', type: 'UUID (PK)', desc: 'Первичный ключ', purpose: 'Уникальный номер операции. Нужен для отслеживания каждого движения денег.' },
  { field: 'user_id', type: 'UUID (FK → users.id)', desc: 'Пользователь', purpose: 'Кто совершил операцию. Каждый видит только свою историю.' },
  { field: 'account_id', type: 'UUID (FK → accounts.id)', desc: 'Счёт', purpose: 'По какому счету прошла операция.' },
  { field: 'amount', type: 'INTEGER', desc: 'Сумма в RUB', purpose: 'Сколько денег. Положительное число — пополнение, отрицательное — списание. Например: +1500 (пополнили), -490 (заплатили за подписку).' },
  { field: 'type', type: "VARCHAR(20)", desc: "Тип транзакции", purpose: 'Зачем операция: top_up (пополнение), charge (списание за подписку), bnpl_credit (взяли в долг), bnpl_repayment (вернули долг).' },
  { field: 'source', type: "VARCHAR(50)", desc: "Источник", purpose: 'Откуда пришли деньги: bank_transfer (из банка), auto (автоматическое пополнение), manual (вручную), bnpl (отсрочка платежа).' },
  { field: 'status', type: "VARCHAR(20)", desc: "Статус", purpose: 'Где операция сейчас: pending (обрабатывается), processing (в процессе), completed (выполнена), failed (ошибка). Как статус заказа в магазине.' },
  { field: 'description', type: 'TEXT nullable', desc: 'Комментарий', purpose: 'Понятное описание: "Пополнение через Сбербанк", "Оплата Netflix", "Комиссия BNPL". Показывается в истории операций.' },
  { field: 'created_at', type: 'TIMESTAMP', desc: 'Дата транзакции', purpose: 'Когда произошла операция. Для истории и отчётов.' },
]);

sheet('bnpl_deferrals', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 26 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 55 },
], [
  { field: 'id', type: 'UUID (PK)', desc: 'Первичный ключ', purpose: 'Уникальный номер отсрочки. Чтобы можно было найти конкретный "долг" и следить за ним.' },
  { field: 'user_id', type: 'UUID (FK → users.id)', desc: 'Пользователь', purpose: 'Кто взял отсрочку. Каждый отвечает за свои долги.' },
  { field: 'amount', type: 'INTEGER', desc: 'Сумма отсрочки (shortfall)', purpose: 'Сколько денег не хватало на балансе. Именно эту сумму мы "одалживаем" пользователю.' },
  { field: 'commission', type: 'INTEGER', desc: 'Комиссия 4% prorated', purpose: 'Сколько сверху начислено за услугу. Рассчитывается как 4% за 30 дней пропорционально сроку. Например: должны 1000₽ на 15 дней → комиссия 20₽.' },
  { field: 'total', type: 'INTEGER', desc: 'amount + commission', purpose: 'Итого к возврату: сколько взяли + комиссия. Пользователь видит эту сумму при оформлении BNPL.' },
  { field: 'scheduled_date', type: 'DATE', desc: 'Дата планового списания', purpose: 'Когда нужно вернуть деньги. Обычно — следующий платёжный день (например, 15-е число следующего месяца).' },
  { field: 'status', type: "VARCHAR(20) DEFAULT 'active'", desc: "Статус", purpose: 'Долг активен (active), уже погашен (paid) или просрочен (overdue). Для контроля и напоминаний.' },
  { field: 'created_at', type: 'TIMESTAMP', desc: 'Дата создания', purpose: 'Когда оформили отсрочку.' },
]);

sheet('banks_ref', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 26 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 50 },
], [
  { field: 'id', type: 'VARCHAR(50) (PK)', desc: 'Уникальный ID банка', purpose: 'Кодовое название банка (sberbank, revolut...). Используется внутри системы для связи с другими таблицами.' },
  { field: 'name_ru', type: 'VARCHAR(100)', desc: 'Название на русском', purpose: 'Как банк называется для русскоязычных пользователей: "Сбербанк", "Т-Банк".' },
  { field: 'name_en', type: 'VARCHAR(100)', desc: 'Название на английском', purpose: 'Как банк называется для англоязычных пользователей: "Sberbank", "T-Bank".' },
  { field: 'region', type: "VARCHAR(10)", desc: "'cis' или 'global'", purpose: 'Регион банка. Если язык русский — показываем банки СНГ, если английский — глобальные.' },
  { field: 'gradient', type: 'VARCHAR(200) nullable', desc: 'CSS gradient для UI', purpose: 'Цвета банка для красивого отображения в интерфейсе (фон кнопки, прогресс-бар при синхронизации).' },
  { field: 'logo', type: 'VARCHAR(10)', desc: 'Emoji-заглушка', purpose: 'Простая иконка банка (🏦 ⚡ 🌐), если логотип ещё не загрузился.' },
  { field: 'logo_url', type: 'VARCHAR(500) nullable', desc: 'URL логотипа', purpose: 'Ссылка на изображение логотипа банка с logo.dev.' },
]);

sheet('banks_data', [
  { header: 'id', key: 'id', width: 14 },
  { header: 'name_ru', key: 'name_ru', width: 18 },
  { header: 'name_en', key: 'name_en', width: 18 },
  { header: 'region', key: 'region', width: 10 },
  { header: 'gradient', key: 'gradient', width: 50 },
  { header: 'logo', key: 'logo', width: 8 },
  { header: 'logo_url', key: 'logo_url', width: 10 },
], [
  { id: 'sberbank', name_ru: 'Сбербанк', name_en: 'Sberbank', region: 'cis', gradient: 'linear-gradient(135deg, #21a038 0%, #1a7d2e 100%)', logo: '🏦', logo_url: '' },
  { id: 'tinkoff', name_ru: 'Т-Банк', name_en: 'T-Bank', region: 'cis', gradient: '', logo: '⚡', logo_url: '' },
  { id: 'alfa', name_ru: 'Альфа-Банк', name_en: 'Alfa-Bank', region: 'cis', gradient: '', logo: '🏛', logo_url: '' },
  { id: 'kaspi', name_ru: 'Kaspi.kz', name_en: 'Kaspi.kz', region: 'cis', gradient: '', logo: '💳', logo_url: '' },
  { id: 'revolut', name_ru: 'Revolut', name_en: 'Revolut', region: 'global', gradient: '', logo: '🌐', logo_url: '' },
  { id: 'mercury', name_ru: 'Mercury', name_en: 'Mercury', region: 'global', gradient: '', logo: '💎', logo_url: '' },
]);

sheet('bank_subscriptions_ref', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 28 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 55 },
], [
  { field: 'id', type: 'UUID (PK)', desc: 'Первичный ключ', purpose: 'Уникальный номер записи о том, что банк может обнаружить этот сервис.' },
  { field: 'bank_id', type: 'VARCHAR(50) (FK → banks.id)', desc: 'ID банка', purpose: 'Какой банк может найти эту подписку. Сбербанк видит одни сервисы, Revolut — другие.' },
  { field: 'name', type: 'VARCHAR(255)', desc: 'Название сервиса', purpose: 'Название подписки, которую банк обнаружит при синхронизации.' },
  { field: 'price', type: 'INTEGER', desc: 'Цена в RUB', purpose: 'Стоимость подписки, которую сообщит банк. Может отличаться от той, что ввёл пользователь вручную.' },
  { field: 'plan', type: 'VARCHAR(100) nullable', desc: 'Название тарифа', purpose: 'Тариф, который определил банк (например, "Бизнес" для Bitrix24).' },
  { field: 'logo_id', type: 'VARCHAR(50)', desc: 'ID для логотипа', purpose: 'Ссылка на логотип сервиса, чтобы красиво отобразить его в результатах синхронизации.' },
  { field: 'is_popular', type: 'BOOLEAN', desc: 'Показывать в популярных?', purpose: 'Отмечать ли сервис как "популярный" при ручном поиске (Path B).' },
]);

sheet('subs_sberbank', [
  { header: 'bank_id', key: 'bank_id', width: 14 },
  { header: 'name', key: 'name', width: 22 },
  { header: 'price', key: 'price', width: 10 },
  { header: 'plan', key: 'plan', width: 14 },
  { header: 'logo_id', key: 'logo_id', width: 14 },
  { header: 'is_popular', key: 'is_popular', width: 12 },
], [
  { bank_id: 'sberbank', name: 'Bitrix24', price: 2490, plan: 'Бизнес', logo_id: 'bitrix24', is_popular: false },
  { bank_id: 'sberbank', name: 'amoCRM', price: 2499, plan: 'Бизнес', logo_id: 'amocrm', is_popular: false },
  { bank_id: 'sberbank', name: '1С:Фреш', price: 1336, plan: 'Старт', logo_id: 'fresh1c', is_popular: false },
  { bank_id: 'sberbank', name: 'Яндекс 360', price: 249, plan: '', logo_id: 'yandex360', is_popular: false },
  { bank_id: 'sberbank', name: 'Telegram Premium', price: 329, plan: '', logo_id: 'telegram', is_popular: false },
  { bank_id: 'sberbank', name: 'Tilda', price: 750, plan: '', logo_id: 'tilda', is_popular: false },
  { bank_id: 'sberbank', name: 'Figma', price: 1350, plan: '', logo_id: 'figma', is_popular: false },
]);

sheet('subs_tinkoff', [
  { header: 'bank_id', key: 'bank_id', width: 14 },
  { header: 'name', key: 'name', width: 22 },
  { header: 'price', key: 'price', width: 10 },
  { header: 'plan', key: 'plan', width: 10 },
  { header: 'logo_id', key: 'logo_id', width: 14 },
  { header: 'is_popular', key: 'is_popular', width: 12 },
], [
  { bank_id: 'tinkoff', name: 'Spotify Premium', price: 699, plan: '', logo_id: 'spotify', is_popular: false },
  { bank_id: 'tinkoff', name: 'Notion Pro', price: 950, plan: '', logo_id: 'notion', is_popular: false },
  { bank_id: 'tinkoff', name: 'Figma Professional', price: 1200, plan: '', logo_id: 'figma', is_popular: false },
]);

sheet('subs_kaspi', [
  { header: 'bank_id', key: 'bank_id', width: 14 },
  { header: 'name', key: 'name', width: 22 },
  { header: 'price', key: 'price', width: 10 },
  { header: 'plan', key: 'plan', width: 10 },
  { header: 'logo_id', key: 'logo_id', width: 14 },
  { header: 'is_popular', key: 'is_popular', width: 12 },
], [
  { bank_id: 'kaspi', name: 'Netflix', price: 3500, plan: '', logo_id: 'netflix', is_popular: false },
  { bank_id: 'kaspi', name: 'YouTube Premium', price: 2500, plan: '', logo_id: 'youtube', is_popular: false },
]);

sheet('subs_revolut', [
  { header: 'bank_id', key: 'bank_id', width: 14 },
  { header: 'name', key: 'name', width: 22 },
  { header: 'price', key: 'price', width: 10 },
  { header: 'plan', key: 'plan', width: 10 },
  { header: 'logo_id', key: 'logo_id', width: 14 },
  { header: 'is_popular', key: 'is_popular', width: 12 },
], [
  { bank_id: 'revolut', name: 'Netflix Premium', price: 1425, plan: '', logo_id: 'netflix', is_popular: false },
  { bank_id: 'revolut', name: 'Spotify', price: 950, plan: '', logo_id: 'spotify', is_popular: false },
  { bank_id: 'revolut', name: 'ChatGPT Plus', price: 1900, plan: '', logo_id: 'chatgpt', is_popular: false },
]);

sheet('subs_mercury', [
  { header: 'bank_id', key: 'bank_id', width: 14 },
  { header: 'name', key: 'name', width: 22 },
  { header: 'price', key: 'price', width: 10 },
  { header: 'plan', key: 'plan', width: 10 },
  { header: 'logo_id', key: 'logo_id', width: 14 },
  { header: 'is_popular', key: 'is_popular', width: 12 },
], [
  { bank_id: 'mercury', name: 'GitHub Pro', price: 380, plan: '', logo_id: 'github', is_popular: false },
  { bank_id: 'mercury', name: 'AWS Services', price: 4750, plan: '', logo_id: 'aws', is_popular: false },
  { bank_id: 'mercury', name: 'Vercel Pro', price: 1900, plan: '', logo_id: 'vercel', is_popular: false },
]);

sheet('popular_services_ref', [
  { header: 'Поле', key: 'field', width: 18 },
  { header: 'Тип', key: 'type', width: 28 },
  { header: 'Описание', key: 'desc', width: 50 },
  { header: 'Функциональное назначение (для чего нужно)', key: 'purpose', width: 55 },
], [
  { field: 'id', type: 'VARCHAR(50) (PK)', desc: 'Уникальный ID сервиса', purpose: 'Кодовое имя сервиса (netflix, spotify...). Используется внутри системы для связи.' },
  { field: 'name', type: 'VARCHAR(255)', desc: 'Название сервиса', purpose: 'Название, которые видит пользователь при ручном выборе: "Netflix", "Spotify", "ChatGPT Plus".' },
  { field: 'logo_id', type: 'VARCHAR(50)', desc: 'ID для логотипа', purpose: 'Ссылка на логотип для отображения в списке сервисов.' },
  { field: 'suggested_limit', type: 'INTEGER', desc: 'Рекомендуемый лимит в RUB', purpose: 'Сколько денег рекомендуется выделить на виртуальную карту для этого сервиса. Например, для Netflix — 1500₽.' },
]);

sheet('popular_data', [
  { header: 'id', key: 'id', width: 14 },
  { header: 'name', key: 'name', width: 22 },
  { header: 'logo_id', key: 'logo_id', width: 14 },
  { header: 'suggested_limit', key: 'suggested_limit', width: 20 },
], [
  { id: 'netflix', name: 'Netflix', logo_id: 'netflix', suggested_limit: 1500 },
  { id: 'spotify', name: 'Spotify', logo_id: 'spotify', suggested_limit: 700 },
  { id: 'chatgpt', name: 'ChatGPT Plus', logo_id: 'chatgpt', suggested_limit: 2000 },
  { id: 'notion', name: 'Notion', logo_id: 'notion', suggested_limit: 1000 },
  { id: 'figma', name: 'Figma', logo_id: 'figma', suggested_limit: 1200 },
  { id: 'github', name: 'GitHub', logo_id: 'github', suggested_limit: 400 },
  { id: 'adobe', name: 'Adobe CC', logo_id: 'adobe', suggested_limit: 6500 },
  { id: 'dropbox', name: 'Dropbox', logo_id: 'dropbox', suggested_limit: 1000 },
]);

const filePath = path.join(__dirname, 'accord-backend-schema-v2.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Excel file created:', filePath);
