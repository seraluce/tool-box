export const onRequestGet: PagesFunction = async (context) => {
  try {
    const steamKey = context.env.STEAM_API_KEY;
    if (!steamKey) {
      return new Response(JSON.stringify({ error: 'Steam API Key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(context.request.url);
    const steamid = url.pathname.replace('/api/steam/info/', '');
    
    if (!steamid || steamid.length !== 17) {
      return new Response(JSON.stringify({ error: 'SteamID 格式错误' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamid}`);
    const data = await res.json();
    
    if (!data.response?.players || data.response.players.length === 0) {
      return new Response(JSON.stringify({ error: '玩家未找到' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      avatar: data.response.players[0].avatarfull,
      nickName: data.response.players[0].personaname,
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
