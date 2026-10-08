const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const services = [
  { label: 'backend', cwd: path.join(root, 'backend', 'src'), port: 4100, command: 'server.js' },
  { label: 'frontend', cwd: path.join(root, 'frontend'), port: 5173, command: 'server.js' },
  { label: 'mobile', cwd: path.join(root, 'mobile'), port: 5174, command: 'server.js' }
];

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => tester.close(() => resolve(true)));
    tester.listen(port, '127.0.0.1');
  });
}

async function main() {
  for (const service of services) {
    const free = await isPortFree(service.port);
    if (!free) {
      console.log(`[start] ${service.label} port ${service.port} is already running; skipping duplicate start.`);
      continue;
    }

    const child = spawn(process.execPath, [service.command], {
      cwd: service.cwd,
      env: { ...process.env, PORT: String(service.port) },
      stdio: 'inherit'
    });

    child.on('exit', (code) => {
      if (code && code !== 0) {
        console.error(`[start] ${service.label} exited with code ${code}`);
      }
    });
  }
}

main();
