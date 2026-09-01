import { join } from 'node:path'
import { defineConfig } from '@playwright/test'

const fakeVideo = join(import.meta.dirname, 'e2e', 'fixtures', 'gerak.y4m')

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  workers: 1,
  use: {
    baseURL: 'http://localhost:3100',
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        `--use-file-for-fake-video-capture=${fakeVideo}`,
      ],
    },
  },
  timeout: 120_000,
  expect: { timeout: 15_000 },
  webServer: {
    command: 'LAKON_ALLOW_DRAFT=1 pnpm build && pnpm exec next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
