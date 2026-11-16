# Asiakassivusto

Astro 7 + Payload 3 -monorepo, luotu `iipponen/sivustoalusta`-repon
`template/`-pohjasta. Arkkitehtuuri ja periaatteet ovat siellä
(`docs/arkkitehtuuri.md`); käyttöohje on tämän repon README:ssä.

## Periaatteet

- Julkinen sivusto on staattinen eikä saa riippua CMS:stä ajon aikana
  (ainoa poikkeus: lomakkeen lähetys).
- Uusi lohko = Payload-skeema + Astro-komponentti + rekisteröinti
  `Blocks.astro`:ssa. Aja `pnpm --filter cms generate:types` skeeman muutoksen
  jälkeen ja tee migraatio (`pnpm --filter cms migrate:create`).
- Ulkoasu muutetaan design-tokeneilla (`apps/web/src/styles/tokens.css`)
  ennen kuin komponentteihin kirjoitetaan yksittäisiä värejä.
- Muokkaajan näkemät tekstit (kenttien nimet, ohjeet) suomeksi.
- Saavutettavuus: WCAG 2.2 AA (alt-tekstit pakollisia, näppäimistö, kontrasti).

## Tarkistukset ennen committia

```sh
pnpm --filter cms check && pnpm --filter web check
pnpm build:web          # CMS käynnissä
```

Ulkoasumuutoksista kuvakaappaukset (mobiili + työpöytä) ennen ja jälkeen.

## Työtavat

- Dokumentaatio ja commit-viestit suomeksi.
- Salaisuudet vain `.env`:ssä (ei repoon) ja GitHub Actionsin secreteissä.
  Repo on julkinen.
