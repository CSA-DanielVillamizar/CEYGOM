# Guía para contribuir

## Flujo de trabajo

1. Toda tarea parte de una historia (HU) o de un issue. Revisa [`docs/product`](docs/product/README.md).
2. Crea una rama corta desde `main`: `feat/<tema>`, `fix/<tema>`, `docs/<tema>`, `chore/<tema>`.
3. Haz commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`. Una línea de resumen en imperativo y, si hace falta, un cuerpo que explique el porqué.
4. Abre un PR hacia `main` con la plantilla. El PR debe enlazar la HU y los ADR relacionados.
5. El PR requiere CI en verde y una aprobación. Se fusiona con "squash and merge".
6. No se hace `push` directo a `main` ni `force push` sobre ramas compartidas.

## Entorno local

Requisitos: Node 22, npm y [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local).

```bash
npm install && npm install --prefix api
npm run typecheck && npm test
npm run build && npm run api:build
```

La forma de ejecutar el sitio con la API en local está en el [README](README.md).

## Calidad

- El contrato de datos vive en `packages/shared`. Los tipos se derivan de los esquemas Zod; no se redefinen a mano.
- Toda regla nueva de validación lleva su prueba en `packages/shared` o `api/quote`.
- No se registran datos personales (nombre, correo, celular) en logs, errores ni eventos de medición.
- No se versionan secretos ni valores reales de configuración. Solo archivos `*.example`.
- No se inventan datos de negocio (precios, certificaciones, especificaciones, cifras de clientes). Si falta información, se marca `TODO(negocio)` y se registra en la HU.

## Decisiones de arquitectura

Una decisión que afecte la estructura, el hosting, la seguridad o el contrato de datos se propone con un ADR (ver [`docs/adr`](docs/adr/README.md)) en el mismo PR que la implementa.

## Estilo de documentación

Redacción técnica, profesional e institucional, en español. Sin firmas, marcas de agua ni avisos adicionales en documentos, código, commits o PR.
