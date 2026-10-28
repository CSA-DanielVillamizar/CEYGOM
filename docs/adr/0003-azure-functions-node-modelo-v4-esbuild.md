# ADR-0003: Azure Functions en Node 22, modelo v4, empaquetado con esbuild

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-03, EP-05

## Contexto

La API comparte código (esquema Zod, generador de enlace de WhatsApp) con el sitio. Las funciones administradas de Static Web Apps no resuelven dependencias de workspaces del monorepo en el momento del despliegue. Para Node.js el modelo de programación vigente es el v4 (`@azure/functions` 4.x, `app.http()`); el término "isolated worker" corresponde a .NET.

## Alternativas consideradas

1. **Modelo v4 con un paquete único generado por esbuild** (`api/dist/quote/index.js`), con `@azure/functions` como dependencia externa y el resto incluido en el paquete.
2. Workspaces de npm con paquete `shared` publicado. Riesgo de que el despliegue no lo resuelva.
3. Copiar manualmente el código compartido a `api/`. Duplicación y divergencia.

## Decisión

Funciones en TypeScript, Node 22, modelo v4. `api/build.mjs` empaqueta con esbuild (formato cjs, target node22) incluyendo `packages/shared` y `zod`. `api/package.json` apunta `main` a `dist/quote/index.js`.

## Consecuencias

- Positivas: un solo artefacto, sin depender de workspaces, arranque rápido.
- Negativas: hay un paso de build adicional que debe ejecutarse antes del despliegue.
- Comprobado en el primer despliegue (2026-10-28): Oryx construye `api/` con el paso de esbuild y la función `quote` queda activa en Static Web Apps.

## Verificación

`npm run api:build` genera el paquete; `func start` registra la función `quote` con ruta `api/quote [POST]`; las pruebas de `api/quote/handler.test.ts` cubren el handler.
