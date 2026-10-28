# Product Backlog inicial: Ceygom Web (Specification-Driven)

Contexto y reglas: ver `AGENT_HARNESS.md`. Esquemas: `packages-shared-quote.schema.ts` (escrito para Zod 3.x; con Zod 4 cambia la forma del mensaje personalizado de `z.literal`).

Épicas: **E1** Catálogo y rendimiento · **E2** Cotizador · **E3** Captura de leads y WhatsApp.

---

## HU-01 · Catálogo industrial estático optimizado en Azure Static Web Apps (E1)

**Como** ingeniero o comprador de una constructora, **quiero** encontrar y revisar productos con nombre, descripción y ficha técnica desde el celular, **para** decidir rápido a quién pedir cotización.

**Alcance:** migrar las 6 categorías y ~46 fichas PDF actuales a colecciones de contenido de Astro; páginas estáticas por producto; redirects 301 desde las URLs `.html` viejas; despliegue en SWA Free.

**Notas técnicas verificadas**
- `staticwebapp.config.json` va en `apps/web/public/` para que el build lo copie a la raíz de `output_location`.
- Astro en `output: 'static'` no necesita `navigationFallback`; se usa `responseOverrides.404` para servir `/404.html` **con estado 404** (un fallback devolvería 200 y generaría soft-404 para Google).
- Límites Free: 250 MB por entorno y 15.000 archivos. Presupuesto: ≤ 150 MB de PDFs+imágenes.

**Criterios de aceptación**

```gherkin
Característica: Catálogo estático

  Escenario: Página de producto indexable
    Dado que existe el producto "rack-cerrado-abatible" en la colección "productos"
    Cuando se construye el sitio con "astro build"
    Entonces existe la página "/productos/racks-comunicaciones/rack-cerrado-abatible/"
    Y el HTML contiene un único <h1> con el nombre del producto
    Y contiene una meta description de entre 70 y 160 caracteres
    Y contiene JSON-LD de tipo "Product"

  Escenario: Front-matter inválido rompe el build
    Dado un producto cuyo front-matter no tiene "categoria"
    Cuando se ejecuta "astro build"
    Entonces el build falla indicando el archivo y el campo faltante

  Escenario: Ficha técnica descargable
    Dado un producto con "ficha" apuntando a "/fichas/rack-cerrado-abatible.pdf"
    Cuando el usuario pulsa "Descargar ficha técnica"
    Entonces el navegador recibe el PDF con estado 200
    Y la respuesta incluye "Cache-Control: public, max-age=86400"

  Escenario: Redirección de URLs antiguas
    Dado que el sitio está desplegado en Azure Static Web Apps
    Cuando se solicita "/productos.html"
    Entonces se responde 301 con destino "/productos/"
    # Repetir para empresa, desarrollos, ubicacion, contacto e index

  Escenario: Ruta inexistente
    Cuando se solicita "/no-existe"
    Entonces el estado HTTP es 404
    Y se muestra la página personalizada "404.html" con enlaces al catálogo y al cotizador

  Escenario: Rendimiento en móvil
    Dado un perfil móvil de Lighthouse
    Cuando se audita "/productos/"
    Entonces Rendimiento, Accesibilidad, Buenas prácticas y SEO son >= 90
    Y el JavaScript transferido es <= 100 KB

  Escenario: Cabeceras de seguridad
    Cuando se solicita cualquier página HTML
    Entonces la respuesta incluye "X-Content-Type-Options: nosniff"
    Y "Strict-Transport-Security" y "Content-Security-Policy"

  Escenario: Cabeceras de caché de recursos versionados
    Cuando se solicita un archivo bajo "/_astro/"
    Entonces "Cache-Control" es "public, max-age=31536000, immutable"
```

---

## HU-02 · Cotizador interactivo multipasos con resumen JSON (E2)

**Como** cliente potencial, **quiero** describir lo que necesito en pasos cortos y ver un resumen antes de enviarlo, **para** pedir cotización sin llamar.

**Alcance:** isla React `Cotizador` en `/cotizador/` (y precarga desde "Cotizar este producto" con `?producto=<slug>`). 4 pasos: producto, especificaciones, cantidad/ciudad/fecha, contacto con consentimiento. Validación con los esquemas de `shared`. **No calcula precios** (no hay lista de precios confirmada).

**Notas técnicas**
- Una sola isla con `client:load`; estado local con `useReducer`; progreso en `sessionStorage` (envuelto en try/catch).
- Los errores se muestran junto al campo, con `aria-live="polite"`.
- Campo honeypot `website` oculto con CSS, fuera del flujo de foco.

**Criterios de aceptación**

