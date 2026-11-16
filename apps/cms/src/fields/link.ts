import type { Field } from 'payload'

// Linkki joko sivustolle (sivu) tai ulkoiseen osoitteeseen.
export const linkFields = (options: { required?: boolean } = {}): Field[] => [
  { name: 'label', type: 'text', label: 'Teksti', required: options.required },
  {
    name: 'type',
    type: 'radio',
    label: 'Kohde',
    defaultValue: 'page',
    options: [
      { label: 'Sivu', value: 'page' },
      { label: 'Osoite', value: 'url' },
    ],
    admin: { layout: 'horizontal' },
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    label: 'Sivu',
    admin: { condition: (_, sibling) => sibling?.type === 'page' },
  },
  {
    name: 'url',
    type: 'text',
    label: 'Osoite',
    admin: { condition: (_, sibling) => sibling?.type === 'url' },
  },
]
