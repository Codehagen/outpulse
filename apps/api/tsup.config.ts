import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: true,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
}); 