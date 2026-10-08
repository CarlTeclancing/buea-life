const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 5174);
const mobile = true;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (mobile && pathname === '/mobile') {
    res.writeHead(308, { location: '/mobile/' + url.search });
    return res.end();
  }
  if (mobile && pathname.startsWith('/mobile/')) pathname = pathname.slice('/mobile'.length);
  if (pathname === '/') pathname = '/index.html';
  // Serve client assets only, never server code or configuration files.
  const allowed = pathname === '/index.html' || (mobile && pathname === '/manifest.webmanifest') || pathname.startsWith('/src/');
  const file = path.resolve(root, '.' + pathname);
  const relative = path.relative(root, file);
  if (!allowed || relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Buea Life client http://localhost:${port}`));