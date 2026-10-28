# Informe técnico-ejecutivo: Rearquitectura digital de Electro Metálicas Ceygom

Fecha: 2026-10-27 · Sitio auditado: https://electrometalicasceygom.com (6 páginas: inicio, empresa, productos, desarrollos, ubicación, contacto)

**Alcance y límites de la auditoría.** Se revisó el HTML y el contenido de las 6 páginas. No se midieron Lighthouse/Core Web Vitals, cabeceras de seguridad ni tráfico real (no hay acceso a Analytics ni Search Console). Donde digo "probable" es inferencia, no medición. El formulario de contacto se carga en un iframe que el rastreo no pudo leer; no sé qué servicio usa ni a dónde envía.

---

## FASE 1 — Diagnóstico

### 1. Auditoría técnica (Arquitecto)

| Hallazgo | Evidencia | Severidad |
|---|---|---|
| Animación principal en **Flash** (`movie.swf`, `<object classid=clsid:D27CDB6E…>`) | Todas las páginas internas | Crítica: Flash está muerto desde 2020; ningún navegador lo ejecuta. Hay un hueco de 980×238 px vacío bajo el menú |
| Maquetación con **tablas anidadas** y ancho fijo 980 px | `<table width="980">` en todo el sitio | Alta: no es responsivo, inutilizable en móvil |
| **Sin `<meta viewport>`**, sin `lang`, sin meta description | `<head>` solo tiene charset y title | Alta (SEO + móvil) |
| **Mismo `<title>` en las 6 páginas**: "Electro Metálicas Ceygom" | Todas | Alta: Google no distingue páginas ni palabras clave |
| **Títulos y encabezados como imágenes PNG** (`titulo_objetivos.png`, `titulo_productos.png`…) | Todas | Alta: invisible para buscadores, lectores de pantalla |
| Ningún `<h1>`/`<h2>`; estilos `.style1…style8` (generados por Dreamweaver) | CSS inline | Media: deuda técnica y sin semántica |
| Productos = 19 fotos sin nombre, sin `alt`, sin descripción | `productos.html` | Alta: el catálogo no se puede buscar ni indexar |
| Fichas técnicas: ~46 PDFs en `/Fichas tecnicas/` | Enlaces `.pdf` | Media: contenido valioso, pero aislado; nombres de archivo con espacios y errores ("VERTCAL") |
| Enlace roto/erróneo: "Multitomas 19” 5 Salidas dbls" apunta al PDF de "Curva Vertical Interior Ductos" | Sección Comunicaciones | Media |
| Mapa con enlace al antiguo Google My Maps (`maps/ms?msid=…`) | `ubicacion.html` | Media: formato en desuso, probable que ya no cargue |
| Sin sitemap.xml, schema.org, Open Graph ni analítica detectables | HTML | Alta |
| Enlaces `:visited` gris `#CCC` sobre fondo claro; contraste bajo | CSS | Media (accesibilidad) |
| Crédito "Sitio desarrollado por Drivemarketing" | Pie | Informativo: confirmar quién tiene el hosting, dominio y los fuentes antes de migrar |

**Veredicto:** el sitio es de ~2008–2012. No conviene parchearlo; la reconstrucción es más barata que remediar.

### 2. Auditoría UX/UI y conversión (CRO)

- **Propuesta de valor débil.** El home dice "más que productos… excelente servicio y calidad". No dice qué se fabrica en el titular, para quién, en qué tiempos ni con qué certificaciones. El diferencial real (fabricación a medida + departamento de ingeniería + modelado 3D en Solid Edge) está enterrado en párrafos.
- **Sin CTA.** Cero botones de "Cotizar", "Hablar con un asesor" o "Descargar catálogo". El único camino de conversión es la página Contacto, con un formulario en iframe.
- **Catálogo sin fricción reducida:** el usuario ve fotos sin nombre, no puede filtrar, comparar ni pedir precio de un ítem. Las fichas están en una lista plana de 46 enlaces.
- **Ausencia de prueba social:** ni clientes, ni logos, ni obras, ni testimonios, ni certificaciones. En B2B industrial/eléctrico esto es lo que más pesa en la decisión.
- **Móvil:** un ingeniero residente en obra o un compras revisando desde el celular no podrá usar el sitio.
- **Contenido de "Empresa"** es genérico (objetivos, misión, visión). Faltan: años de trayectoria, capacidad de planta, maquinaria, procesos (corte láser, plegado, soldadura, pintura electrostática), normas.
- **Desarrollos** es lo más fuerte (renders 3D y trabajos a medida), pero está subordinado y sin contexto de cliente/resultado.

### 3. Auditoría comercial y marketing (Growth)

**Puntos de contacto actuales:** PBX fijo (574) 4446733, dirección física (Calle 28 nro 57-13, Unidad Industrial de Belén, Medellín), un formulario no verificado.

