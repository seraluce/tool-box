import type { TemplateMeta, Count } from './types';
import { themes } from './themes';
import { t } from './i18n';

function generateStyle(meta: TemplateMeta): string {
  const { bg_color, text_color, online_color, offline_color } = themes[meta.theme];
  let backgroundStyle = '';

  if (meta.bg.includes('game')) {
    const arrs = meta.bg?.split('-');
    backgroundStyle = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${arrs[1]}) no-repeat center`;
  } else {
    backgroundStyle = `linear-gradient(90deg, ${meta.bg || bg_color})`;
  }

  return `<style>
    .card {
      color: ${meta.textColor || text_color};
      background: ${backgroundStyle};
      font-size: 14px;
      height: 130px;
      width: 380px;
      padding: 10px;
      gap: 10px;
      display: flex;
      flex-direction: column;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      border-radius: 5px;
    }
    .online { color: ${online_color}; }
    .offline { color: ${offline_color}; }
    .top { display: flex; justify-content: space-between; }
    .avatar { border-radius: 5px; }
    .user-info { display: flex; gap: 10px; }
    .status { display: flex; flex-direction: column; justify-content: space-between; font-size: 12px; font-weight: bold; }
    .counts { font-size: 12px; display: flex; gap: 20px; }
    .count-item { display: flex; flex-direction: column; align-items: center; }
    .game-list { display: flex; gap: 8px; }
    .icon-list { position: absolute; right: 7px; top: 50px; display: flex; gap: 10px; }
  </style>`;
}

function generateOnlineSvg(meta: TemplateMeta): string {
  if (meta.isOnline > 0) {
    return `<div class="online">${t('online', meta.lang)}</div>`;
  }
  return `<div class="offline">${t('offline', meta.lang)}</div>`;
}

function generateCounts(counts: Count[]): string {
  return counts.map((item) => `
    <div class="count-item">
      <div class="count">${item.count || 0}</div>
      <div class="name">${item.name}</div>
    </div>
  `).join('');
}

function generateGames(gameImgs: string[]): string {
  return gameImgs.map((game) => `<img width="70" height="33" src="${game}" />`).join('');
}

function generateGroups(meta: TemplateMeta): string {
  if (!meta.group) return '';
  return meta.groupIconList.map((icon) => `<img width="35" height="35" src="${icon}" />`).join('');
}

export function generateSvg(meta: TemplateMeta): string {
  return `<svg width="400" height="150" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
    ${generateStyle(meta)}
    <foreignObject width="400" height="150">
      <div class="card" xmlns="http://www.w3.org/1999/xhtml">
        <div class="top">
          <div class="user-info">
            <img class="avatar" src="${meta.avatarUrlBase64}" width="60" height="60" />
            <div class="status">
              <div>${meta.name}</div>
              <div>LV. ${meta.playerLevel}</div>
              ${generateOnlineSvg(meta)}
            </div>
          </div>
          <div class="counts">
            ${generateCounts(meta.counts)}
          </div>
        </div>
        <div class="bottom">
          <div style="font-size:12px;margin-bottom:12px">
            ${meta.playTime} ${t('hours', meta.lang)} (${t('past_2_weeks', meta.lang)})
          </div>
          <div class="game-list">
            ${generateGames(meta.gameImgs)}
          </div>
        </div>
        <div class="icon-list">
          ${generateGroups(meta)}
          ${meta.badge ? `<img height="35" width="35" src="${meta.badgeIcon}" />` : ''}
        </div>
      </div>
    </foreignObject>
  </svg>`;
}

export function generateError(errMsg: string): string {
  return `<svg width="400" height="140" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#F3F4F6" rx="4.5" stroke="#e4e2e2" stroke-opacity="1" width="100%" height="100%"></rect>
    <text x="10" y="50" text-anchor="start" fill="red">Error</text>
    <text x="10" y="80" fill="red" font-size="10">${errMsg}</text>
  </svg>`;
}
