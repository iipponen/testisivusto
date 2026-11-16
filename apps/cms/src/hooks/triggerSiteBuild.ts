// Käynnistää julkisen sivuston buildin GitHub Actionsissa
// (repository_dispatch, event_type "payload-publish"). Peräkkäiset
// tallennukset niputetaan: build lähtee DEBOUNCE_MS kuluttua viimeisestä.
const DEBOUNCE_MS = 30_000

let timer: ReturnType<typeof setTimeout> | undefined
const reasons = new Set<string>()

export const triggerSiteBuild = (reason: string): void => {
  const repo = process.env.GITHUB_REPO
  const token = process.env.GITHUB_DISPATCH_TOKEN
  if (!repo || !token) return

  reasons.add(reason)
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const payload = { reasons: [...reasons] }
    reasons.clear()
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ event_type: 'payload-publish', client_payload: payload }),
      })
      if (!res.ok) console.error(`Sivuston build ei käynnistynyt: ${res.status} ${await res.text()}`)
      else console.info(`Sivuston build käynnistetty (${payload.reasons.join(', ')})`)
    } catch (err) {
      console.error('Sivuston build ei käynnistynyt:', err)
    }
  }, DEBOUNCE_MS)
}
