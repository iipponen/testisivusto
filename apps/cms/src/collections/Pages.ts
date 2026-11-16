import type { CollectionConfig } from 'payload'

import { blocks } from '../blocks'
import { triggerSiteBuild } from '../hooks/triggerSiteBuild'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Sivu', plural: 'Sivut' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Sisältö',
  },
  access: {
    // Julkaistut sivut ovat julkisia (sivuston build lukee ne ilman
    // tunnuksia); luonnokset vain kirjautuneille.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 25,
  },
  hooks: {
    afterChange: [({ doc }) => doc._status === 'published' && triggerSiteBuild('pages')],
    afterDelete: [() => triggerSiteBuild('pages')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Otsikko', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Polku',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Osoitteen loppuosa, esim. "palvelut". Etusivu: "etusivu".',
      },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Vain pieniä kirjaimia a–z, numeroita ja väliviivoja.',
    },
    { name: 'layout', type: 'blocks', label: 'Sisältö', blocks, required: true },
    {
      name: 'seo',
      type: 'group',
      label: 'Hakukoneet ja jakaminen',
      fields: [
        { name: 'title', type: 'text', label: 'Sivun otsikko (title)' },
        { name: 'description', type: 'textarea', label: 'Kuvaus', maxLength: 160 },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Jakokuva' },
      ],
    },
  ],
}
