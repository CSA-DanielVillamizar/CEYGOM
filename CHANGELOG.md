# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). El proyecto aún no tiene versiones publicadas.

## [Sin publicar]

### Añadido

- Sitio estático con Astro y Tailwind: inicio, productos, cotizador, empresa, contacto y 404.
- Cotizador multipasos (isla React) con varios productos, resumen en JSON y precarga por producto.
- Función `POST /api/quote` con validación Zod, referencia de cotización, webhook firmado opcional y enlace de WhatsApp.
- Configuración de Static Web Apps: redirecciones 301 de URLs heredadas, 404 real y cabeceras de seguridad.
- Flujo de GitHub Actions para pruebas y despliegue.
- Documentación: ADR, épicas, historias de usuario, guía de contribución y plantillas de PR e issues.

### Desplegado

- Primer despliegue a producción en Azure Static Web Apps (plan Free, Central US). Verificadas las páginas, las redirecciones, el 404, las cabeceras y el endpoint `POST /api/quote`.

### Corregido

- Etiquetas de acabado del cotizador con mayúscula y tilde.
