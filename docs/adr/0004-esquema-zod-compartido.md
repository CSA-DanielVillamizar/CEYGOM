# ADR-0004: Esquema Zod compartido como fuente única del contrato

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-02, EP-03

## Contexto

El formulario del cotizador y el endpoint validan los mismos datos. Mantener dos definiciones provoca divergencias y errores de contrato.

## Alternativas consideradas

1. **Esquemas Zod en `packages/shared`, importados por el sitio y empaquetados en la API.** Los tipos se derivan con `z.infer`.
2. Validación manual en cada lado. Duplicada y propensa a errores.
3. JSON Schema con generación de tipos. Más herramientas para un contrato pequeño.

## Decisión

`packages/shared/quote.schema.ts` es la única definición del contrato (`QuoteRequestSchema`, `QuoteResponseSchema`, `LeadRecordSchema`). Zod 3.25.x. El cliente y el servidor validan con el mismo esquema; el servidor es la autoridad.

## Consecuencias

- Positivas: un solo lugar para cambiar reglas; mensajes de error en español coherentes.
- Negativas: un cambio de versión mayor de Zod exige revisar la sintaxis de mensajes personalizados (`errorMap`, `invalid_type_error`).

## Verificación

`packages/shared/quote.test.ts` y `api/quote/handler.test.ts` ejecutan el esquema; `npm run typecheck` compila ambos lados contra los mismos tipos.
