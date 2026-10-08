const http = require('http');
const fs = require('fs');
const path = require('path');
// Literal references let Vercel trace every asset into the function bundle.
// Add new client assets here as well as in the HTML or module imports.
const assets = new Map([
  ['/index.html', fs.readFileSync(path.join(__dirname, 'index.html'))],
  ['/manifest.webmanifest', fs.readFileSync(path.join(__dirname, 'manifest.webmanifest'))],
  ['/src/app.js', fs.readFileSync(path.join(__dirname, 'src/app.js'))],
  ['/src/game-audio.js', fs.readFileSync(path.join(__dirname, 'src/game-audio.js'))],
  ['/src/play-ux.css', fs.readFileSync(path.join(__dirname, 'src/play-ux.css'))],
  ['/src/setup-preview.css', fs.readFileSync(path.join(__dirname, 'src/setup-preview.css'))],
  ['/src/story-mode.css', fs.readFileSync(path.join(__dirname, 'src/story-mode.css'))],
  ['/src/story-responsive.css', fs.readFileSync(path.join(__dirname, 'src/story-responsive.css'))],
  ['/src/style.css', fs.readFileSync(path.join(__dirname, 'src/style.css'))],
  ['/src/world3d.css', fs.readFileSync(path.join(__dirname, 'src/world3d.css'))],
  ['/src/world3d.js', fs.readFileSync(path.join(__dirname, 'src/world3d.js'))]
]);
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
  const content = assets.get(pathname);
  if (!content) {
    res.writeHead(404);
    return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': types[path.extname(pathname)] || 'application/octet-stream' });
  res.end(content);
}).listen(port, () => console.log(`Buea Life client http://localhost:${port}`));