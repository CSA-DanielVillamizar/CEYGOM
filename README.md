# Ceygom Web

Astro + Tailwind (static) with a single React island (`QuoteWizard`) and one Azure Functions API (`POST /api/quote`), deployed to Azure Static Web Apps (Free plan, managed functions, Node.js 22, programming model v4).

```
src/                 Astro pages, layout, QuoteWizard island
public/              staticwebapp.config.json (redirects, 404, headers), robots.txt
api/quote/           Function: index.ts (registers app.http), handler.ts, env.ts, webhook.ts, reference.ts
packages/shared/     quote.schema.ts (Zod), catalog.ts, whatsapp.ts: imported by the site and bundled into the API
.github/workflows/   SWA CI/CD (typecheck + tests + build, then deploy)
```

## Commands

```bash
npm install && npm install --prefix api
npm test            # shared schema + API handler tests
npm run typecheck   # astro check + tsc for api and shared
npm run build       # site -> dist/
npm run api:build   # API -> api/dist/ (esbuild bundle, zod and shared inlined)
```

Local run with the API: copy `api/local.settings.example.json` to `api/local.settings.json` and fill `WHATSAPP_NUMBER`. The SWA CLI is a devDependency; Azure Functions Core Tools v4 must be installed globally.

Core Tools v4 refuses Node 24, which makes `npm run swa` fail on that version. Use Node 22 (as in production) and run `npm run api:build && npm run swa`. On Node 24 this was tested instead with three processes, which worked:

```bash
npm run api:build
(cd api && func start)                 # API on :7071
npm run dev                            # site on :4321
npx swa start http://localhost:4321 --api-devserver-url http://localhost:7071 --swa-config-location public   # emulator on :4280
```

## Catalog

49 products with their data sheets (PDF), photos and references are generated from `scripts/catalog/manifest.json` (see [`scripts/catalog/README.md`](scripts/catalog/README.md) and ADR-0013): one page per product at `/productos/<category>/<slug>/`, a sitemap and structured data. What the company still has to provide or confirm is listed in [`docs/catalogo/pendientes.md`](docs/catalogo/pendientes.md). Photos that do not show the exact product are marked "Imagen ilustrativa".

```bash
npm run catalog:import -- <download-folder>   # regenerate after editing the manifest
npm run budget                                # size and JavaScript budget (runs in CI; see docs/finops.md)
```

## Configuration

| Where | Variable | Notes |
|---|---|---|
| GitHub repo variables | `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_SITE_URL` | Public, inlined in the build |
| GitHub secret | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Created with the SWA resource |
| SWA Application settings | `WHATSAPP_NUMBER` (required), `LEADS_WEBHOOK_URL`, `LEADS_WEBHOOK_SECRET`, `ALLOWED_ORIGIN` | Server side. Do not start names with the reserved prefixes (`WEBSITE_`, `FUNCTIONS_`, `AZURE_FUNCTION_`...) |
| Google Apps Script properties | `WEBHOOK_TOKEN`, `RUT_FOLDER_ID` | Set in the script project, not in Azure. See the guide below |

### Lead storage (Google Apps Script + Sheets + Drive)

`LEADS_WEBHOOK_URL` is optional but without it quote requests, tax data and the attached RUT are not stored anywhere. Set it in the Application settings of the Static Web App to the URL of the Apps Script web app plus its token:

```bash
az staticwebapp appsettings set -n swa-ceygom-prd -g rg-ceygom-prd --setting-names "LEADS_WEBHOOK_URL=https://script.google.com/macros/s/<ID>/exec?token=<WEBHOOK_TOKEN>"
```

The URL is a secret (it carries the token); it must be HTTPS and is never logged. Do not set `LEADS_WEBHOOK_SECRET` with Apps Script, which cannot read headers. Setup, testing and operation: [`docs/integraciones/google-apps-script.md`](docs/integraciones/google-apps-script.md); payload contract: [`docs/integraciones/leads-webhook.md`](docs/integraciones/leads-webhook.md).

The webhook never blocks the customer: if it fails, times out (8 s, or 25 s when a RUT file is attached) or the destination answers `{"ok":false}`, the API still answers 200 with the WhatsApp link, `webhookDelivered: false` and a warning in the server log with the quote reference.

When the webhook has a `LEADS_WEBHOOK_SECRET` (for example Make), requests carry `x-ceygom-signature: sha256=<hex HMAC of the body>`.

## Pending business data (do not invent)

WhatsApp hours, the company Google account that owns the Apps Script, sheet and Drive folder, product photos/descriptions/data sheets (PDFs go in `public/fichas/`), certifications, Habeas Data policy text (marked `TODO(negocio)` in the code).

## Production (Azure Static Web Apps)

Resource `swa-ceygom-prd` (Free plan, Central US) in resource group `rg-ceygom-prd`, at `https://thankful-sky-016632b10.1.azurestaticapps.net` (temporary host name until the custom domain is linked; when it is, update `PUBLIC_SITE_URL` and `ALLOWED_ORIGIN`). Every push to `main` runs the workflow; the deployment token lives in the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.

Verified in production: Oryx builds `api/` with the esbuild step and the function is active; the main pages return 200; `/empresa.html` and `/productos.html` redirect with 301; unknown paths return a real 404; the security headers are present; `POST /api/quote` returns 200 for a valid request, 400 without consent and 403 for a foreign origin; `GET /api/quote` returns 404; the floating WhatsApp button points to `wa.me`.

## Not verified yet

The `wa.me` link and the quote wizard on real iOS and Android devices, the wizard in a browser against production, and the behaviour of the webhook when Google is slow with large files (see below).

Lead storage is live: `LEADS_WEBHOOK_URL` points to the Apps Script web app of the company Google account. Verified in production with a 5 MB PDF: the API answered 200 with `webhookDelivered: true` in about 16 s (the limit with a file is 25 s), the full row reached the `Leads` sheet and the file reached its quote subfolder in the `RUTs` Drive folder. Google does not document a size limit for requests received by a web app; 5 MB worked.

Verified locally (SWA CLI 2.1.0 emulator, Functions Core Tools 4.12.1 on Node 24): the full wizard flow in a browser (validation per step, `?producto=` prefill, submit, success screen with the wa.me link), the API (200, 400 for missing consent, 403 for a foreign origin, honeypot decoy, `GET /api/quote` is 404), webhook delivery with a valid HMAC signature, 301 redirects and the real 404 from `staticwebapp.config.json`. The emulator does not reproduce the cloud exactly.
