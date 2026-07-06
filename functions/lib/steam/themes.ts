import type { Theme, ThemeProp } from './types';

export const themes: Record<Theme, ThemeProp> = {
  dark: {
    bg_color: '#1B2838,#1B2838',
    text_color: '#ffffff',
    online_color: '#10B981',
    offline_color: '#ffffff',
  },
  light: {
    bg_color: '#f7f7f7,#f7f7f7',
    text_color: '#363636',
    online_color: '#10B981',
    offline_color: '#363636',
  },
  radical: {
    bg_color: '#141321,#141321',
    text_color: '#a9fef7',
    online_color: '#10B981',
    offline_color: '#a9fef7',
  },
  tokyonight: {
    bg_color: '#1a1b27,#1a1b27',
    text_color: '#38bdae',
    online_color: '#10B981',
    offline_color: '#38bdae',
  },
  'solarized-light': {
    bg_color: '#fdf6e3,#fdf6e3',
    text_color: '#859900',
    online_color: '#10B981',
    offline_color: '#859900',
  },
  'ocean-dark': {
    bg_color: '#151A28,#151A28',
    text_color: '#92D534',
    online_color: '#10B981',
    offline_color: '#92D534',
  },
  gradient1: {
    bg_color: '#06B7DB,#FF4ECD',
    text_color: '#ffffff',
    online_color: '#10B981',
    offline_color: '#ffffff',
  },
  gradient2: {
    bg_color: '#42d392,#647eff',
    text_color: '#ffffff',
    online_color: '#10B981',
    offline_color: '#ffffff',
  },
  gradient3: {
    bg_color: '#a6c0fe,#f68084',
    text_color: '#ffffff',
    online_color: '#10B981',
    offline_color: '#ffffff',
  },
};

export const themeList: { id: Theme; label: string }[] = [
  { id: 'dark', label: '暗色' },
  { id: 'light', label: '亮色' },
  { id: 'radical', label: '暗夜亮' },
  { id: 'tokyonight', label: '霓虹黑' },
  { id: 'solarized-light', label: '日光亮' },
  { id: 'ocean-dark', label: '海洋黑' },
  { id: 'gradient1', label: '渐变色 1' },
  { id: 'gradient2', label: '渐变色 2' },
  { id: 'gradient3', label: '渐变色 3' },
];

export const statisticsList: { value: string; label: string }[] = [
  { value: 'groups', label: '群组' },
  { value: 'badges', label: '徽章' },
  { value: 'games', label: '游戏' },
  { value: 'screenshots', label: '截图' },
  { value: 'guides', label: '指南' },
  { value: 'artworks', label: '艺术作品' },
  { value: 'reviews', label: '评测' },
];
