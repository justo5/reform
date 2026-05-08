import type { VercelRequest, VercelResponse } from '@vercel/node';

const COBALT = 'https://cobalt-production-b92e.up.railway.app/';

const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; reform-app/1.0)',
};

async function cobaltFetch(body: object): Promise<any> {
  const res = await fetch(COBALT, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, videoQuality, downloadMode } = req.body ?? {};

  try {
    const data = await cobaltFetch({ url, videoQuality, downloadMode });

    // When cobalt returns a direct CDN redirect (no server-side merge), the URL
    // may be video-only (Instagram Reels separate audio/video tracks). Try to
    // also get the audio track via a second request.
    if (data.status === 'redirect' && (!downloadMode || downloadMode === 'auto')) {
      try {
        const audio = await cobaltFetch({ url, downloadMode: 'audio' });
        if (audio.url && audio.url !== data.url &&
            (audio.status === 'redirect' || audio.status === 'stream' || audio.status === 'tunnel')) {
          return res.status(200).json({ ...data, audioUrl: audio.url });
        }
      } catch {
        // audio request failed, return video only
      }
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: 'error', error: { code: 'error.proxy' } });
  }
}
