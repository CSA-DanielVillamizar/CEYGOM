# ADR-0010: Content-Security-Policy con `unsafe-inline` temporal

- **Estado:** Aceptada con revisión pendiente
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-05

## Contexto

Astro inyecta scripts y estilos en línea para hidratar islas y aplicar estilos del componente. Una política CSP sin `unsafe-inline` los bloquearía. Las cabeceras globales de Static Web Apps no se aplican a las respuestas de `/api`.

## Alternativas consideradas

1. **CSP con `'unsafe-inline'` en `script-src` y `style-src`** como punto de partida.
2. CSP con hashes o nonces. Más segura; requiere un paso de build que calcule hashes.
3. Sin CSP. Descartado.

## Decisión

Aplicar una CSP restrictiva en el resto de directivas, con `'unsafe-inline'` temporal, junto con `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` y HSTS.

## Consecuencias

- Deuda técnica registrada: sustituir `'unsafe-inline'` por hashes (HU de endurecimiento futura).
- Al activar GA4, GTM o Turnstile habrá que ampliar `script-src`, `connect-src` y `frame-src`.

## Verificación

Revisar las cabeceras en el entorno desplegado y con una auditoría de seguridad antes de la salida a producción.
