const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const SUPABASE_BASE_HOST = 'qeplhebidpkkwxazbdmk.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

// Content types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization, Prefer');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Proxy Route: /api/usuarios or /api/supabase/usuarios -> https://qeplhebidpkkwxazbdmk.supabase.co/rest/v1/usuarios
  if (req.url.startsWith('/api/usuarios') || req.url.startsWith('/api/supabase')) {
    let supabasePath = '/rest/v1/usuarios';
    if (req.url.includes('?')) {
      supabasePath += req.url.substring(req.url.indexOf('?'));
    }

    let reqBody = '';
    req.on('data', chunk => reqBody += chunk);
    req.on('end', () => {
      const options = {
        hostname: SUPABASE_BASE_HOST,
        port: 443,
        path: supabasePath,
        method: req.method,
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': req.headers['prefer'] || 'return=representation'
        }
      };

      const proxyReq = https.request(options, proxyRes => {
        let resBody = '';
        proxyRes.on('data', chunk => resBody += chunk);
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(resBody);
        });
      });

      proxyReq.on('error', err => {
        console.error('Supabase Proxy Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Erro no servidor proxy local.', details: err.message }));
      });

      if (reqBody) {
        proxyReq.write(reqBody);
      }
      proxyReq.end();
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  filePath = path.normalize(filePath);

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Acesso proibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end('<h1>404 Página não encontrada</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Vozes na Tech rodando em http://localhost:${PORT}`);
});
