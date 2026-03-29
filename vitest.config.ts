import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, './src/engine'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
});
