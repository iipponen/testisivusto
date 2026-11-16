import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Käyttäjä', plural: 'Käyttäjät' },
  admin: {
    useAsTitle: 'email',
    group: 'Ylläpito',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  fields: [{ name: 'name', type: 'text', label: 'Nimi' }],
}
