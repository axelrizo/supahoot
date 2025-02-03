import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const sourcePath = fileURLToPath(new URL('./src', import.meta.url))
const supahootWebPath = path.join(sourcePath, 'lib', 'supahoot-web')
const supahootPath = path.join(sourcePath, 'lib', 'supahoot')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': sourcePath,
      '@supahoot-web': supahootWebPath,
      "@supahoot": supahootPath,
    },
  },
})
