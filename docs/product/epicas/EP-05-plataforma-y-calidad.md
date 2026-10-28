# EP-05: Plataforma, entrega continua y calidad

- **Estado:** En curso
- **Prioridad:** Media
- **Historias:** [HU-05](../historias/HU-05-despliegue-continuo.md) (pendiente), [HU-10](../historias/HU-10-endurecimiento-de-seguridad.md) (pendiente)

## Objetivo

Entregar cambios de forma segura y repetible: pruebas automáticas, revisión por PR, entornos de vista previa y cabeceras de seguridad.

## Alcance

- Flujo de GitHub Actions: pruebas, tipos y build antes del despliegue; entorno de vista previa por PR.
- Convenciones de contribución, plantillas de PR e issues, ADR.
- Endurecimiento de la política CSP y protección anti-spam adicional (fase 2).

## Decisiones relacionadas

ADR-0002, ADR-0003, ADR-0008, ADR-0010.

## Indicadores de éxito

- El 100 % de los cambios a `main` pasa por PR con CI en verde.
- Tiempo desde el merge hasta producción.
