import type { Player, PlayedGames, OwnedGames } from './types';

const STEAM_API_BASE = 'https://api.steampowered.com';

export async function getPlayerSummaries(key: string, steamids: string): Promise<{ players: Player[] }> {
  const res = await fetch(`${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamids}`);
  const data = await res.json();
  return data.response;
}

export async function getRecentlyPlayedGames(key: string, steamid: string, count = 5): Promise<PlayedGames> {
  const res = await fetch(`${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${key}&steamid=${steamid}&format=json&count=${count}`);
  const data = await res.json();
  return data.response;
}

export async function getOwnedGames(key: string, steamid: string): Promise<OwnedGames> {
  const res = await fetch(`${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamid}&format=json`);
  const data = await res.json();
  return data.response;
}

export async function getSteamProfile(steamid: string): Promise<string> {
  const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  return res.text();
}

export async function getGameDetails(appid: string | number): Promise<{ header_image: string } | null> {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
    const data = await res.json();
    const detail = data[appid.toString()];
    if (!detail?.success || !detail.data?.header_image) return null;
    return { header_image: detail.data.header_image };
  } catch {
    return null;
  }
}

export async function imageUrl2Base64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
  } catch {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
}
