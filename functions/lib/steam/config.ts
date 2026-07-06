import type { Statistic, SteamConfig, Theme } from './types';

const allThemes: Theme[] = ['dark', 'light', 'radical', 'tokyonight', 'solarized-light', 'ocean-dark', 'gradient1', 'gradient2', 'gradient3'];
const allStatistics: Statistic[] = ['groups', 'badges', 'games', 'screenshots', 'guides', 'artworks', 'reviews'];
const defaultStatistics: Statistic[] = ['groups', 'badges', 'games'];

export function parseUrlConfig(setting: string): SteamConfig {
  const config: SteamConfig = {
    theme: 'dark',
    group: false,
    badge: false,
    lang: 'zhCN',
    statistics: [],
    textColor: '',
    bg: '',
  };

  const statisticSet = new Set<Statistic>();

  if (setting) {
    const settings = setting.split(',');
    for (const item of settings) {
      if (allThemes.includes(item as Theme)) {
        config.theme = item as Theme;
      } else if (item.includes('text-')) {
        config.textColor = `#${item.split('-')[1]}`;
      } else if (item.includes('bg-')) {
        let bg = '';
        if (item.includes('game')) {
          bg = item;
        } else {
          const colors = item.split('-');
          colors.shift();
          if (colors.length === 1) colors.push(colors[0]);
          for (let i = 0; i < colors.length; i++) {
            bg += `#${colors[i]}`;
            if (i < colors.length - 1) bg += ',';
          }
        }
        config.bg = bg;
      } else if (item === 'group') {
        config.group = true;
      } else if (item === 'badge') {
        config.badge = true;
      } else if (item === 'zhCN') {
        config.lang = 'zhCN';
      } else if (item === 'en') {
        config.lang = 'en';
      } else if (allStatistics.includes(item as Statistic)) {
        statisticSet.add(item as Statistic);
      }
    }
  }

  for (const item of defaultStatistics) {
    statisticSet.add(item);
  }

  const statistics = Array.from(statisticSet);
  if (statistics.length > 3) statistics.splice(3);

  config.statistics = statistics;
  return config;
}
