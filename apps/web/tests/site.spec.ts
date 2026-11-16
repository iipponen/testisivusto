import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Kaikki buildatut sivut (dist/**/index.html) → polut.
const dist = new URL('../dist/', import.meta.url).pathname
const pages: string[] = []
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (name === 'index.html') pages.push('/' + relative(dist, dir).replace(/\\/g, '/'))
  }
}
walk(dist)

for (const path of pages) {
  const url = path === '/' ? '/' : `${path}/`
  test(`sivu ${url}`, async ({ page }, info) => {
    const errors: string[] = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(e.message))

    const res = await page.goto(url, { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1, h2').first()).toBeVisible()
    await expect(page.locator('img:not([alt])')).toHaveCount(0)

    // Saavutettavuus: WCAG 2.x A ja AA (axe-core).
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    const violations = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    expect(violations, 'saavutettavuusvirheet').toEqual([])
    expect(errors, 'selaimen konsolivirheet').toEqual([])

    // Kuvakaappaus katselmointiin (CI: artefakti "kuvakaappaukset").
    const name = url === '/' ? 'etusivu' : url.replaceAll('/', '')
    await page.screenshot({ path: `screenshots/${info.project.name}-${name}.png`, fullPage: true })
  })
}

// Lomake ei lähde ilman pakollisia kenttiä. Varsinaista lähetystä ei tehdä:
// testit ajetaan tuotannon CMS:n sisällöllä.
test('lomakkeen pakolliset kentät', async ({ page }) => {
  let posted = false
  page.on('request', (r) => r.url().includes('/api/form-submissions') && (posted = true))
  for (const path of pages) {
    await page.goto(path === '/' ? '/' : `${path}/`)
    const form = page.locator('form.payload-form').first()
    if (!(await form.count())) continue
    await form.locator('button[type=submit]').click()
    await page.waitForTimeout(300)
    expect(posted).toBe(false)
    await expect(form).toBeVisible()
    return
  }
  test.skip(true, 'sivustolla ei ole lomaketta')
})
