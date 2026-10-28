# ADR-0011: NIT o cédula (RUT) obligatorio en el cotizador

- **Estado:** Aceptada
- **Fecha:** 2026-10-28
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-02, EP-03, EP-06

## Contexto

Ventas necesita el RUT del cliente para crear el registro de cliente y facturar en el sistema interno. Hasta ahora el cotizador no pedía ninguna identificación. El NIT o la cédula es un dato personal, por lo que su recolección debe tener una finalidad informada y proporcionada (Ley 1581 de 2012, ADR-0009).

## Alternativas consideradas

1. **Pedir siempre el número de NIT o cédula en el cotizador, como campo obligatorio.**
2. Pedirlo solo cuando la cotización se concrete, por el asesor. Más fricción posterior y datos fuera del registro del lead.
3. Pedir el documento RUT en PDF. Exige almacenamiento de archivos, que el plan Free de Static Web Apps con funciones administradas no ofrece; queda fuera de alcance.

## Decisión

El esquema compartido exige `contact.taxId`: se normaliza a solo dígitos (se descartan puntos, guiones y espacios) y debe tener entre 6 y 15 dígitos. No se valida el dígito de verificación del NIT: si el cliente lo escribe, queda como parte del número y el sistema de facturación lo separa. El campo viaja en el lead al webhook, pero **no** en el mensaje de WhatsApp ni en los registros del servidor. La política de datos (`/privacidad/`) lo declara como dato recolectado y lo vincula a la finalidad de crear el cliente y facturar.

## Consecuencias

- Positivas: el lead llega listo para crear el cliente y facturar.
- Negativas: un campo más puede reducir la tasa de finalización del cotizador; conviene medirlo (HU-09). Quien aún no tenga el dato a mano no puede enviar la solicitud en línea y debe contactar a la empresa por teléfono o WhatsApp.
- Pendiente: confirmar con el sistema de facturación si requiere el dígito de verificación por separado y si distingue persona natural de jurídica.

## Verificación

Pruebas de esquema (normalización y rechazo de vacío, muy corto, no numérico y demasiado largo) y del handler (400 sin `taxId`; el webhook recibe el valor normalizado). Pruebas de WhatsApp: el mensaje no contiene el número.
