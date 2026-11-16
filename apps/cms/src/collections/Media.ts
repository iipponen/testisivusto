import path from 'path'
import type { CollectionConfig } from 'payload'

import { triggerSiteBuild } from '../hooks/triggerSiteBuild'

// Alkuperäiset kuvat talteen; Astro tekee optimoidut versiot buildissa.
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Kuva', plural: 'Kuvat' },
  admin: { group: 'Sisältö' },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [() => triggerSiteBuild('media')],
    afterDelete: [() => triggerSiteBuild('media')],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Vaihtoehtoinen teksti',
      required: true,
      admin: { description: 'Kuvaile kuva näkövammaiselle lukijalle (ruudunlukija).' },
    },
  ],
  upload: {
    // Kontissa MEDIA_DIR osoittaa volyymiin (compose.yaml).
    staticDir: path.resolve(process.env.MEDIA_DIR || 'media'),
    mimeTypes: ['image/*'],
    focalPoint: true,
  },
}
