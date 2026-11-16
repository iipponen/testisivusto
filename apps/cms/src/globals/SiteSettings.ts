import type { GlobalConfig } from 'payload'

import { linkFields } from '../fields/link'
import { triggerSiteBuild } from '../hooks/triggerSiteBuild'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Sivuston asetukset',
  admin: { group: 'Sisältö' },
  access: { read: () => true },
  hooks: {
    afterChange: [() => triggerSiteBuild('site-settings')],
  },
  fields: [
    { name: 'siteName', type: 'text', label: 'Sivuston nimi', required: true },
    { name: 'navigation', type: 'array', label: 'Päävalikko', fields: linkFields({ required: true }) },
    {
      name: 'contact',
      type: 'group',
      label: 'Yhteystiedot',
      fields: [
        { name: 'email', type: 'email', label: 'Sähköposti' },
        { name: 'phone', type: 'text', label: 'Puhelin' },
        { name: 'address', type: 'textarea', label: 'Osoite' },
      ],
    },
    { name: 'footerText', type: 'textarea', label: 'Alatunnisteen teksti' },
    {
      name: 'seo',
      type: 'group',
      label: 'Hakukoneiden oletukset',
      fields: [
        { name: 'description', type: 'textarea', label: 'Oletuskuvaus', maxLength: 160 },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Oletusjakokuva' },
      ],
    },
  ],
}
