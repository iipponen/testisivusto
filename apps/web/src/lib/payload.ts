// Payloadin REST-rajapinta buildin aikana. Tyypit tulevat suoraan CMS:n
// generoimasta payload-types.ts:stä (pnpm --filter cms generate:types).
import type { Form, Media, Page, SiteSetting } from '@cms/types'

export const PAYLOAD_URL = (import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3000').replace(/\/$/, '')

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}/api/${path}`)
  if (!res.ok) throw new Error(`Payload ${path}: ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

// Vain julkaistut sivut (access-sääntö Pages.ts:ssä).
export const fetchPages = async (): Promise<Page[]> =>
  (await get<{ docs: Page[] }>('pages?limit=0&depth=2&sort=title')).docs

export const fetchSettings = (): Promise<SiteSetting> => get<SiteSetting>('globals/site-settings?depth=1')

export const HOME_SLUG = 'etusivu'

const withBase = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`

export const pageHref = (slug: string) => withBase(slug === HOME_SLUG ? '/' : `/${slug}/`)

type Link = { type?: ('page' | 'url') | null; page?: (number | null) | Page; url?: string | null }

export function linkHref(link: Link | null | undefined): string | undefined {
  if (!link) return undefined
  if (link.type === 'page' && link.page && typeof link.page === 'object') return pageHref(link.page.slug)
  if (link.url) return link.url.startsWith('/') ? withBase(link.url) : link.url
  return undefined
}

export const asMedia = (value: number | Media | null | undefined): Media | undefined =>
  value && typeof value === 'object' && value.url ? value : undefined

export const asForm = (value: number | Form | null | undefined): Form | undefined =>
  value && typeof value === 'object' ? value : undefined
