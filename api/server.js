'use strict';

const http = require('http');
const { Readable } = require('stream');

const COBALT = process.env.COBALT_URL || 'https://cobalt-production-b92e.up.railway.app/';
const PORT = process.env.PORT || 3000;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

async function cobaltFetch(body) {
  const res = await fetch(COBALT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; reform-app/1.0)',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function handleCobalt(req, res) {
  const body = await readBody(req);
  const { url, videoQuality, downloadMode } = body;

  try {
    const data = await cobaltFetch({ url, videoQuality, downloadMode });

    if (data.status === 'redirect' && (!downloadMode || downloadMode === 'auto')) {
      try {
        const audio = await cobaltFetch({ url, downloadMode: 'audio' });
        if (
          audio.url &&
          audio.url !== data.url &&
          (audio.status === 'redirect' || audio.status === 'stream' || audio.status === 'tunnel')
        ) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ...data, audioUrl: audio.url }));
          return;
        }
      } catch {
        /* audio request failed, return video only */
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: { code: 'error.proxy' } }));
  }
}

async function handleDownload(req, res) {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const url = reqUrl.searchParams.get('url');
  const filename = reqUrl.searchParams.get('filename') || 'video.mp4';

  if (!url) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing url parameter' }));
    return;
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!upstream.ok) {
      res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Upstream error ${upstream.status}` }));
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');
    const headers = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };
    if (contentLength) headers['Content-Length'] = contentLength;

    res.writeHead(200, headers);
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', detail: String(err) }));
    }
  }
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;

  if (req.method === 'POST' && pathname === '/api/proxy-cobalt') {
    await handleCobalt(req, res);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/proxy-download') {
    await handleDownload(req, res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
