export const pageToken = process.env.FB_PAGE_TOKEN;
if (!pageToken) {
  throw new Error('FB_PAGE_TOKEN not found in env vars');
}

export const verifyToken = process.env.FB_VERIFY_TOKEN;
if (!verifyToken) {
  throw new Error('FB_VERIFY_TOKEN not found in env vars');
}

export const botUsername = process.env.FB_USERNAME;
if (!botUsername) {
  throw new Error('FB_USERNAME not found in env vars');
}

export const tvdbApiKey = process.env.TVDB_API_KEY;
if (!tvdbApiKey) {
  throw new Error('TVDB_API_KEY not found in env vars');
}

export const traktApiKey = process.env.TRAKT_API_KEY;
if (!traktApiKey) {
  throw new Error('TRAKT_API_KEY not found in env vars');
}

export const witAIToken = process.env.WITAI_TOKEN;
if (!witAIToken) {
  throw new Error('WITAI_TOKEN not found in env vars');
}
