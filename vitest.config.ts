import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      exclude: configDefaults.exclude,
      include: ['src/**/*.test.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: [
        './src/test/support/setup-router-mock.ts',
        './src/test/support/setup-container-mock.ts',
      ],
      globals: true,
    },
  }),
)
