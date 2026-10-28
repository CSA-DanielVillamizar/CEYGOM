# ADR-0008: Configuración y secretos en Application settings

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-05, EP-06

## Contexto

Las funciones administradas no admiten identidad administrada ni referencias a Key Vault. Hay valores públicos (inyectados en el build del sitio) y valores secretos (solo del servidor).

## Alternativas consideradas

1. **Variables públicas del repositorio de GitHub para el build; Application settings de Static Web Apps para el servidor.**
2. Key Vault. No disponible para funciones administradas.
3. Valores en el repositorio. Descartado.

## Decisión

- Públicas (variables del repositorio, prefijo `PUBLIC_`): `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_SITE_URL`.
- Servidor (Application settings): `WHATSAPP_NUMBER` (obligatoria), `LEADS_WEBHOOK_URL`, `LEADS_WEBHOOK_SECRET`, `ALLOWED_ORIGIN`.
- Secreto de despliegue: `AZURE_STATIC_WEB_APPS_API_TOKEN` en los secretos del repositorio.
- Nunca usar los prefijos reservados (`WEBSITE_`, `FUNCTIONS_`, `AZURE_FUNCTION_`, entre otros) para variables propias.
- `api/local.settings.json` y `.env` están en `.gitignore`; solo se versionan los archivos `*.example`.

## Consecuencias

- Positivas: ningún secreto en el repositorio; configuración por entorno.
- Negativas: la rotación de secretos es manual.

## Verificación

`api/quote/env.ts` valida las variables al arrancar y registra solo los nombres que faltan, nunca valores.
