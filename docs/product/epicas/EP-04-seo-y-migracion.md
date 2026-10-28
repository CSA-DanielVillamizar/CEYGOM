# EP-04: SEO y migración sin pérdida de posicionamiento

- **Estado:** En curso
- **Prioridad:** Alta
- **Historias:** [HU-04](../historias/HU-04-redirecciones-y-404.md) (hecha), [HU-09](../historias/HU-09-medicion-de-conversion.md) (pendiente)

## Objetivo

Migrar al nuevo sitio conservando la señal de las URLs actuales y dejando una base técnica de SEO medible.

## Alcance

- Redirecciones 301 de las URLs `.html` heredadas y 404 real.
- Títulos como texto (no imágenes), metadatos, URL canónica y `robots.txt`.
- Mapa del sitio y datos estructurados (se completan junto con HU-07).
- Medición de conversiones (HU-09).

## Decisiones relacionadas

ADR-0007.

## Riesgos

El dominio y el alojamiento actuales los administra un tercero (Drivemarketing); el cambio de DNS requiere coordinación y una ventana de corte.

## Indicadores de éxito

- Cero errores 404 inesperados tras el corte (Search Console).
- Páginas indexadas y consultas orgánicas respecto a la línea base previa a la migración.