**Puntos faltantes:** WhatsApp, correo comercial visible, cotizador, descarga de catálogo con captura de datos, perfil de Google Business, LinkedIn, canal de seguimiento de leads, analítica y píxeles de remarketing.

**Oportunidad de mercado.** El sitio cubre una intención de compra muy específica y rentable: *gabinetes eléctricos, celdas, gabinetes de contadores, racks, bandejas portacables, canaletas, soportes*. Quienes buscan esto son constructoras, ingenieros eléctricos, integradores de cableado estructurado, hospitales y distribuidores. Hoy el sitio **no puede capturar ninguna de esas búsquedas**, porque el texto está en imágenes y no hay una página por producto.

**Hipótesis a validar con el socio (no puedo confirmarlas desde el sitio):** de dónde llegan hoy los clientes (referidos/distribuidores/llamadas), cuántas cotizaciones al mes se manejan, ticket promedio, tiempo de respuesta, y qué certificaciones tienen (RETIE, NTC, ISO 9001). Si las tienen, deben ser protagonistas.

---

## FASE 2 — Rearquitectura propuesta

### 2.1 Stack tecnológico

| Capa | Recomendación | Por qué |
|---|---|---|
| Frontend | **Astro** + Tailwind CSS; islas React solo para cotizador y filtros | Sitio mayormente de contenido: HTML estático, ~0 JS por defecto, mejor Core Web Vitals y SEO que Next.js para este caso. Next.js solo si luego se quiere portal de clientes con login |
| CMS | **Sanity** (o Keystatic/Decap si se prefiere basado en Git, sin costo) | Que el equipo suba productos, fichas y proyectos sin programador |
| Hosting/CDN | **Cloudflare Pages** (o Vercel) | Gratis o muy bajo costo, CDN global, SSL, previews por rama |
| Backend ligero | **Cloudflare Workers / funciones serverless** | Recibe cotizaciones, valida, enruta a Sheets/CRM/correo/WhatsApp sin servidor propio |
| Anti-spam | Cloudflare Turnstile | Sin CAPTCHA molesto |
| Correo transaccional | Resend o Brevo | Envío del resumen al área de ventas y confirmación al cliente |
| Analítica | GTM + GA4 + Search Console + Microsoft Clarity; píxel Meta/LinkedIn (consent mode) | Medir el embudo y habilitar remarketing |
| Archivos | PDFs de fichas en almacenamiento del CMS/R2 con nombres limpios y URL estables | Redirecciones 301 desde las URLs viejas para no perder posicionamiento |

### 2.2 Funcionalidades de negocio

**A. Cotizador interactivo (módulo estrella)**

Principio de honestidad comercial: en fabricación a medida, un precio automático exacto suele ser arriesgado. Se recomienda un modelo en **dos modos**:

1. **Productos estándar** (racks, bandejas, canaletas, multitomas, patch panels): configurador con opciones cerradas (tipo, dimensiones/UR, calibre, acabado, cantidad) que muestra un **rango orientativo** si la empresa entrega una lista de precios base; si no, muestra solo la "solicitud de cotización" con el resumen.
2. **A medida** (gabinetes, celdas, desarrollos): asistente de 4 pasos: *qué necesitas → medidas y uso → plano/foto/ficha adjunta → datos de contacto y plazo*. No calcula precio; clasifica y prioriza el lead.

Flujo del asistente (máx. 4 pantallas, guarda progreso):
1. Categoría y producto (con imágenes) → 2. Especificaciones (dimensiones, material, calibre, acabado, normas, ambiente interior/exterior) → 3. Cantidad, ciudad, fecha requerida, adjuntos (PDF/DWG/foto) → 4. Nombre, empresa, NIT (opcional), correo, celular, consentimiento.

Salida: resumen dinámico con número de solicitud (`COT-2026-0001`), enviado a (a) correo de ventas, (b) fila en Google Sheets/CRM, (c) botón "Enviar por WhatsApp" que abre `wa.me/57XXXXXXXXXX?text=…` con el resumen codificado, y (d) copia al cliente con PDF del resumen.

**Dato necesario del negocio:** tabla de precios/costos base (por kg de lámina, por proceso, por acabado) si se quiere mostrar rangos. Sin ella, se entrega el modo "solicitud".

**B. WhatsApp**
- Fase 1 (sin costo de API): botón flotante con `wa.me` y mensaje contextual por página, ej.: *"Hola, me interesa cotizar: Rack cerrado abatible 42U. Vi la ficha en su web."* La plantilla se arma desde el nombre del producto en el CMS.
- Fase 2 (opcional): WhatsApp Business Platform/Cloud API para notificaciones automáticas y asignación entre asesores. Requiere verificación de Meta y tiene costo por conversación; justificar con volumen real.
- Horario: mostrar "Atendemos L–V 7:30–17:30" y alternativa fuera de horario.

