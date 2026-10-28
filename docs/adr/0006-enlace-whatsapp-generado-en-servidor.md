# ADR-0006: Enlace de WhatsApp generado en el servidor, sin datos personales

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-03

## Contexto

El cliente debe poder continuar la conversación por WhatsApp con un resumen ya escrito. El enlace `wa.me` pasa el texto por la URL, por lo que cualquier dato incluido queda en historiales y registros intermedios. El límite de longitud del parámetro `text` no está documentado.

## Alternativas consideradas

1. **El servidor reconstruye el mensaje a partir de datos validados** y devuelve `https://wa.me/<dígitos>?text=<encodeURIComponent>`.
2. Aceptar el texto armado por el cliente. Permite contenido arbitrario.
3. WhatsApp Business API. Requiere cuenta verificada y costo por conversación.

## Decisión

La función construye el mensaje con referencia, productos y cantidades, ciudad y nombre; **no incluye correo ni celular**. El mensaje se limita a 800 caracteres. El número se normaliza a dígitos en formato internacional. Si la API no está disponible, el cliente genera el mismo enlace como alternativa.

## Consecuencias

- Positivas: contenido controlado, sin datos de contacto en la URL.
- Negativas: el límite práctico de longitud debe validarse en dispositivos reales.

## Verificación

Pruebas de `packages/shared` (normalización, codificación, longitud, ausencia de correo y celular). Pendiente: prueba en celulares reales.
