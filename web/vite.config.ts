import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { API_PROXY_PATHS, DEV_API_TARGET } from './src/constants/dev-proxy.constants';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: Object.fromEntries(API_PROXY_PATHS.map(path => [path, DEV_API_TARGET])) },
  test: { environment: 'node', pool: 'threads', poolOptions: { threads: { singleThread: true } } },
});
