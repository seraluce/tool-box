import {
  getPlayerSummaries,
  getRecentlyPlayedGames,
  getSteamProfile,
  getGameDetails,
  getOwnedGames,
  imageUrl2Base64,
} from '../../../lib/steam/api';
import { crawler } from '../../../lib/steam/crawler';
import { parseUrlConfig } from '../../../lib/steam/config';
import { generateSvg, generateError } from '../../../lib/steam/render';
import { t } from '../../../lib/steam/i18n';
import type { Count, Statistic } from '../../../lib/steam/types';

const TRANSPARENT = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const steamKey = context.env.STEAM_API_KEY;
    if (!steamKey) {
      return new Response(generateError('Steam API Key not configured'), {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    const url = new URL(context.request.url);
    const pathParts = url.pathname.replace('/api/steam/card/', '').split('/');
    const steamid = pathParts[0];
    const settings = pathParts[1] || '';

    if (!steamid || /[A-Z]/i.test(steamid)) {
      return new Response(generateError('Invalid SteamID'), {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    const config = parseUrlConfig(settings);

    const [playerRes, playedGamesRes, profileHtml] = await Promise.all([
      getPlayerSummaries(steamKey, steamid),
      getRecentlyPlayedGames(steamKey, steamid, 5),
      getSteamProfile(steamid),
    ]);

    const player = playerRes.players[0];
    if (!player) {
      return new Response(generateError('Player not found'), {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    const profile = crawler(profileHtml);
    const playedGames = playedGamesRes;

    let playTime = 0;
    const games = playedGames.games || [];
    games.forEach((game) => { playTime += game.playtime_2weeks; });
    playTime = Math.floor(playTime / 60);

    const name = player.personaname.replaceAll('<', '&lt;');
    const isOnline = player.personastate;

    const avatarUrlBase64 = profile.avatarUrl
      ? await imageUrl2Base64(profile.avatarUrl)
      : TRANSPARENT;

    let badgeIcon = '';
    if (profile.badgeIconUrl) {
      badgeIcon = await imageUrl2Base64(profile.badgeIconUrl);
    }

    const groupIconList: string[] = [];
    for (const iconUrl of profile.groupIconList) {
      groupIconList.push(await imageUrl2Base64(iconUrl));
    }

    const gameImgs: string[] = [];
    for (const game of games) {
      const detail = await getGameDetails(game.appid);
      if (detail?.header_image) {
        gameImgs.push(await imageUrl2Base64(detail.header_image));
      } else {
        gameImgs.push(TRANSPARENT);
      }
    }

    const counts: Count[] = [];
    const statMap: Record<Statistic, { name: string; count: string }> = {
      games: { name: t('games', config.lang), count: profile.gameCount },
      screenshots: { name: t('screenshots', config.lang), count: profile.screenshotCount },
      artworks: { name: t('artworks', config.lang), count: profile.artWorkCount },
      reviews: { name: t('reviews', config.lang), count: profile.reviewCount },
      guides: { name: t('guides', config.lang), count: profile.guideCount },
      groups: { name: t('groups', config.lang), count: profile.groupCount },
      badges: { name: t('badges', config.lang), count: profile.badgeCount },
    };

    for (const item of config.statistics) {
      const stat = statMap[item];
      if (stat) counts.push(stat);
    }

    let bg = config.bg;
    if (bg.includes('bg-game')) {
      const arrs = bg.split('-');
      let coverUrl: string | null = null;
      if (arrs.length < 3) {
        const owned = await getOwnedGames(steamKey, steamid);
        const topGame = owned.games?.sort((a, b) => b.playtime_forever - a.playtime_forever)[0];
        if (topGame) {
          const detail = await getGameDetails(topGame.appid);
          coverUrl = detail?.header_image || null;
        }
      } else {
        const detail = await getGameDetails(arrs[2]);
        coverUrl = detail?.header_image || null;
      }
      if (coverUrl) {
        const gameBase64 = await imageUrl2Base64(coverUrl);
        bg = `game-${gameBase64}`;
      }
    }

    const svg = generateSvg({
      name,
      avatarUrlBase64,
      playerLevel: profile.playerLevel,
      isOnline,
      gameImgs,
      theme: config.theme,
      badge: config.badge,
      group: config.group,
      bg,
      textColor: config.textColor,
      playTime,
      groupIconList,
      badgeIcon,
      counts,
      lang: config.lang,
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Steam Card] Error:', error);
    return new Response(generateError(String(error)), {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }
};
