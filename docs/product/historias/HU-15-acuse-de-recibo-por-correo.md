# HU-15: Acuse de recibo por correo al cliente

- **Épica:** [EP-03](../epicas/EP-03-leads-y-whatsapp.md)
- **Estado:** En revisión (implementada; falta desplegar el script nuevo en la cuenta de la empresa)
- **Prioridad:** Alta

**Como** cliente, **quiero** recibir por correo la referencia de mi solicitud, **para** no perderla si cierro la pestaña y tener constancia de que la empresa la recibió.

## Alcance

- Correo al cliente tras una solicitud entregada, con referencia, productos, ciudad y datos de contacto de la empresa.
- Sin NIT o cédula, datos fiscales, enlace al RUT ni celular.
- Topes diarios (total y por dirección), reserva de cuota para los avisos al equipo e interruptor (`CUSTOMER_ACK`).
- Política de datos actualizada con la finalidad y el proveedor; pantalla de éxito que anuncia la confirmación.

## Criterios de aceptación

```gherkin
Característica: Acuse de recibo

  Escenario: Confirmación al cliente
    Dado una solicitud entregada con un correo válido
    Entonces el cliente recibe un correo con su referencia y sus productos
    Y "responder a" es el correo del equipo

  Escenario: Datos fiscales protegidos
    Entonces el correo no contiene NIT, cédula, CIIU, responsabilidades fiscales ni enlace al RUT

  Escenario: Abuso
    Cuando una dirección ya recibió 3 confirmaciones en el día
    Entonces no se envía otra, y la solicitud se registra igual

  Escenario: Cuota baja
    Cuando quedan 10 envíos o menos en el día
    Entonces solo se envía el aviso al equipo

  Escenario: Fallo de correo
    Cuando el envío al cliente falla
    Entonces la solicitud y el aviso al equipo no se pierden

  Escenario: Interruptor
    Dado CUSTOMER_ACK en "off"
    Entonces no se envía ninguna confirmación

  Escenario: Consentimiento
    Entonces la política de datos declara el acuse como finalidad
```

## Pendiente con la empresa

Revisión legal del texto de la política y decidir si, con volumen, se pasa a Google Workspace o a un servicio de correo con dominio propio.
