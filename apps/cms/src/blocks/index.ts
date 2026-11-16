import type { Block } from 'payload'

import { linkFields } from '../fields/link'

// Jokaista lohkoa vastaa Astro-komponentti apps/web/src/blocks/<slug>.astro.
// Uusi lohko = skeema tähän + komponentti + rekisteröinti Blocks.astro:ssa.

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Herot' },
  fields: [
    { name: 'heading', type: 'text', label: 'Otsikko', required: true },
    { name: 'text', type: 'textarea', label: 'Teksti' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Kuva' },
    { name: 'links', type: 'array', label: 'Painikkeet', maxRows: 2, fields: linkFields({ required: true }) },
  ],
}

export const Content: Block = {
  slug: 'content',
  labels: { singular: 'Tekstiosio', plural: 'Tekstiosiot' },
  fields: [{ name: 'body', type: 'richText', label: 'Sisältö', required: true }],
}

export const Cards: Block = {
  slug: 'cards',
  labels: { singular: 'Kortit', plural: 'Kortit' },
  fields: [
    { name: 'heading', type: 'text', label: 'Otsikko' },
    { name: 'intro', type: 'textarea', label: 'Johdanto' },
    {
      name: 'items',
      type: 'array',
      label: 'Kortit',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', label: 'Otsikko', required: true },
        { name: 'text', type: 'textarea', label: 'Teksti' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Kuva' },
        { name: 'link', type: 'group', label: 'Linkki', fields: linkFields() },
      ],
    },
  ],
}

export const CallToAction: Block = {
  slug: 'cta',
  labels: { singular: 'Toimintakehote', plural: 'Toimintakehotteet' },
  fields: [
    { name: 'heading', type: 'text', label: 'Otsikko', required: true },
    { name: 'text', type: 'textarea', label: 'Teksti' },
    { name: 'link', type: 'group', label: 'Painike', fields: linkFields({ required: true }) },
  ],
}

export const FormBlock: Block = {
  slug: 'form',
  labels: { singular: 'Lomake', plural: 'Lomakkeet' },
  fields: [
    { name: 'heading', type: 'text', label: 'Otsikko' },
    { name: 'form', type: 'relationship', relationTo: 'forms', label: 'Lomake', required: true },
  ],
}

export const blocks: Block[] = [Hero, Content, Cards, CallToAction, FormBlock]
