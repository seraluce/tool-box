import type { APIRoute } from 'astro';
import { getPlayerSummaries } from '../../../../lib/steam/api';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const steamKey = import.meta.env.STEAM_API_KEY;
    if (!steamKey) {
      return new Response(JSON.stringify({ error: 'Steam API Key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const steamid = url.pathname.replace('/api/steam/info/', '');
    if (!steamid) {
      return new Response(JSON.stringify({ error: 'SteamID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { players } = await getPlayerSummaries(steamKey, steamid);
    if (!players || players.length === 0) {
      return new Response(JSON.stringify({ error: 'Player not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      avatar: players[0].avatarfull,
      nickName: players[0].personaname,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
