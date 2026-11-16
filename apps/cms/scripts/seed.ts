// Esimerkkisisältö uuteen, tyhjään CMS:ään REST-rajapinnan kautta:
//   SEED_URL=http://localhost:3000 SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… pnpm --filter cms seed
// Luo ensimmäisen ylläpitäjän (first-register), kuvan, lomakkeen, sivut ja
// asetukset. Toimii sekä paikallisesti että sorsan CMS:ää vasten. Node ajaa
// TypeScriptin suoraan (type stripping), joten tässä ei käytetä Payloadia.
import sharp from 'sharp'

const base = (process.env.SEED_URL || 'http://localhost:3000').replace(/\/$/, '')
const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const password = process.env.SEED_ADMIN_PASSWORD || 'kehitys-salasana'
let token = ''

async function api(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${base}/api/${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...init.headers,
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status} ${JSON.stringify(json)}`)
  return json
}
const post = (path: string, data: unknown) => api(path, { method: 'POST', body: JSON.stringify(data) })

const p = (text: string) => ({
  type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0,
  children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 }],
})
const h = (text: string, tag: 'h2' | 'h3' = 'h2') => ({ ...p(text), type: 'heading', tag })
const richText = (...children: object[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})

const { totalDocs } = await api('pages?limit=0&depth=0')
if (totalDocs > 0) {
  console.log('CMS:ssä on jo sivuja, seed ohitetaan.')
  process.exit(0)
}

token = (await post('users/first-register', { email, password, name: 'Ylläpitäjä' })).token

const image = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: '#2f5d50' } })
  .composite([
    {
      input: Buffer.from(
        '<svg width="1600" height="1000"><circle cx="1200" cy="300" r="380" fill="#e9c46a" opacity="0.85"/><circle cx="350" cy="820" r="260" fill="#f4a261" opacity="0.7"/></svg>',
      ),
    },
  ])
  .jpeg({ quality: 85 })
  .toBuffer()
const upload = new FormData()
upload.append('file', new Blob([new Uint8Array(image)], { type: 'image/jpeg' }), 'esimerkki.jpg')
upload.append('_payload', JSON.stringify({ alt: 'Abstrakti kuvitus: vihreä tausta ja kaksi lämpimän sävyistä ympyrää' }))
const media = (await api('media', { method: 'POST', body: upload })).doc

const form = (
  await post('forms', {
    title: 'Yhteydenotto',
    submitButtonLabel: 'Lähetä',
    confirmationType: 'message',
    confirmationMessage: richText(p('Kiitos viestistäsi! Vastaamme pian.')),
    fields: [
      { blockType: 'text', name: 'nimi', label: 'Nimi', required: true, width: 100 },
      { blockType: 'email', name: 'sahkoposti', label: 'Sähköposti', required: true, width: 100 },
      {
        blockType: 'select',
        name: 'aihe',
        label: 'Aihe',
        width: 100,
        options: [
          { label: 'Tarjouspyyntö', value: 'tarjous' },
          { label: 'Muu asia', value: 'muu' },
        ],
      },
      { blockType: 'textarea', name: 'viesti', label: 'Viesti', required: true, width: 100 },
      {
        blockType: 'checkbox',
        name: 'tietosuoja',
        label: 'Hyväksyn, että tietojani käytetään viestiini vastaamiseen.',
        required: true,
        width: 100,
      },
    ],
    emails: [
      {
        emailTo: email,
        replyTo: '{{sahkoposti}}',
        subject: 'Yhteydenotto verkkosivuilta: {{nimi}}',
        message: richText(p('{{*:table}}')),
      },
    ],
  })
).doc

const pages = [
  {
    title: 'Etusivu',
    slug: 'etusivu',
    layout: [
      {
        blockType: 'hero',
        heading: 'Esimerkkiyritys Oy',
        text: 'Selkeitä palveluita pienille ja keskisuurille yrityksille.',
        image: media.id,
        links: [{ label: 'Palvelut', type: 'url', url: '/palvelut' }],
      },
      {
        blockType: 'cards',
        heading: 'Mitä teemme',
        items: [
          { title: 'Suunnittelu', text: 'Kartoitamme tarpeet ja teemme suunnitelman.' },
          { title: 'Toteutus', text: 'Toteutamme sovitusti ja aikataulussa.' },
          { title: 'Ylläpito', text: 'Pidämme huolen, että kaikki toimii jatkossakin.' },
        ],
      },
      {
        blockType: 'cta',
        heading: 'Kysy lisää',
        text: 'Kerro tarpeestasi, niin palaamme asiaan.',
        link: { label: 'Ota yhteyttä', type: 'url', url: '/yhteystiedot' },
      },
    ],
  },
  {
    title: 'Palvelut',
    slug: 'palvelut',
    layout: [
      {
        blockType: 'content',
        body: richText(
          h('Palvelut'),
          p('Tämä on esimerkkisivu. Asiakas muokkaa tekstit hallintapaneelissa.'),
          h('Suunnittelu', 'h3'),
          p('Kuvaus palvelusta.'),
        ),
      },
    ],
  },
  {
    title: 'Yhteystiedot',
    slug: 'yhteystiedot',
    layout: [
      { blockType: 'content', body: richText(h('Yhteystiedot'), p('Lähetä viesti alla olevalla lomakkeella.')) },
      { blockType: 'form', heading: 'Lähetä viesti', form: form.id },
    ],
  },
]
for (const page of pages) await post('pages', { ...page, _status: 'published' })

await post('globals/site-settings', {
  siteName: 'Esimerkkiyritys Oy',
  navigation: [
    { label: 'Etusivu', type: 'url', url: '/' },
    { label: 'Palvelut', type: 'url', url: '/palvelut' },
    { label: 'Yhteystiedot', type: 'url', url: '/yhteystiedot' },
  ],
  contact: { email: 'info@example.com', phone: '+358 40 123 4567', address: 'Esimerkkikatu 1\n00100 Helsinki' },
  footerText: '© Esimerkkiyritys Oy',
  seo: { description: 'Esimerkkiyrityksen verkkosivut.', image: media.id },
})

console.log(`Seed valmis: ${base}/admin, käyttäjä ${email}`)
