import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
// Asetukset: ympäristömuuttujat > .env (paikallinen, ei gitissä) >
// site.env (tuotanto, gitissä). loadEnvFile ei korvaa jo asetettuja arvoja.
for (const file of ['.env', 'site.env']) {
  try {
    process.loadEnvFile(file)
  } catch {}
}
const env = process.env
const payloadUrl = new URL(env.PAYLOAD_URL || 'http://localhost:3000')

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
