# ADR-0012: Datos fiscales del RUT y adjunto opcional del documento

- **Estado:** Aceptada
- **Fecha:** 2026-10-28
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-02, EP-03, EP-06
- **Amplía:** [ADR-0011](0011-identificacion-tributaria-obligatoria-en-el-cotizador.md)

## Contexto

Para crear el cliente y emitir la factura electrónica, el área de facturación necesita, además del NIT o la cédula, el tipo de persona, la actividad económica (CIIU), las responsabilidades fiscales y, idealmente, el documento RUT. El ADR-0011 dejó fuera el archivo porque el plan Free de Static Web Apps con funciones administradas no incluye almacenamiento de archivos. La plataforma admite peticiones de hasta 30 MB, por lo que un adjunto de 5 MB en Base64 (cerca de 7 MB) cabe en una llamada a la función.

## Alternativas consideradas

1. **El navegador lee el archivo en Base64 y lo envía en el JSON de `POST /api/quote`; la función lo valida y lo reenvía en el lead al webhook, que lo guarda en el almacenamiento de la empresa (por ejemplo una carpeta privada de Drive).** Sin infraestructura nueva y sin costo.
2. Subida directa del navegador a un almacenamiento propio (Azure Blob con URL firmada). Más robusta con archivos grandes y permite escanear el archivo, pero exige una cuenta de almacenamiento, claves y una segunda función; queda como evolución.
3. No recolectar el archivo y pedir solo los datos escritos. Menos fricción y menos datos personales, pero el área de facturación tendría que pedir el RUT aparte.

## Decisión

- **Tipo de persona** (`personType`: `natural` o `juridica`). Natural: nombre completo y cédula. Jurídica: razón social o nombre comercial, NIT con dígito de verificación (campo separado `taxIdCheckDigit`, verificado con el algoritmo de la DIAN) y nombre de la persona de contacto. El campo opcional `company` se sustituye por `businessName`.
- **Datos fiscales obligatorios:** código CIIU de 4 dígitos (`ciiuCode`) y una o más responsabilidades fiscales (`fiscalResponsibilities`): responsable de IVA, no responsable de IVA (excluyentes entre sí), gran contribuyente, autorretenedor, Régimen Simple u otra. Son lo que declara el cliente; la fuente de verdad es el RUT.
- **Adjunto del RUT opcional** (`rutFile`): PDF, JPG o PNG, hasta 5 MB. El cliente solo lee el archivo en memoria; no se guarda en el navegador. La API valida formato, tamaño, coherencia entre tamaño y contenido y la firma del archivo (no basta con confiar en el tipo declarado). El archivo viaja únicamente al webhook, con un tiempo de espera de 25 s en lugar de 8 s, y nunca a los registros ni al enlace de WhatsApp.
- El archivo es opcional porque se pidió "permitir adjuntar"; si el negocio decide exigirlo, basta quitar `.optional()` en el esquema.
- La política `/privacidad/` declara cada dato recolectado y limita su finalidad a la facturación y la creación de terceros en el sistema contable.

## Consecuencias

- Positivas: el lead llega completo para crear el cliente y facturar, sin infraestructura adicional.
- Negativas: el formulario es más largo y puede bajar la finalización (medir en HU-09). El archivo depende del webhook: si falla, se pierde y el cliente debe enviarlo por WhatsApp (la pantalla final lo indica). La función no analiza el archivo en busca de malware; el almacenamiento destino debe hacerlo o restringir el acceso y la descarga a personal de facturación.
- Con Google Apps Script como destino, un error al guardar el archivo no cambia el código HTTP de la respuesta, así que `webhookDelivered` puede ser `true` sin que el archivo se haya guardado. Para detectar fallos usar Make u otro destino que devuelva el estado real, o la alternativa 2.
- Cambio de contrato: se elimina `company`, y `personType`, `ciiuCode` y `fiscalResponsibilities` pasan a ser obligatorios. El único cliente de la API es el cotizador de este repositorio.
- Pendiente: confirmar con el sistema contable qué campos exige y si las responsabilidades fiscales deben seguir los códigos oficiales del RUT; la lista actual es descriptiva.

## Verificación

Pruebas del esquema (tipo de persona, DV, CIIU, responsabilidades y archivo: formato, 5 MB exactos y un byte más, firma, tamaño inconsistente, nombre con rutas), del handler (400 por cada campo inválido; el archivo llega al webhook; ni el archivo ni los datos fiscales aparecen en el enlace de WhatsApp ni en los registros) y del enlace de WhatsApp. Pendiente: prueba de extremo a extremo contra el destino real.
