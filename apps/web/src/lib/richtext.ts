import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { pageHref } from './payload'

// Lexical-JSON → HTML buildissa. Sisäiset linkit osoittavat sivuston polkuihin.
export const richTextToHTML = (data: unknown): string =>
  data
    ? convertLexicalToHTML({
        data: data as SerializedEditorState,
        disableContainer: true,
        internalDocToHref: ({ linkNode }) => {
          const doc = linkNode.fields.doc?.value
          return doc && typeof doc === 'object' && 'slug' in doc ? pageHref(String(doc.slug)) : '#'
        },
      })
    : ''
