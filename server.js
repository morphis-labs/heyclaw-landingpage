const http = require('http');
const fs = require('fs');
const path = require('path');

let signalData = null;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Signal API: checkout → app token passing
  if (req.url === '/api/signal' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      signalData = JSON.parse(body);
      console.log('Signal received from checkout');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  if (req.url === '/api/signal' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(signalData));
    return;
  }

  if (req.url === '/api/signal' && req.method === 'DELETE') {
    signalData = null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Static file serving
  let filePath = req.url.split('?')[0].split('#')[0];
  if (filePath === '/') filePath = '/index.html';
  let fullPath = path.join(__dirname, filePath);

  // Try adding .html if no extension
  if (!path.extname(fullPath)) {
    fullPath += '.html';
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(3000, () => {
  console.log('Heyclaw landing page server running at http://localhost:3000');
});