```gherkin
Característica: Cotizador multipasos

  Escenario: Recorrido feliz
    Dado que el usuario abre "/cotizador/"
    Cuando elige la categoría "racks-comunicaciones" y pulsa "Siguiente"
    Y completa especificaciones, cantidad 2 y ciudad "Medellín"
    Y completa nombre, correo, celular y acepta la política de datos
    Entonces ve una pantalla de resumen con todos sus datos
    Y el botón "Enviar solicitud" está habilitado

  Escenario: No se avanza con datos inválidos
    Dado que el usuario está en el paso 3
    Cuando deja la cantidad en 0 y pulsa "Siguiente"
    Entonces permanece en el paso 3
    Y ve el mensaje de error junto al campo "Cantidad"
    Y el foco se mueve al primer campo con error

  Escenario: Consentimiento obligatorio
    Dado que el usuario está en el paso 4 con todos los campos válidos
    Cuando no marca la política de tratamiento de datos
    Entonces el botón "Enviar solicitud" permanece deshabilitado

  Escenario: Precarga desde un producto
    Dado que el usuario llega a "/cotizador/?producto=patch-panel-24-puntos"
    Cuando la isla se hidrata
    Entonces el paso 1 muestra seleccionada la categoría de ese producto
    Y el slug queda en el resumen

  Escenario: Resumen en JSON conforme al esquema
    Dado que el usuario completó los 4 pasos
    Cuando el sistema genera el resumen
    Entonces el JSON cumple "quoteRequestSchema"
    Y el campo "phone" contiene solo dígitos
    Y el campo "website" está vacío

  Escenario: Recuperación al recargar
    Dado que el usuario completó los pasos 1 y 2
    Cuando recarga la página
    Entonces los datos de los pasos 1 y 2 siguen cargados

  Escenario: Navegación con teclado
    Dado un usuario que solo usa teclado
    Cuando recorre el cotizador con Tab, Enter y Shift+Tab
    Entonces puede completar y enviar la solicitud sin ratón

  Escenario: Peso de la página
    Cuando se audita "/cotizador/" en móvil
    Entonces el JavaScript transferido es <= 200 KB
```

---

## HU-03 · Azure Function que procesa el cotizador, registra el lead y devuelve el enlace wa.me (E3)

**Como** equipo de ventas, **quiero** recibir cada solicitud en nuestra hoja o CRM y que el cliente pueda abrir WhatsApp con el resumen ya escrito, **para** responder en minutos.

**Alcance:** `POST /api/quote` (managed function, Node 22, modelo v4). Valida con Zod, genera referencia `COT-AAAA-XXXXXX`, envía el lead a `LEADS_WEBHOOK_URL` y responde `{ reference, whatsappUrl }`.

**Decisiones**
- Google Sheets: se integra **vía webhook** (p. ej. un Google Apps Script publicado como aplicación web, o Make/Zapier). No se usa la API de Sheets directamente porque en managed functions no hay Managed Identity ni Key Vault y evitaría guardar credenciales de cuenta de servicio. *Pendiente de negocio: elegir destino.*
- El servidor **reconstruye** el mensaje de WhatsApp a partir de los datos validados; no confía en texto del cliente.
- Formato de enlace: `https://wa.me/<número en formato internacional, solo dígitos>?text=<texto con encodeURIComponent>`. Mantener el mensaje por debajo de ~800 caracteres (límite no documentado; probar en dispositivos reales).
- No hay limitación de tasa nativa en SWA Free: defensas = honeypot, validación estricta, verificación de `Origin`, y (fase 2) Cloudflare Turnstile.
- Si el webhook falla, **no se pierde la intención del cliente**: se responde 502 `UPSTREAM_FAILED`, y la isla ofrece igualmente el botón de WhatsApp con el mensaje generado en el cliente (degradación elegante).

**Esqueleto de referencia** (`api/src/functions/quote.ts`)

```ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { quoteRequestSchema, type QuoteResponse } from "@ceygom/shared";
import { loadEnv } from "../lib/env";
import { postLead } from "../lib/webhook";
import { buildWhatsappUrl } from "../lib/whatsapp";
import { newReference } from "../lib/reference";

export async function quote(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const env = loadEnv(); // validates process.env.WHATSAPP_NUMBER, LEADS_WEBHOOK_URL, ALLOWED_ORIGIN...
  if (!env.ok) {
    ctx.error("Missing env vars", env.missing); // names only, never values
    return { status: 500, jsonBody: { error: "SERVER_MISCONFIGURED" } };
  }

  const origin = req.headers.get("origin");
  if (origin && origin !== env.value.ALLOWED_ORIGIN) return { status: 403 };

  const parsed = quoteRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return {
      status: 400,
      jsonBody: {
        error: "VALIDATION_ERROR",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    };
  }

  // Honeypot: pretend success, store nothing.
  if (parsed.data.website) return { status: 200, jsonBody: { reference: "COT-0000-000000", whatsappUrl: "" } };

  const reference = newReference();
  const lead = { reference, createdAt: new Date().toISOString(), request: parsed.data };

  try {
    await postLead(env.value.LEADS_WEBHOOK_URL, lead, env.value.LEADS_WEBHOOK_SECRET);
  } catch (e) {
    ctx.error("Lead webhook failed", (e as Error).message);
    return { status: 502, jsonBody: { error: "UPSTREAM_FAILED" } };
  }

  const body: QuoteResponse = {
    reference,
    whatsappUrl: buildWhatsappUrl(env.value.WHATSAPP_NUMBER, lead),
  };
  return { status: 200, jsonBody: body };
}

app.http("quote", { methods: ["POST"], authLevel: "anonymous", route: "quote", handler: quote });
```

