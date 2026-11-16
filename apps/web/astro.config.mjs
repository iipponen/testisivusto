import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
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
  // Fontit ladataan buildissa ja tarjoillaan sivustolta (ei Google Fontsia
  // kävijän selaimeen). Vaihda fontti: name + tokens.css (--brand-font).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
