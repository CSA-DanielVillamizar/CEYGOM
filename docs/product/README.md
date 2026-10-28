# Backlog de producto

Estructura: **épicas** (objetivos de negocio) contienen **historias de usuario** (HU) con criterios de aceptación en Gherkin. Las decisiones técnicas están en [`../adr`](../adr/README.md).

## Mapa de épicas e historias

| Épica | Historia | Estado | Prioridad |
|---|---|---|---|
| [EP-01 Catálogo](epicas/EP-01-catalogo.md) | [HU-01 Catálogo por categorías](historias/HU-01-catalogo-por-categorias.md) | Hecha | Alta |
| | [HU-07 Páginas de producto con ficha](historias/HU-07-paginas-de-producto-con-ficha.md) | Pendiente | Media |
| [EP-02 Cotizador](epicas/EP-02-cotizador.md) | [HU-02 Cotizador multipasos](historias/HU-02-cotizador-multipasos.md) | Hecha | Alta |
| [EP-03 Leads y WhatsApp](epicas/EP-03-leads-y-whatsapp.md) | [HU-03 API de cotización](historias/HU-03-api-de-cotizacion.md) | Hecha | Alta |
| | [HU-08 Contacto por WhatsApp](historias/HU-08-contacto-directo-por-whatsapp.md) | Hecha | Media |
| [EP-04 SEO y migración](epicas/EP-04-seo-y-migracion.md) | [HU-04 Redirecciones y 404](historias/HU-04-redirecciones-y-404.md) | Hecha | Alta |
| | [HU-09 Medición de conversión](historias/HU-09-medicion-de-conversion.md) | Pendiente | Media |
| [EP-05 Plataforma y calidad](epicas/EP-05-plataforma-y-calidad.md) | [HU-05 Despliegue continuo](historias/HU-05-despliegue-continuo.md) | Pendiente | Alta |
| | [HU-10 Endurecimiento de seguridad](historias/HU-10-endurecimiento-de-seguridad.md) | Pendiente | Baja |
| [EP-06 Cumplimiento](epicas/EP-06-cumplimiento-y-datos-personales.md) | [HU-06 Consentimiento y Habeas Data](historias/HU-06-consentimiento-habeas-data.md) | Parcial | Alta |

"Hecha" significa implementada y verificada en local; no implica despliegue en producción.

## Orden sugerido de ejecución

1. HU-05 (recurso de Azure, secretos y primer despliegue) para validar la plataforma.
2. HU-06 (texto de la política de datos) antes de publicar el cotizador al público.
3. HU-07 y HU-01 con el contenido real del catálogo.
4. HU-09 y HU-10 después de la salida.

## Definición de preparada (Definition of Ready)

- Tiene épica, rol, necesidad y valor en la frase "Como… quiero… para…".
- Criterios de aceptación en Gherkin, verificables.
- Dependencias de negocio identificadas (datos, accesos, aprobaciones).
- Decisión técnica relevante registrada o referenciada en un ADR.

## Definición de terminada (Definition of Done)

- Criterios de aceptación cubiertos por pruebas automáticas o evidencia manual anotada en el PR.
- `npm run typecheck`, `npm test`, `npm run build` y `npm run api:build` en verde.
- Sin secretos ni datos personales en el código, los registros o la documentación.
- Accesibilidad básica revisada (teclado, foco, etiquetas) en los cambios de interfaz.
- Documentación actualizada: README, ADR y estado de la historia.
- Revisada y aprobada mediante PR.
