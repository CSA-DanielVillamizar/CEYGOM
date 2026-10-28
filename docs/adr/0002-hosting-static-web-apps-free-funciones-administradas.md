# ADR-0002: Static Web Apps (plan Free) con funciones administradas

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-03, EP-05

## Contexto

Se requiere alojar el sitio estático y un endpoint HTTP para el cotizador con costo mínimo. El plan Free de Azure Static Web Apps solo admite funciones administradas (HTTP, prefijo `/api`); traer una Function App propia exige el plan Standard.

## Alternativas consideradas

1. **Static Web Apps Free con funciones administradas.** Costo cero; limitada a triggers HTTP, 45 s por ejecución, sin identidad administrada ni Key Vault, sin SLA, 250 MB por entorno.
2. Static Web Apps Standard con Function App propia. Permite más triggers y enlace a Key Vault; costo mensual.
3. Azure App Service. Más operación y costo para un sitio estático.

## Decisión

Usar Static Web Apps Free con funciones administradas (`api_location: api`, `apiRuntime: node:22`). Un único endpoint, `POST /api/quote`.

## Consecuencias

- Positivas: sin costo fijo, despliegue integrado desde GitHub Actions, entornos de vista previa por PR.
- Negativas: sin SLA; sin colas ni temporizadores; secretos solo como Application settings (ver ADR-0008).
- Revisar si el cotizador se vuelve crítico para ventas o se necesitan triggers distintos de HTTP: pasar a Standard con Function App en Flex Consumption.

## Verificación

El workflow de despliegue usa `api_location: api`; `public/staticwebapp.config.json` declara `platform.apiRuntime: "node:22"`.