**C. Catálogo industrial**
- Estructura: Categoría → Producto → Variantes (tabla técnica) → Ficha PDF → "Cotizar este producto" + WhatsApp contextual.
- Categorías a partir de las fichas actuales: Bandejas portacables · Canaletas · Comunicaciones (racks, organizadores, multitomas, patch panels) · Línea eléctrica (celdas, gabinetes de contadores, equipo de medida y protección) · Soportes · A medida.
- Cada producto con texto real (H1, descripción, normas, materiales, acabados), fotos nombradas, schema `Product`, y descarga de ficha (con o sin captura de correo, a decidir).
- Proyectos/portafolio: casos con foto, render 3D, cliente (si autoriza), reto, solución, tiempo. Aquí se reutiliza lo mejor del actual "Desarrollos".
- Prueba social: logos de clientes, certificaciones, testimonios, cifras (años, m² de planta, piezas/mes), todo **solo con datos que la empresa confirme**.

**D. Captura de leads y seguimiento**
- Formulario corto (nombre, celular, correo, necesidad) + el del cotizador. Envío a Worker → Google Sheets (arranque rápido) y correo.
- Etapa 2: CRM (HubSpot gratuito o Zoho) con estados *Nuevo → Contactado → Cotizado → Ganado/Perdido*, para medir conversión y tiempos de respuesta.
- Automatización Make/Zapier solo para lo que el Worker no cubra; evita dependencia de más herramientas pagas.
- Cumplimiento: aviso de tratamiento de datos y casilla de consentimiento (Ley 1581 de 2012, Habeas Data). Revisar con asesor legal el texto.

### 2.3 Sitemap modernizado

```
Inicio
├─ Productos (catálogo)
│   ├─ Bandejas portacables
│   ├─ Canaletas
│   ├─ Racks y comunicaciones
│   ├─ Línea eléctrica (celdas, gabinetes, medida)
│   ├─ Soportes
│   └─ Fabricación a medida
├─ Proyectos y desarrollos (portafolio + ingeniería 3D)
├─ Cotizador en línea
├─ Recursos (fichas técnicas, catálogo PDF, certificaciones)
├─ Empresa (historia, planta, calidad, misión/visión)
├─ Contacto y ubicación (WhatsApp, mapa, horarios)
└─ Legal (privacidad, términos)
```

---

## FASE 3 — Hoja de ruta (estimado ~10–12 semanas, 1 equipo pequeño)

| Fase | Semanas | Actividades | Entregables |
|---|---|---|---|
| 0. Preparación | 1 | Confirmar propiedad de dominio/hosting con Drivemarketing; respaldar sitio actual; reunión con socio y ventas | Accesos, respaldo, objetivos y KPIs firmados |
| 1. Discovery y diseño | 2–4 | Entrevistas a ventas y 3–5 clientes; inventario de productos y fichas; lista de precios base; arquitectura de información; diseño UI en Figma | Brief, sitemap final, wireframes, diseño móvil y escritorio aprobado, guía de tono y marca |
| 2. Frontend y funcionalidades | 5–8 | Astro + CMS; plantillas de producto/proyecto; migración de contenido; cotizador; WhatsApp contextual; formularios | Sitio en staging, CMS cargado con catálogo inicial, cotizador funcional |
| 3. Integración y pruebas | 9–10 | Worker, Sheets/CRM, correo; pruebas en dispositivos reales; Lighthouse ≥ 90; accesibilidad; redirecciones 301; revisión legal de datos | Reporte de QA, plan de redirecciones, checklist de seguridad |
| 4. Despliegue y analítica | 11–12 | Cambio de DNS, SSL, Search Console, GA4/GTM, Perfil de Empresa en Google, capacitación del equipo | Sitio en producción, dashboards de leads, manual del CMS, plan de 90 días de mejora continua |

**KPIs sugeridos:** solicitudes de cotización/mes, % de contactos por WhatsApp, tiempo de primera respuesta, tasa cotización→venta, tráfico orgánico por producto, puntaje Core Web Vitals.

---

## Riesgos y decisiones pendientes del socio

1. ¿Quién es dueño del dominio, hosting y fuentes? (afecta el cronograma).
2. ¿Se muestran precios/rangos o solo "solicitar cotización"?
3. ¿Qué certificaciones y clientes se pueden mostrar públicamente?
4. ¿Número de WhatsApp Business y quién atiende? Sin dueño del canal, el botón empeora la experiencia.
5. ¿Presupuesto mensual para publicidad (Google Ads) una vez el sitio convierta?
6. Fotos y renders actuales son de baja resolución: probable sesión fotográfica de planta y productos.
