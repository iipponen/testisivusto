# testisivusto

Sivustoalustan testiasiakas (esimerkkisisältö), luotu
[sivustoalustan](https://github.com/iipponen/sivustoalusta) `template/`-pohjasta: **Astro 7** (staattinen sivusto, GitHub
Pages) + **Payload 3** (CMS, Docker sorsalla) pnpm-monorepona. Arkkitehtuuri:
[sivustoalusta/docs/arkkitehtuuri.md](https://github.com/iipponen/sivustoalusta/blob/main/docs/arkkitehtuuri.md).

| Hakemisto | Sisältö |
|---|---|
| `apps/cms` | Payload: kokoelmat (`pages`, `media`, `users`), lohkot, `site-settings`, Form Builder, julkaisu-hook |
| `apps/web` | Astro: sivut Payloadin sisällöstä buildissa, lohkokomponentit, design-tokenit, lomake |
| `compose.dev.yaml` | Paikallinen Postgres kehitykseen |

## Kehitys

Vaatii Node 24 LTS:n, pnpm 11:n (`corepack enable`) ja Dockerin.

```sh
pnpm install
pnpm db:up                                  # Postgres 127.0.0.1:54329
cp apps/cms/.env.example apps/cms/.env      # aseta PAYLOAD_SECRET (openssl rand -hex 32)
cp apps/web/.env.example apps/web/.env
pnpm dev:cms                                # http://localhost:3000/admin
pnpm --filter cms seed                      # esimerkkisisältö, admin@example.com / kehitys-salasana
pnpm build:web                              # vaatii käynnissä olevan CMS:n
pnpm --filter web preview                   # http://localhost:4321
```

Kehityksessä Payload synkronoi kannan skeeman automaattisesti. Ennen
tuotantoa skeemamuutoksista tehdään migraatio: `pnpm --filter cms migrate:create`.

## Sisältö → sivusto

- Astro hakee buildissa julkaistut sivut (`/api/pages`) ja asetukset
  (`/api/globals/site-settings`) ja lataa kuvat optimoitavaksi. Valmis
  sivusto ei ota yhteyttä CMS:ään, paitsi lomakkeiden lähetyksessä.
- Sivun polku on sen `slug`; `etusivu` on juuri (`/`).
- Lohko = Payload-skeema `apps/cms/src/blocks/index.ts` + Astro-komponentti
  `apps/web/src/blocks/` + rivi `apps/web/src/components/Blocks.astro`:ssa.
  Tyypit tulevat CMS:stä: `pnpm --filter cms generate:types`.
- Julkaisu Payloadissa lähettää GitHubiin `repository_dispatch`-tapahtuman
  (`GITHUB_REPO`, `GITHUB_DISPATCH_TOKEN`), joka käynnistää buildin.

## Lomakkeet

Payloadin Form Builder: muokkaaja tekee lomakkeen ja vastaanottajat
hallintapaneelissa ja lisää sen sivulle Lomake-lohkona. Selain lähettää
vastauksen suoraan Payloadiin; sallitut alkuperät ovat `SITE_URLS`:ssä
(CORS). Posti lähtee Brevon kautta (`SMTP_*`); ilman `SMTP_HOST`:ia viestit
kirjoitetaan lokiin.

## Tiedossa olevat rajoitukset

- Payloadissa ei ole suomenkielistä käyttöliittymää: käyttöliittymä on
  englanniksi, kenttien nimet suomeksi.
- `pnpm-workspace.yaml`:n rolldown-poikkeus on tilapäinen (AVX2-bugi), ks.
  kommentti tiedostossa.
