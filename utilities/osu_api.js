require('dotenv').config();

let cachedToken = null;
let tokenExpiresAt = null;

// Get and cache osu! OAuth token
async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch('https://osu.ppy.sh/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'public'
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch token: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return cachedToken;
}

// Get user ID from username
async function getUserId(username, token) {
  const res = await fetch(`https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/osu`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user ID for ${username}`);
  }

  const user = await res.json();
  return user.id;
}

// Get User data
async function getUser(username, mode = '0', token) {
  const res = await fetch(`https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/${mode}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user ID for ${username}`);
  }

  const user = await res.json();
  return user;
}

// Get User scores

async function getUserScore(userId, mode = 'osu', token) {
  const res = await fetch(`https://osu.ppy.sh/api/v2/users/${userId}/scores/best?limit=1&mode=${mode}`, {
    headers: { Authorization: `Bearer ${token}` }
  },
);

  if (!res.ok) {
    throw new Error(`Failed to load scores.`);
  }

  const score = await res.json();
  return score;
}


// Get recent score using user ID
async function getRecentScores(userId, token, limit = 10) {
    const res = await fetch(`https://osu.ppy.sh/api/v2/users/${userId}/scores/recent?limit=${limit}&include_fails=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  
    if (!res.ok) throw new Error('Failed to fetch recent scores');
    return await res.json();
}

async function getBeatmapsetDetails(beatmapId, token) {
    const res = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  
    if (!res.ok) throw new Error('Failed to fetch beatmapset details');
    return await res.json();
}

async function getAdjustedDifficulty(beatmapId, mods, token) {
  const url = `https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}/attributes`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mods })
  });

  const data = await response.json();
  return data.attributes; // includes star_rating, aim, speed, etc.
}


module.exports = {
  getAccessToken,
  getUserId,
  getUser,
  getUserScore,
  getRecentScores,
  getBeatmapsetDetails,
  getAdjustedDifficulty,
};
