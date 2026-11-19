/**
 * SentiPulse - Unified Development Runner
 * Starts both the Node.js REST API server (port 8000) and the Vite Dev Server (port 5173).
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('============================================================');
console.log(' Starting SentiPulse Public Health Intelligence Services...');
console.log('============================================================');

// 1. Start REST Backend Server
const backend = spawn('node', ['backend/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => {
  console.error('[Backend Error]:', err);
});

// 2. Start Vite Frontend Server
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

frontend.on('error', (err) => {
  console.error('[Frontend Error]:', err);
});

function cleanup() {
  console.log('\nShutting down SentiPulse services...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
