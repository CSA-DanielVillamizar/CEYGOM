# AGENT HARNESS: Plataforma web Electro Metálicas Ceygom

Este archivo es el contexto obligatorio para cualquier agente o desarrollador. Si algo no está aquí ni en la documentación oficial citada, **no se inventa**: se usa un placeholder y se registra en "Datos de negocio pendientes".

## 1. Decisiones validadas contra documentación oficial (leer primero)

Tres puntos del encargo original chocan con la documentación vigente de Microsoft. Se resuelven así:

| Punto original | Hallazgo en docs oficiales | Decisión del arnés |
|---|---|---|
| SWA **Free** + Functions en **Consumption Plan** separado | "Bring your own Functions" **requiere el plan Standard** de SWA. En Free solo existen **managed functions** (Consumption administrado, solo triggers HTTP). Fuente: learn.microsoft.com/azure/static-web-apps/functions-bring-your-own y /apis-overview | Usar **managed functions** (carpeta `api/`, desplegada por SWA). Costo cero real. Para este proyecto basta HTTP. |
| Functions "Node.js **isolated worker**" | "Isolated worker" es un modelo de **.NET**. Node.js usa el **modelo de programación v4** (`@azure/functions` 4.x, `app.http()`). Fuente: /azure/azure-functions/functions-reference-node | Node.js + TypeScript con modelo v4. |
| Functions en "Consumption Plan" | El hosting Linux en Consumption **se retira el 30-sep-2028**; el recomendado es **Flex Consumption**. Fuente: /azure/azure-functions/consumption-plan | No aplica hoy (managed functions). Si más adelante se sube a Standard, enlazar una Function App en **Flex Consumption**. El código no cambia porque usa el mismo modelo v4. |

Límites de managed functions y Free que condicionan el diseño (fuentes: /static-web-apps/apis-overview, /quotas, /apis-functions):
- Solo HTTP; prefijo de ruta obligatorio `/api`; duración máxima por request **45 s**.
- Sin Managed Identity ni Key Vault references: los secretos van en **Application settings** de la SWA.
- Prefijos de settings reservados: `APPSETTING_`, `AZUREBLOBSTORAGE_`, `AZUREFILESSTORAGE_`, `AZURE_FUNCTION_`, `CONTAINER_`, `DIAGNOSTICS_`, `DOCKER_`, `FUNCTIONS_`, `IDENTITY_`, `MACHINEKEY_`, `MAINSITE_`, `MSDEPLOY_`, `SCMSITE_`, `SCM_`, `WEBSITES_`, `WEBSITE_`, `WEBSOCKET_`, `AzureWeb*`. **Los nombres de variables propias no pueden empezar así.**
- Free: 100 GB/mes de ancho de banda, **sin SLA**, 250 MB por entorno, 15.000 archivos, 2 dominios personalizados, 3 entornos de preview.
- `apiRuntime` soportado para Node: `node:20` y `node:22` (verificar en /static-web-apps/languages-runtimes antes de cambiar).
- `staticwebapp.config.json`: máximo 20 KB, y `globalHeaders` **no** afectan respuestas de `/api`.
- Las reglas de ruta de `/api` solo soportan redirects y roles.

## 2. Stack (innegociable)

| Capa | Tecnología |
|---|---|
| Frontend | Astro (salida estática) + Tailwind CSS |
| Interactividad | **Una sola isla React**: el cotizador (`client:load`). Ninguna otra página carga React |
| API | Azure Functions managed, Node.js 22 + TypeScript, modelo v4 |
| Validación | Zod, esquemas compartidos entre isla y API |
| Hosting | Azure Static Web Apps, plan Free |
| CI/CD | GitHub Actions generado por SWA |

Cualquier librería nueva requiere una línea de justificación en el PR.

## 3. Estructura de carpetas

```
ceygom-web/
├─ AGENT_HARNESS.md
├─ BACKLOG.md
├─ package.json                  # npm workspaces: apps/web, api, packages/shared
├─ tsconfig.base.json            # strict: true
├─ packages/
│  └─ shared/
│     └─ src/
│        ├─ quote.schema.ts      # Zod (fuente de verdad de tipos del cotizador)
│        ├─ product.schema.ts    # Zod del catálogo
│        └─ index.ts
├─ apps/
│  └─ web/                       # Astro
│     ├─ astro.config.mjs        # output: 'static'
│     ├─ public/
│     │  ├─ staticwebapp.config.json
│     │  ├─ fichas/              # PDFs con nombres normalizados (kebab-case)
│     │  └─ imagenes/
│     └─ src/
│        ├─ content/
│        │  ├─ config.ts         # content collections con Zod
│        │  ├─ productos/*.md
│        │  └─ proyectos/*.md
│        ├─ layouts/
│        ├─ components/          # .astro (sin JS)
│        ├─ islands/
│        │  └─ Cotizador/        # React, único directorio con .tsx
│        ├─ pages/
│        │  ├─ index.astro
│        │  ├─ empresa.astro
│        │  ├─ productos/index.astro
│        │  ├─ productos/[categoria]/[slug].astro
│        │  ├─ proyectos/index.astro
│        │  ├─ cotizador.astro
│        │  ├─ contacto.astro
│        │  └─ 404.astro
│        └─ lib/whatsapp.ts      # solo construye textos, sin secretos
└─ api/                          # Azure Functions managed
   ├─ host.json
   ├─ package.json               # "main": "dist/src/functions/*.js"
   ├─ local.settings.json        # NO se commitea (ver .gitignore)
   └─ src/
      ├─ functions/quote.ts      # app.http('quote', { route: 'quote', ... })
      └─ lib/
         ├─ env.ts               # lectura y validación de variables con Zod
         ├─ webhook.ts           # POST al destino de leads
         └─ whatsapp.ts          # arma el enlace wa.me
```

