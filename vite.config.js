import { resolve } from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//import nodeResolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  publicDir: 'public',
  resolve:{
    alias: {
      '@': resolve(__dirname, './src')
    },
  },
  build:{
    outDir: 'dist'
  },
  server:{
    port: 8081,
    strictPort: false,
    open: true,
    https: false,
    ssr: false,
  },
  plugins: [
    vue()
  ]
})
