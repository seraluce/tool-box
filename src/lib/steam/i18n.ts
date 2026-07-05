import type { Locales } from './types';

const translations: Record<Locales, Record<string, string>> = {
  en: {
    online: 'ONLINE',
    offline: 'OFFLINE',
    games: 'Games',
    badges: 'Badges',
    groups: 'Groups',
    hours: 'hours',
    past_2_weeks: 'Past 2 Weeks',
    screenshots: 'Screenshots',
    artworks: 'Artworks',
    reviews: 'Reviews',
    guides: 'Guides',
  },
  zhCN: {
    online: '在线',
    offline: '离线',
    games: '游戏',
    badges: '徽章',
    groups: '群组',
    hours: '小时',
    past_2_weeks: '过去2周',
    screenshots: '截图',
    artworks: '艺术作品',
    reviews: '评测',
    guides: '指南',
  },
};

export function t(key: string, lang: Locales): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