## 4. Convenciones de código

1. TypeScript `strict: true`; prohibido `any` (usar `unknown` + Zod).
2. **Zod es la fuente de verdad**: los tipos se derivan con `z.infer`, nunca se escriben a mano en paralelo.
3. Todo dato que cruza una frontera (formulario → API, API → webhook, variables de entorno, front-matter de contenido) se valida con Zod. Falla → respuesta 400 con códigos de error estables, nunca el stack.
4. Variables de entorno: solo a través de `api/src/lib/env.ts`. Se lee `process.env.X`; si falta una obligatoria, la función responde 500 con mensaje genérico y registra el nombre faltante (no el valor).
5. Cero secretos en el repositorio y cero en el bundle del frontend. Variables de Astro con prefijo `PUBLIC_` son públicas por definición.
6. Archivos `.astro` por defecto; `.tsx` solo dentro de `src/islands/`. Una regla de lint (`no-restricted-imports` sobre `react` fuera de `islands/`) lo hace cumplir.
7. Nombres: archivos en `kebab-case`, componentes en `PascalCase`, funciones en `camelCase`, rutas y slugs en español sin tildes.
8. Código y comentarios en inglés; textos de interfaz, contenido y errores visibles al usuario en español de Colombia.
9. Functions: un handler por archivo, delgado; la lógica en `lib/` con pruebas unitarias.
10. Pruebas: Vitest para `shared` y `api/lib`; Playwright para flujos HU-01 a HU-03.
11. Accesibilidad: WCAG 2.2 AA; el cotizador debe poder completarse solo con teclado.
12. Rendimiento: presupuesto por página de **≤ 100 KB de JS** (excepto `/cotizador`, ≤ 200 KB). Imágenes en AVIF/WebP con `width`/`height`.
13. Commits convencionales (`feat:`, `fix:`, `docs:`).

## 5. Variables de entorno (solo placeholders)

Se configuran en **Application settings** de la SWA (portal) y en `api/local.settings.json` en local.

| Variable | Uso | Obligatoria |
|---|---|---|
| `WHATSAPP_NUMBER` | Número de ventas en formato internacional, solo dígitos (ej. `57XXXXXXXXXX`) | Sí |
| `LEADS_WEBHOOK_URL` | URL del destino que recibe el JSON del lead (Apps Script, Make, Zapier u otro) | Sí |
| `LEADS_WEBHOOK_SECRET` | Secreto compartido enviado en el header `x-ceygom-signature` | Recomendada |
| `SALES_EMAIL` | Correo de ventas (para fase de correo transaccional) | No (fase 2) |
| `ALLOWED_ORIGIN` | Dominio de producción, para validar `Origin` | Sí |

## 6. Datos de negocio pendientes (NO inventar)

- Número real de WhatsApp Business y horario de atención.
- URL del webhook / hoja de Google Sheets y quién la administra.
- Catálogo definitivo de productos, variantes permitidas y límites de dimensiones.
- Lista de precios base (si no existe, el cotizador **no muestra precios**).
- Certificaciones (RETIE, NTC, ISO) y clientes autorizados a mostrarse.
- Texto legal de tratamiento de datos (Ley 1581 de 2012), revisado por un abogado.
- Propiedad del dominio y DNS actuales.

## 7. Reglas anti-alucinación

1. Antes de escribir config de Azure, consultar la página oficial correspondiente y citarla en el PR.
2. Si una propiedad no aparece en la documentación, no se usa.
3. Si un dato de negocio falta: placeholder con formato `process.env.NOMBRE` o `TODO(negocio): …`; nunca un valor plausible.
4. Todo hallazgo "no verificado" se marca así en el código y en el PR.
5. No se asume que `wa.me` tiene un límite de longitud documentado: el mensaje se mantiene corto (ver HU-03) y se prueba en dispositivos reales.

## 8. Definición de terminado (DoD)

- Criterios Gherkin de la historia automatizados y en verde.
- `tsc --noEmit`, lint y Vitest sin errores.
- Lighthouse móvil ≥ 90 en Rendimiento, Accesibilidad y SEO en páginas tocadas.
- `staticwebapp.config.json` ≤ 20 KB y validado en la vista previa de la SWA.
- Sin secretos en el diff.
