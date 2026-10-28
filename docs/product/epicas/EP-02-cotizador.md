# EP-02: Cotizador en línea

- **Estado:** Entregada (pendiente de validación en dispositivos reales)
- **Prioridad:** Alta
- **Historias:** [HU-02](../historias/HU-02-cotizador-multipasos.md) (hecha), [HU-11](../historias/HU-11-datos-fiscales-y-adjunto-del-rut.md) (en revisión)

## Objetivo

Permitir que un cliente describa lo que necesita (uno o varios productos, medidas, ciudad y contacto) en pasos cortos y revise un resumen antes de enviarlo.

## Valor de negocio

Convierte visitas en solicitudes estructuradas y reduce la fricción de pedir cotización por teléfono.

## Alcance

- Asistente de cuatro pasos: productos, proyecto, contacto y resumen.
- Tipo de persona, NIT o cédula, CIIU y responsabilidades fiscales, con adjunto opcional del RUT (ADR-0011, ADR-0012, [HU-11](../historias/HU-11-datos-fiscales-y-adjunto-del-rut.md)).
- Hasta 20 productos por solicitud; precarga con `?producto=<slug>`.
- Resumen en JSON conforme al esquema compartido.
- Accesibilidad por teclado y mensajes de error asociados al campo.

## Fuera de alcance

- Cálculo de precios (ADR-0009).

## Indicadores de éxito

- Tasa de finalización del cotizador.
- JavaScript transferido en `/cotizador/` de 200 KB o menos.
