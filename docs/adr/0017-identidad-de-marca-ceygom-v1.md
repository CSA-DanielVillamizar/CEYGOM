# ADR-0017: Identidad de marca CEYGOM v1 aplicada al sitio

- **Estado:** Aceptada. Se publica con el logo A provisional; si el cliente elige el B se reemplazan los archivos del kit (ver `docs/marca.md`)
- **Fecha:** 2026-11-25
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-01, EP-05

## Contexto

El sitio usaba el recorte de baja resolución del logo "EMC" de la web de 2008, Trebuchet MS y una aproximación de colores. El equipo de marca entregó el Manual de Marca v1 y un kit con logos, colores y tipografías. El cliente aún elige entre el logo A (CEYGOM) y el B (EMC modernizado); todo lo demás es igual en ambos. La identidad se aplica sin tocar la funcionalidad (cotizador, correos, hoja de cálculo, RUT, PDF, modo sin conexión).

## Alternativas consideradas

1. **Cambiar los tokens del tema y las clases compartidas**, conservando los nombres de las clases (`brand-*`, `steel-*`), con fuentes alojadas en el sitio.
2. Renombrar todas las clases al vocabulario del manual (`grafito`, `lámina`, `rojo`). Más fiel al manual, pero un cambio enorme y sin valor visible.
3. Cargar las fuentes desde Google Fonts, como indica `tokens.css`. Más simple, pero rompe el modo sin conexión y envía la visita a un tercero.
4. Esperar la elección del logo para empezar. Bloquea lo que es igual en ambas opciones.

## Decisión

- **Tokens** en `src/styles/global.css`: los valores del manual en las variables del tema existente; un solo lugar de cambio.
- **Fuentes alojadas** (solo subconjunto latino): dos instancias estáticas de Archivo al ancho 118 entregadas por el equipo de marca (700 y 800, de 10 KB cada una, sin `font-stretch`), IBM Plex Sans 400 y 600 (paquete `@fontsource`) e IBM Plex Mono 400; menos de 100 KB en total. El build agrega fuentes, estilos y logos con hash a la lista de precarga del service worker, que sube de versión para que nadie conserve la marca vieja.
- **Forma:** `.chaflan` (recorte de 45° con `clip-path`, anillo de foco interior) en el botón primario; `.chaflan-borde` (dos capas, corte de 14 px, técnica del equipo de marca) en las tarjetas de línea para que el borde siga la diagonal; radio de 2 px en el resto. `.foto-tarjeta` pone la foto sobre tarjeta blanca plana. `.perforado` para secciones oscuras.
- **Celular:** menú con `<details>` (sin JavaScript) y barra inferior fija con Cotizar, WhatsApp y Llamar; el botón flotante queda en escritorio.
- **Inicio:** hero con grilla 2×2 de fotos iguales y la promesa "Lo ve en 3D antes de que lo fabriquemos." visible sin desplazarse; sección de fabricación a medida con "Enviar mi plano".
- **Textos:** trato de usted en el sitio, los mensajes de validación y los correos; teléfono (604) 444 6733; NIT 900.456.873-5.
- **Documentos:** PDF de la lista con la plantilla 07.2 (sin número de cotización, que nace al enviar) y correo de confirmación en texto y HTML, con todo lo del cliente escapado.
- **Logo A del kit** declarado en un solo lugar (`src/data/brand.ts` y `src/components/Logo.astro`): encabezado, pie, favicon, imagen para compartir, PDF y correo. El logo EMC y su script se eliminan. Si el cliente elige el B, se reemplazan esos archivos con los mismos nombres.
- No se publica RETIE ni ningún sello hasta tener el número de certificado, el organismo y los productos que cubre.

## Consecuencias

- Positivas: una sola fuente de verdad para la identidad; sin dependencias externas en tiempo de ejecución; el cambio de logo es acotado.
- Negativas: unos 100 KB de fuentes la primera vez (después, desde la caché); el fondo de remolinos de las fotos viejas sigue dentro de la foto hasta tener fotos reales.
- Pendiente: elección del logo, fotos reales, logo en alta resolución y la lista de preguntas de [preguntas-rebrand.md](../preguntas-rebrand.md).

## Verificación

Typecheck, 188 pruebas (incluye el correo HTML: usted, logo, escape de texto del cliente, sin datos fiscales; y el formato del NIT y del teléfono), build y presupuesto. Revisión visual en un ancho de celular de 375 px (inicio, producto, menú, lista) y generación real del PDF de la lista con Chrome. No se probó en un teléfono físico ni con lectores de pantalla.
