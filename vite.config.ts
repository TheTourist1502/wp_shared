import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const port = Number(env.PORT);

  return {
    server: { port, strictPort: true, origin: `http://localhost:${port}` },
    preview: { port, strictPort: true },
    build: { target: 'esnext' },
    plugins: [
      react(),
      federation({
        name: 'wp_shared',
        filename: 'remoteEntry.js',
        exposes: {
          './Card': './src/card.tsx',
          './DataTable': './src/components/data-table/index.tsx',
          './http_service': './src/services/http-service/index.ts',
          './constants': './src/constants/index.ts',
        },
        remotes: {},
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
          '@tanstack/react-query': { singleton: true },
        },
      }),
    ],
  };
});