`host.json` mínimo: `{ "version": "2.0" }`. `api/package.json` con `"main": "dist/src/functions/*.js"`. Verificar en la primera tarea que el paquete workspace `@ceygom/shared` se empaqueta en el despliegue (managed functions no ejecutan `npm install` de workspaces del monorepo; si falla, empaquetar con esbuild a un único `dist/`). **Spike de 0,5 días antes de empezar.**

**Criterios de aceptación**

```gherkin
Característica: Procesamiento del cotizador

  Antecedentes:
    Dado que las variables WHATSAPP_NUMBER, LEADS_WEBHOOK_URL y ALLOWED_ORIGIN están configuradas

  Escenario: Solicitud válida
    Cuando se envía POST a "/api/quote" con un JSON que cumple "quoteRequestSchema"
    Entonces la respuesta es 200
    Y el cuerpo contiene "reference" con formato "COT-AAAA-XXXXXX"
    Y el cuerpo contiene "whatsappUrl" que empieza por "https://wa.me/"
    Y el webhook recibió exactamente una vez el lead con ese "reference"

  Escenario: El mensaje de WhatsApp va codificado
    Dado un lead con ciudad "Medellín" y notas "Puerta con chapa & ventilación"
    Cuando se construye el enlace
    Entonces el parámetro "text" está codificado con encodeURIComponent
    Y al decodificarlo contiene la referencia, el producto, la cantidad y la ciudad
    Y no contiene el correo ni el celular del cliente
    Y su longitud decodificada es <= 800 caracteres

  Escenario: Número de WhatsApp normalizado
    Dado WHATSAPP_NUMBER con valor "+57 XXX XXX XXXX"
    Cuando se construye el enlace
    Entonces la ruta contiene solo dígitos

  Escenario: Datos inválidos
    Cuando se envía un JSON sin "contact.email"
    Entonces la respuesta es 400 con error "VALIDATION_ERROR"
    Y "issues" incluye la ruta "contact.email"
    Y el webhook no recibe nada

  Escenario: Sin consentimiento
    Cuando se envía "acceptsDataPolicy": false
    Entonces la respuesta es 400
    Y el webhook no recibe nada

  Escenario: Cuerpo que no es JSON
    Cuando se envía un cuerpo de texto plano
    Entonces la respuesta es 400 con error "VALIDATION_ERROR"

  Escenario: Honeypot activado
    Cuando "website" contiene texto
    Entonces la respuesta es 200
    Y el webhook no recibe nada

  Escenario: Origen no permitido
    Cuando la petición trae un "Origin" distinto de ALLOWED_ORIGIN
    Entonces la respuesta es 403

  Escenario: Webhook caído
    Dado que LEADS_WEBHOOK_URL responde 500
    Cuando se envía una solicitud válida
    Entonces la respuesta es 502 con error "UPSTREAM_FAILED"
    Y la isla muestra el aviso "No pudimos registrar tu solicitud" y el botón "Escribir por WhatsApp"

  Escenario: Falta configuración
    Dado que LEADS_WEBHOOK_URL no está definida
    Cuando se envía cualquier solicitud
    Entonces la respuesta es 500 con error "SERVER_MISCONFIGURED"
    Y el log nombra la variable faltante sin imprimir valores

  Escenario: Método no permitido
    Cuando se envía GET a "/api/quote"
    Entonces la respuesta es 404 o 405 según el comportamiento de la plataforma
    # Verificar en la vista previa de SWA y fijar el criterio exacto.

  Escenario: Firma del webhook
    Dado LEADS_WEBHOOK_SECRET configurado
    Cuando la función llama al webhook
    Entonces incluye el header "x-ceygom-signature" con el secreto

  Escenario: Trazabilidad sin datos personales
    Cuando una solicitud se procesa
    Entonces el log registra la referencia y el resultado
    Y no registra nombre, correo ni celular
```

---

## Orden y dependencias

1. Spike de empaquetado de `shared` en managed functions (0,5 d).
2. HU-01 (base del sitio, config SWA, CI/CD).
3. HU-03 (API) en paralelo con HU-02 (isla): el contrato es `quoteRequestSchema` / `quoteResponseSchema`.
4. Integración end-to-end y prueba en dispositivos reales de `wa.me`.

## Riesgos abiertos

- Free no tiene SLA; si el cotizador es crítico para ventas, evaluar Standard (plan de pago) cuando haya volumen.
- Managed functions: 45 s máximo, solo HTTP; si luego se necesitan colas o temporizadores, pasar a Standard + Function App en Flex Consumption.
- El CSP incluye `'unsafe-inline'` porque Astro inyecta scripts/estilos inline; endurecerlo con hashes en una historia posterior.
- Turnstile, GA4 y GTM requieren ampliar `script-src`, `connect-src` y `frame-src` del CSP al activarlos.
