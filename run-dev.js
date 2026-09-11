import { spawn } from 'child_process';

console.log('🚀 Starting Enterprise Task Management System (Server & Client concurrently)...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const server = spawn(npmCmd, ['run', 'dev', '--workspace=server'], {
  stdio: 'inherit',
  shell: true,
});

const client = spawn(npmCmd, ['run', 'dev', '--workspace=client'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = (code) => {
  try {
    server.kill();
    client.kill();
  } catch (_) {}
  process.exit(code || 0);
};

server.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️ Server process exited with code ${code}`);
  }
});

client.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️ Client process exited with code ${code}`);
  }
});

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));
process.on('exit', () => cleanup(0));
