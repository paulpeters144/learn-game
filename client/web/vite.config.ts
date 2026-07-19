import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/learn-game/',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@package/core': path.resolve(__dirname, '../../package/core/src'),
      '@package/assets': path.resolve(__dirname, '../../package/assets'),
    },
  },
  plugins: [
    {
      name: 'full-reload-on-any-change',
      handleHotUpdate({ server }) {
        server.ws.send({
          type: 'full-reload',
        });
      },
    },
  ],
});
