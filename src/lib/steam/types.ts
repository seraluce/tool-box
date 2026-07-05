export type Theme = 'dark' | 'light' | 'radical' | 'tokyonight' | 'solarized-light' | 'ocean-dark' | 'gradient1' | 'gradient2' | 'gradient3';
export type Statistic = 'groups' | 'badges' | 'games' | 'screenshots' | 'guides' | 'artworks' | 'reviews';
export type Locales = 'en' | 'zhCN';

export interface ThemeProp {
  bg_color: string;
  text_color: string;
  online_color: string;
  offline_color: string;
}

export interface ConfigMeta {
  theme: Theme;
  textColor: string;
  bgType: 'color' | 'game-cover';
  bgColor: string;
  bgGameId: string;
  group: boolean;
  badge: boolean;
  statistics: Statistic[];
}

export interface Account {
  steamId: string;
  nickName: string;
  avatarUrl: string;
}

export interface Count {
  name: string;
  count: string;
}

export interface Player {
  steamid: string;
  personastate: number;
  avatarfull: string;
  personaname: string;
}

export interface PlayedGames {
  total_count: number;
  games: { appid: number; name: string; playtime_2weeks: number }[];
}

export interface OwnedGames {
  game_count: number;
  games: { appid: number; playtime_forever: number }[];
}

export interface TemplateMeta {
  name: string;
  avatarUrlBase64: string;
  playerLevel: string;
  isOnline: number;
  gameImgs: string[];
  theme: Theme;
  badge: boolean;
  group: boolean;
  bg: string;
  textColor: string;
  playTime: number;
  groupIconList: string[];
  badgeIcon: string;
  counts: Count[];
  lang: Locales;
}

export interface SteamConfig {
  theme: Theme;
  group: boolean;
  badge: boolean;
  lang: Locales;
  statistics: Statistic[];
  textColor: string;
  bg: string;
}
