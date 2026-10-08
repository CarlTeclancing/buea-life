// Vercel captures the HTTP server when listen() runs during module startup.
const { server } = require('./src/server');
server.listen(Number(process.env.PORT || 4100));
