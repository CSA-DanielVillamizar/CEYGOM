# ADR-0001: Sitio estático con Astro y una sola isla React

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-01, EP-02, EP-04

## Contexto

El sitio actual es HTML plano con títulos publicados como imágenes PNG, lo que los hace invisibles para buscadores y lectores de pantalla. El contenido cambia poco y el único componente interactivo necesario es el cotizador. El objetivo prioritario es posicionamiento orgánico y rendimiento en móvil.

## Alternativas consideradas

1. **Astro (salida estática) con una isla React solo para el cotizador.** HTML puro en todas las páginas, JavaScript únicamente donde hay interacción.
2. Next.js con exportación estática. Más capacidad de la necesaria y más JavaScript por página.
3. Mantener HTML plano y añadir scripts. Sin componentes ni validación compartida; alto costo de mantenimiento.

## Decisión

Astro 5 con `output: "static"`, `trailingSlash: "always"` y Tailwind CSS 4. React 19 se usa en un único componente (`QuoteWizard`), hidratado con `client:load` en `/cotizador/`. Las demás páginas no envían JavaScript de framework.

## Consecuencias

- Positivas: HTML indexable, tiempos de carga bajos, despliegue como archivos estáticos.
- Negativas: el contenido se edita en archivos del repositorio, no en un panel; el catálogo con fichas requerirá colecciones de contenido (HU-07).
- Revisar si aparecen más de dos componentes interactivos: evaluar entonces más islas o un enfoque distinto.

## Verificación

`npm run build` genera las páginas estáticas; el JavaScript del cotizador queda por debajo del presupuesto de 200 KB (medido en torno a 95 KB comprimidos).
