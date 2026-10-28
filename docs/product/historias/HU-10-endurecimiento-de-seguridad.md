# HU-10: Endurecimiento de seguridad (CSP sin `unsafe-inline` y protección anti-spam)

- **Épica:** [EP-05](../epicas/EP-05-plataforma-y-calidad.md)
- **Estado:** Pendiente (fase 2)
- **Prioridad:** Baja

**Como** responsable técnico, **quiero** reducir la superficie de ataque del sitio y del endpoint, **para** proteger al negocio y a sus clientes.

## Alcance

- Reemplazar `'unsafe-inline'` de la CSP por hashes (ADR-0010).
- Evaluar una verificación anti-spam adicional (por ejemplo Cloudflare Turnstile) y limitación de tasa, que Static Web Apps Free no ofrece de forma nativa.
- Revisar dependencias con `npm audit` y definir una política de actualización.

## Criterios de aceptación

```gherkin
Característica: Seguridad

  Escenario: CSP sin ejecución en línea arbitraria
    Cuando se solicita cualquier página
    Entonces "script-src" no contiene "'unsafe-inline'"
    Y la hidratación del cotizador sigue funcionando

  Escenario: Abuso del endpoint
    Cuando una misma fuente envía solicitudes en ráfaga
    Entonces el endpoint rechaza o frena las solicitudes excedentes

  Escenario: Dependencias
    Cuando se ejecuta "npm audit --omit=dev"
    Entonces no hay vulnerabilidades de severidad alta o crítica sin plan de mitigación
```
