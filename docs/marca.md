# Marca: identidad CEYGOM v1 aplicada al sitio

La identidad sale del kit `CEYGOM-rebrand` (Manual de Marca v1, `visual-identity/tokens.json`). Decisión: [ADR-0017](adr/0017-identidad-de-marca-ceygom-v1.md).

## Qué hay y de dónde sale

| Pieza | Archivo | Origen |
|---|---|---|
| Logo del encabezado y del pie (fondo grafito) | `src/assets/brand/ceygom-horizontal-negativo.svg` | Kit de marca, ya convertido a curvas |
| Logo sobre fondo claro (PDF de la lista) | `src/assets/brand/ceygom-horizontal.svg` | Kit de marca |
| Logo PNG para el correo y los datos estructurados | `public/brand/ceygom-horizontal.png` | Kit de marca (`logo/png`) |
| Favicon | `public/favicon.svg` | Kit de marca |
| Ícono de iPhone y iPad | `public/apple-touch-icon.png` | Generado del favicon |
| Imagen para compartir (1200×630) | `src/assets/brand/og-default.jpg` | Generada con `node scripts/brand/make-brand-assets.mjs` |
| Colores, tipografías, forma | `src/styles/global.css` | Manual, secciones 03 a 05 |

## Sistema aplicado

- **Colores:** rojo Ceygom `#C8202A` (acciones, máximo ~10 % de la pantalla), grafito `#16191D`, acero `#2B3138`, lámina `#5B636D`, galvanizado `#9AA1AA`, RAL 7035 `#D7D9D6` y blanco lámina `#F4F5F3`. Rojo claro `#FF4A4F` solo sobre grafito. El ámbar está definido pero no se usa: es solo para advertencias de seguridad. Los nombres de las clases (`brand-*`, `steel-*`) se conservaron: los valores cambian en un solo lugar.
- **Tipografía:** Archivo expandida (titulares y cifras), IBM Plex Sans (texto) e IBM Plex Mono (códigos, medidas, NIT). Alojadas en el sitio, solo el subconjunto latino (192 KB en total), sin Google Fonts: funcionan sin conexión porque el service worker guarda `/_astro/*` al usarlas.
- **Forma:** chaflán de 45° en el botón primario y en las tarjetas de línea (`.chaflan`); radio de 2 px en el resto. El anillo de foco se dibuja dentro del chaflán porque `clip-path` recorta lo de afuera. Altura mínima de botones: 44 px (52 px en el inicio).
- **Fotos:** sobre gris RAL 7035 plano (`.foto-ral`, el blanco de la foto toma el gris). Mientras no haya fotos reales, el fondo de remolinos de las fotos viejas se ve a través del gris.
- **Celular:** menú en una línea y barra inferior fija con Cotizar, WhatsApp y Llamar; el botón flotante de WhatsApp queda solo en escritorio.
- **Textos:** trato de usted en el sitio, los correos y los mensajes de validación. Teléfono (604) 444 6733 (`tel:+576044446733`) y NIT 900.456.873-5.

## Documentos que genera el sitio

- **PDF de "Mi cotización":** logo a la izquierda, rótulo y fecha en mono rojo a la derecha, tabla con códigos en mono, anexo técnico y pie con línea roja de 3 px, NIT y teléfono. No lleva número de cotización porque la lista aún no se ha enviado (la referencia nace al enviar).
- **Correo de confirmación:** texto y HTML (logo de 150 px desde `SITE_URL`, línea roja de 2 px, Arial), con todo lo que escribe el cliente escapado. Requiere volver a implementar el receptor de Apps Script ([guía](integraciones/google-apps-script.md)).

## Pendiente

- **Elección del logo A (CEYGOM) o B (EMC modernizado):** el sitio usa el A, que es el del kit; si el cliente elige el B se cambian los tres SVG y el favicon.
- **Fotos reales** y **logo en alta resolución** de la empresa para la imagen para compartir.
- **Imagen para compartir:** el titular va en Arial (la máquina de compilación no tiene Archivo); conviene una pieza diseñada.
- **Certificación RETIE 2024:** no se publica hasta tener el número de certificado, el organismo y los productos que cubre.
- Preguntas abiertas al equipo de marca: ver [preguntas-rebrand.md](preguntas-rebrand.md).
