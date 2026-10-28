# ADR-0015: Acuse de recibo por correo al cliente, enviado desde el receptor

- **Estado:** Aceptada
- **Fecha:** 2026-10-28
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-03, EP-06

## Contexto

Al enviar el cotizador, el cliente veía su referencia solo en pantalla. Si cerraba la pestaña la perdía, y no tenía constancia de que la empresa recibió su solicitud. El receptor de Google Apps Script ya envía un aviso al equipo (ADR-0012) con `MailApp`, cuya cuenta gratuita de Gmail permite 100 destinatarios por día (1.500 en Google Workspace). Cada cotización ahora cuesta hasta dos destinatarios y el formulario es público: la dirección de correo la escribe el visitante.

## Alternativas consideradas

1. **Acuse enviado por el receptor existente**, con topes propios y un interruptor. Sin servicios nuevos.
2. Servicio de correo transaccional (Azure Communication Services u otro). Mejor entregabilidad y cuotas altas, pero cuenta, dominio verificado, costo por mensaje y un proveedor más de datos personales.
3. Enviar el correo desde la Azure Function. Obliga a guardar credenciales de correo en la configuración y duplica la ruta de envío.
4. No enviar nada y mostrar la referencia en pantalla. Es lo que había: la referencia se pierde.

## Decisión

- El receptor envía el acuse justo después del aviso al equipo, fuera del candado y dentro de un `try/catch`: un fallo del correo nunca pierde el lead ni el aviso interno. El aviso al equipo va siempre primero.
- Contenido: saludo, referencia, productos (con la referencia de cada ítem), ciudad, si se recibió el RUT, teléfono y dirección de la empresa, el enlace a la política de datos y la aclaración de que no es una cotización ni un compromiso de precio. **No** incluye NIT o cédula, CIIU, responsabilidades fiscales, el enlace al RUT, el celular ni el enlace a la hoja. "Responder a" es `NOTIFY_EMAIL`.
- Protección de la cuota y contra abuso:
  - reserva: solo se envía si quedan más de 10 envíos del día para los avisos al equipo;
  - tope diario total (`MAX_ACK_PER_DAY`, 50 por defecto) y de 3 por dirección y día, sin distinguir mayúsculas;
  - interruptor `CUSTOMER_ACK=off` sin volver a implementar.
  Superado cualquier tope, la solicitud se registra y se avisa al equipo igual; en el registro queda solo la referencia.
- Consentimiento: la política de datos (`/privacidad/`) declara el acuse como finalidad y menciona que lo envía el proveedor de registro de solicitudes desde una cuenta de la empresa. El cliente ya la acepta para enviar la solicitud.
- La pantalla de éxito dice que se enviará una confirmación a la dirección indicada y a revisar el correo no deseado, sin prometer entrega.

## Consecuencias

- Positivas: el cliente conserva su referencia, sin costo ni servicios nuevos.
- Negativas: con la cuenta gratuita el techo práctico es de unas 50 cotizaciones al día; la entregabilidad depende de una cuenta personal de Gmail (puede caer en el correo no deseado); la dirección la escribe el visitante, por eso los topes por dirección.
- Pendiente: pasar a Google Workspace o a un servicio transaccional con dominio propio cuando el volumen lo pida, y fijar `SITE_URL` al cambiar el dominio.
- El script nuevo se despliega en la cuenta de la empresa antes de que el correo salga; hasta entonces el sitio funciona sin acuse (la pantalla de éxito ya lo anuncia solo si la solicitud se entregó).

## Verificación

Pruebas del receptor en una máquina virtual de Node con simulaciones de Hojas, Drive y correo (`api/quote/apps-script.test.ts`): envío al cliente con referencia, productos y "responder a"; ausencia de datos fiscales y del enlace al RUT; interruptor; reserva de cuota; topes por dirección y diario, con reinicio al día siguiente; fallos de correo sin pérdida del lead; sin duplicar correos ante un reenvío.
