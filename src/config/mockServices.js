// Mock subscription data for different banks
export const generateMockSubscriptions = (bankId, language = 'ru') => {
  const mockData = {
    sberbank: [
      {
        id: 'bitrix24_' + Date.now(),
        name: 'Bitrix24',
        price: 2490,
        plan: 'Тариф "Стандарт"',
        logoId: 'bitrix24',
        active: true
      },
      {
        id: 'amocrm_' + Date.now(),
        name: 'amoCRM',
        price: 2499,
        plan: 'Тариф "Базовый"',
        logoId: 'amocrm',
        active: true
      },
      {
        id: '1c_fresh_' + Date.now(),
        name: '1С:Фреш',
        price: 1336,
        plan: 'Тариф "Базовый"',
        logoId: 'fresh1c',
        active: true
      },
      {
        id: 'yandex360_' + Date.now(),
        name: 'Яндекс 360',
        price: 249,
        plan: 'Бизнес Стандарт',
        logoId: 'yandex360',
        active: true
      },
      {
        id: 'telegram_premium_' + Date.now(),
        name: 'Telegram Premium',
        price: 329,
        plan: 'Бизнес-аккаунт',
        logoId: 'telegram',
        active: true
      },
      {
        id: 'tilda_' + Date.now(),
        name: 'Tilda',
        price: 750,
        plan: 'Тариф "Personal"',
        logoId: 'tilda',
        active: true
      },
      {
        id: 'figma_' + Date.now(),
        name: 'Figma',
        price: 1350,
        plan: 'Тариф "Professional"',
        logoId: 'figma',
        active: true
      }
    ],
    tinkoff: [
      {
        id: 'spotify_' + Date.now(),
        name: 'Spotify Premium',
        price: 699,
        logoId: 'spotify',
        active: true
      },
      {
        id: 'notion_' + Date.now(),
        name: 'Notion Pro',
        price: 950,
        logoId: 'notion',
        active: true
      },
      {
        id: 'figma_' + Date.now(),
        name: 'Figma Professional',
        price: 1200,
        logoId: 'figma',
        active: true
      }
    ],
    kaspi: [
      {
        id: 'netflix_kz_' + Date.now(),
        name: 'Netflix',
        price: 3500,
        logoId: 'netflix',
        active: true
      },
      {
        id: 'youtube_' + Date.now(),
        name: 'YouTube Premium',
        price: 2500,
        logoId: 'youtube',
        active: true
      }
    ],
    revolut: [
      {
        id: 'netflix_' + Date.now(),
        name: 'Netflix Premium',
        price: 1425, // $15 * 95
        logoId: 'netflix',
        active: true
      },
      {
        id: 'spotify_global_' + Date.now(),
        name: 'Spotify',
        price: 950, // $10 * 95
        logoId: 'spotify',
        active: true
      },
      {
        id: 'chatgpt_' + Date.now(),
        name: 'ChatGPT Plus',
        price: 1900, // $20 * 95
        logoId: 'chatgpt',
        active: true
      }
    ],
    mercury: [
      {
        id: 'github_' + Date.now(),
        name: 'GitHub Pro',
        price: 380, // $4 * 95
        logoId: 'github',
        active: true
      },
      {
        id: 'aws_' + Date.now(),
        name: 'AWS Services',
        price: 4750, // $50 * 95
        logoId: 'aws',
        active: true
      },
      {
        id: 'vercel_' + Date.now(),
        name: 'Vercel Pro',
        price: 1900, // $20 * 95
        logoId: 'vercel',
        active: true
      }
    ]
  };
  
  return mockData[bankId] || [];
};

// Popular services for manual card issuance
export const POPULAR_SERVICES = {
  ru: [
    { id: 'netflix', name: 'Netflix', logoId: 'netflix', suggestedLimit: 1500 },
    { id: 'spotify', name: 'Spotify', logoId: 'spotify', suggestedLimit: 700 },
    { id: 'chatgpt', name: 'ChatGPT Plus', logoId: 'chatgpt', suggestedLimit: 2000 },
    { id: 'notion', name: 'Notion', logoId: 'notion', suggestedLimit: 1000 },
    { id: 'figma', name: 'Figma', logoId: 'figma', suggestedLimit: 1200 },
    { id: 'github', name: 'GitHub', logoId: 'github', suggestedLimit: 400 },
    { id: 'adobe', name: 'Adobe CC', logoId: 'adobe', suggestedLimit: 6500 },
    { id: 'dropbox', name: 'Dropbox', logoId: 'dropbox', suggestedLimit: 1000 }
  ],
  en: [
    { id: 'netflix', name: 'Netflix', logoId: 'netflix', suggestedLimit: 1500 },
    { id: 'spotify', name: 'Spotify', logoId: 'spotify', suggestedLimit: 700 },
    { id: 'chatgpt', name: 'ChatGPT Plus', logoId: 'chatgpt', suggestedLimit: 2000 },
    { id: 'notion', name: 'Notion', logoId: 'notion', suggestedLimit: 1000 },
    { id: 'figma', name: 'Figma', logoId: 'figma', suggestedLimit: 1200 },
    { id: 'github', name: 'GitHub', logoId: 'github', suggestedLimit: 400 },
    { id: 'adobe', name: 'Adobe CC', logoId: 'adobe', suggestedLimit: 6500 },
    { id: 'dropbox', name: 'Dropbox', logoId: 'dropbox', suggestedLimit: 1000 }
  ]
};

export const getPopularServices = (language) => {
  return POPULAR_SERVICES[language] || POPULAR_SERVICES.en;
};
