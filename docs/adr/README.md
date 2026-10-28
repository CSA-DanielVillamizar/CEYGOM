# Registros de decisiones de arquitectura (ADR)

Cada decisión técnica relevante se documenta en un archivo numerado, con el formato de [`0000-plantilla.md`](0000-plantilla.md) (variante breve de MADR). Los ADR son inmutables: si una decisión cambia, se crea un ADR nuevo que reemplaza al anterior y se actualiza el campo `Estado` de ambos.

Estados posibles: `Propuesta`, `Aceptada`, `Aceptada con revisión pendiente`, `Reemplazada por ADR-XXXX`, `Rechazada`.

| ADR | Decisión | Estado |
|---|---|---|
| [0001](0001-sitio-estatico-astro-con-isla-react.md) | Sitio estático con Astro y una sola isla React | Aceptada |
| [0002](0002-hosting-static-web-apps-free-funciones-administradas.md) | Static Web Apps (plan Free) con funciones administradas | Aceptada |
| [0003](0003-azure-functions-node-modelo-v4-esbuild.md) | Azure Functions en Node 22, modelo v4, empaquetado con esbuild | Aceptada |
| [0004](0004-esquema-zod-compartido.md) | Esquema Zod compartido como fuente única del contrato | Aceptada |
| [0005](0005-leads-por-webhook-firmado-opcional.md) | Captura de leads por webhook firmado y opcional | Aceptada |
| [0006](0006-enlace-whatsapp-generado-en-servidor.md) | Enlace de WhatsApp generado en el servidor, sin datos personales | Aceptada |
| [0007](0007-enrutamiento-404-real-y-redirecciones-301.md) | 404 real y redirecciones 301 de URLs heredadas | Aceptada |
| [0008](0008-configuracion-y-secretos.md) | Configuración y secretos en Application settings | Aceptada |
| [0009](0009-cotizador-sin-precios-y-proteccion-de-datos.md) | Cotizador sin precios y tratamiento mínimo de datos personales | Aceptada |
| [0010](0010-csp-con-unsafe-inline-temporal.md) | Content-Security-Policy con `unsafe-inline` temporal | Aceptada con revisión pendiente |
| [0011](0011-identificacion-tributaria-obligatoria-en-el-cotizador.md) | NIT o cédula (RUT) obligatorio en el cotizador | Aceptada; ampliada por ADR-0012 |
| [0012](0012-datos-fiscales-y-adjunto-del-rut.md) | Datos fiscales del RUT y adjunto opcional del documento | Aceptada |
| [0013](0013-catalogo-generado-desde-manifiesto.md) | Catálogo generado desde un manifiesto, con fichas y fotos optimizadas | Aceptada |
| [0014](0014-lista-de-cotizacion-y-buscador-en-el-navegador.md) | Lista de cotización y buscador del catálogo en el navegador, sin servidor | Aceptada |
| [0015](0015-acuse-de-recibo-al-cliente-por-correo.md) | Acuse de recibo por correo al cliente, enviado desde el receptor | Aceptada |
| [0016](0016-anexo-tecnico-impreso-y-modo-sin-conexion.md) | Anexo técnico en la lista impresa y modo sin conexión | Aceptada |

Para proponer una decisión nueva, abre un issue con la plantilla "Propuesta de ADR" y luego un PR que añada el archivo.
