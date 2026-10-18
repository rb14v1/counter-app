'use strict';

// Load environment variables from .env file (development only; no-op if absent)
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Startup configuration validation
// Optional vars are listed here so they are discoverable; required vars will
// throw immediately if absent so the process fails fast rather than at
// request-handling time.
// ---------------------------------------------------------------------------
const OPTIONAL_VARS = ['PORT', 'NODE_ENV'];

OPTIONAL_VARS.forEach((key) => {
  if (process.env[key] !== undefined) {
    console.log(`config: ${key}=${process.env[key]}`);
  }
});

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Health check endpoint — no auth required
  if (req.method === 'GET' && (req.url === '/healthz' || req.url === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Serve built React SPA from dist/
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  fs.access(filePath, fs.constants.F_OK, (accessErr) => {
    if (accessErr) {
      // Fallback to index.html for client-side routing
      filePath = path.join(DIST_DIR, 'index.html');
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`counterapp listening on port ${PORT}`);
});
