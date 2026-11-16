import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const siteUrls = (process.env.SITE_URLS || '').split(',').map((s) => s.trim()).filter(Boolean)

const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'lomakkeet@rotas.fi',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Verkkosivut',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

export default buildConfig({
  serverURL: process.env.SERVER_URL || '',
  cors: siteUrls,
  csrf: siteUrls,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  // Payloadissa ei ole suomenkielistä käyttöliittymää: käyttöliittymä
  // englanniksi, kenttien ja kokoelmien nimet suomeksi.
  i18n: {
    supportedLanguages: { en },
    fallbackLanguage: 'en',
  },
  collections: [Pages, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    // Tuotannossa skeema muuttuu vain migraatioilla (pnpm migrate:create),
    // ja ne ajetaan konttia käynnistettäessä.
    prodMigrations: migrations,
  }),
  sharp,
  upload: { limits: { fileSize: 20_000_000 } },
  plugins: [
    formBuilderPlugin({
      fields: { payment: false, state: false, country: false },
      formOverrides: {
        labels: { singular: 'Lomake', plural: 'Lomakkeet' },
        admin: { group: 'Lomakkeet' },
        // Sivuston build lukee lomakkeiden kentät ilman tunnuksia, mutta
        // vastaanottajien osoitteet (emails) näkyvät vain kirjautuneille.
        access: { read: () => true },
        fields: ({ defaultFields }) =>
          defaultFields.map((field) =>
            'name' in field && field.name === 'emails'
              ? { ...field, access: { read: ({ req }) => Boolean(req.user) } }
              : field,
          ),
      },
      formSubmissionOverrides: {
        labels: { singular: 'Lomakevastaus', plural: 'Lomakevastaukset' },
        admin: { group: 'Lomakkeet' },
      },
    }),
  ],
})
