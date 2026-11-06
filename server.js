'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

// Only files needed by the public site can be requested. This also prevents
// accidental exposure of project files such as package.json or server.js.
const PUBLIC_FILES = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/script.js', 'script.js'],
  ['/public/images/yr-language-services.png', 'public/images/yr-language-services.png'],
  ['/public/fonts/Geist-Regular.ttf', 'public/fonts/Geist-Regular.ttf'],
  ['/public/fonts/Geist-Medium.ttf', 'public/fonts/Geist-Medium.ttf'],
  ['/public/fonts/Geist-SemiBold.ttf', 'public/fonts/Geist-SemiBold.ttf'],
  ['/public/fonts/SourceSerif4-Regular.ttf', 'public/fonts/SourceSerif4-Regular.ttf'],
  ['/public/fonts/SourceSerif4-SemiBold.ttf', 'public/fonts/SourceSerif4-SemiBold.ttf'],
  ['/public/fonts/SourceSerif4-Italic.ttf', 'public/fonts/SourceSerif4-Italic.ttf'],
]);

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.ttf', 'font/ttf'],
]);

function setSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'",
  );
}

function reply(response, status, message, extraHeaders = {}) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  response.end(message);
}

const server = http.createServer((request, response) => {
  setSecurityHeaders(response);

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(response, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    reply(response, 400, 'Bad request');
    return;
  }

  const relativePath = PUBLIC_FILES.get(pathname);
  if (!relativePath) {
    reply(response, 404, 'Not found');
    return;
  }

  const filePath = path.join(ROOT, relativePath);
  fs.stat(filePath, (statError, fileInfo) => {
    if (statError || !fileInfo.isFile()) {
      reply(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': MIME_TYPES.get(path.extname(filePath)) || 'application/octet-stream',
      'Content-Length': fileInfo.size,
      'Cache-Control': pathname === '/' || pathname === '/index.html'
        ? 'no-cache'
        : 'public, max-age=3600',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!response.headersSent) reply(response, 500, 'Internal server error');
      else response.destroy();
    });
    stream.pipe(response);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`YR Language Services listening on port ${PORT}`);
});

server.on('error', () => {
  console.error('The website server could not start.');
  process.exitCode = 1;
});
