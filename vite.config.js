import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// Lets app code read env vars as `process.env.VITE_*`. Only VITE_-prefixed
// variables are exposed, so nothing private ends up in the browser bundle.
function processEnv() {
  return {
    name: 'process-env',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      return { define: { 'process.env': JSON.stringify(env) } }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    processEnv(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
