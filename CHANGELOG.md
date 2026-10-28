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

- Datos fiscales en el cotizador: tipo de persona (natural o jurídica), NIT con dígito de verificación o cédula, código CIIU y responsabilidades fiscales, con adjunto opcional del RUT (PDF, JPG o PNG, hasta 5 MB). La API valida el archivo y lo reenvía al webhook; el receptor de ejemplo lo guarda en Drive (ADR-0011, ADR-0012, HU-11).
- El campo opcional `company` del contacto pasa a `businessName`.
- Guía de instalación del receptor de Google Apps Script (`docs/integraciones/google-apps-script.md`) y documentación de `LEADS_WEBHOOK_URL` en el README. El receptor guarda el RUT en una subcarpeta de Drive por cotización y devuelve los errores en el cuerpo JSON.
- El webhook de leads solo se usa por HTTPS, un rechazo `{"ok":false}` del destino cuenta como no entregado, y los fallos quedan como advertencia en el registro con la referencia.
- Página `/privacidad/` con la política de tratamiento de datos personales (Ley 1581 de 2012), enlazada desde el cotizador y el pie de página.
- Documentación del webhook de leads y receptor de Google Apps Script para registrar solicitudes en una hoja de cálculo.

- Catálogo con 49 productos (ADR-0013): una página por producto con foto, referencias leídas de la ficha técnica, ficha en PDF y datos estructurados; mapa del sitio y `robots.txt` generados. Fotos que no son del producto exacto marcadas como "Imagen ilustrativa". Lista de datos pendientes por producto en `docs/catalogo/pendientes.md`.
- Control de presupuesto (`npm run budget`, en el CI) y documento de costos (`docs/finops.md`).
- Aviso por correo de cada cotización (propiedad `NOTIFY_EMAIL` del receptor), sin datos fiscales, y tope diario de archivos RUT guardados (`MAX_RUT_PER_DAY`). Con el tope alcanzado el lead se guarda sin archivo y el cliente ve el aviso de enviar el RUT por WhatsApp.
- `POST /api/quote` exige que `Origin` coincida con `ALLOWED_ORIGIN` cuando está configurado (antes aceptaba peticiones sin `Origin`).

- Identidad e inicio: logo de la empresa, favicon, imagen para compartir en todas las páginas, fotos de producto en el inicio y en las tarjetas de categoría, cifras calculadas desde los datos (369 referencias, 49 productos, 44 fichas), datos estructurados `LocalBusiness` y buscador en la portada. El botón de WhatsApp ya no tapa el pie de página (HU-14).
- Acuse de recibo por correo al cliente con su referencia y productos, sin datos fiscales ni enlace al RUT; con topes diarios, tope por dirección, reserva de cuota e interruptor (`CUSTOMER_ACK`). La política de datos declara la finalidad y la pantalla de éxito lo anuncia (HU-15, ADR-0015). Pruebas del receptor en `api/quote/apps-script.test.ts`.
- Fichas de producto: botón "Consultar disponibilidad por WhatsApp" del producto y de cada referencia (con el código ya escrito y sin datos personales), botón "Copiar" de la referencia, columna de código fija en las tablas al desplazarlas en el móvil y controles de 44 px. "Mi cotización" se puede guardar como PDF desde el diálogo de impresión, con el membrete de la empresa y sin precios ni datos personales (sin librerías nuevas).
- Datos técnicos leídos de las fichas: material, acabado (galvanizado o pintura electrostática en polvo) y tabla de colores en 43 de 44 productos, y medidas por referencia (altura, ancho, longitud, calibre, capacidad) en 9 productos y 88 referencias, solo donde la tabla del PDF se lee con certeza. La ficha del producto los muestra y el catálogo se puede filtrar por acabado. El resto queda como pendiente en `docs/catalogo/pendientes.md`.
- Anexo técnico en el PDF de "Mi cotización": material, acabado, colores, ficha y medidas de cada producto y referencia pedida, tomados de las fichas. Modo sin conexión: lo ya visitado (páginas, fichas PDF, la lista) sigue disponible sin internet, con página `/sin-conexion/` y aviso al perder la señal (ADR-0016).
- Buscador y filtros del catálogo por código de referencia, nombre y categoría, con índice estático que solo se descarga al buscar (HU-13, ADR-0014).
- Lista de cotización ("Mi cotización"): agregar productos y referencias específicas con cantidad desde el catálogo y continuar al cotizador con todo precargado. Campo opcional `reference` por ítem en la solicitud, el webhook, WhatsApp y el aviso por correo (HU-12, ADR-0014).
- El control de presupuesto del CI ahora también limita el JavaScript del inicio, del catálogo y de la lista, y el tamaño del índice del buscador.

- Razón social (Electro Metálicas Ceygom S.A.S.) y NIT (900456873-5) en la política de datos, el pie de página y los datos estructurados del inicio, con una prueba que valida el dígito de verificación.

### Desplegado

- Receptor de Google Apps Script en la cuenta de la empresa y `LEADS_WEBHOOK_URL` configurada en producción. Verificado con un PDF de 5 MB: fila completa en la hoja y archivo en su subcarpeta de Drive.
- Primer despliegue a producción en Azure Static Web Apps (plan Free, Central US). Verificadas las páginas, las redirecciones, el 404, las cabeceras y el endpoint `POST /api/quote`.

### Corregido

- El registro de un fallo del webhook ya no depende del tipo del error lanzado; la respuesta con la referencia y el enlace de WhatsApp se mantiene.
- Etiquetas de acabado del cotizador con mayúscula y tilde.
