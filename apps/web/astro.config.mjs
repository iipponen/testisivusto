import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
// .env (paikallinen kehitys); CI:ssä arvot tulevat ympäristömuuttujina.
try {
  process.loadEnvFile('.env')
} catch {}
const env = process.env
const payloadUrl = new URL(env.PUBLIC_PAYLOAD_URL || 'http://localhost:3000')

export default defineConfig({
  // Staattinen sivusto: ei palvelinkoodia tuotannossa (ks. sivustoalustan
  // docs/arkkitehtuuri.md).
  output: 'static',
  site: env.SITE_URL || 'http://localhost:4321',
  base: env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  image: {
    // Payloadin kuvat ladataan ja optimoidaan buildissa; sivusto ei hae
    // niitä CMS:stä ajon aikana.
    remotePatterns: [{ protocol: payloadUrl.protocol.replace(':', ''), hostname: payloadUrl.hostname }],
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
