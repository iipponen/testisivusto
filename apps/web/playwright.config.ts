import { defineConfig, devices } from '@playwright/test'

// Selaintestit valmiille (buildatulle) sivustolle: pnpm build && pnpm test.
// CI ajaa nämä Playwrightin kontissa (.github/workflows/check.yml); sama
// image toimii paikallisesti, ks. CLAUDE.md.
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: { baseURL: 'http://localhost:4321', trace: 'off' },
  webServer: {
    command: 'pnpm exec astro preview --port 4321 --host 127.0.0.1',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
