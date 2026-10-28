# HU-11: Datos fiscales y adjunto del RUT para facturación

- **Épica:** [EP-02](../epicas/EP-02-cotizador.md)
- **Estado:** En revisión (implementada y verificada en local; falta la prueba contra el destino real del webhook y la validación de campos con el sistema contable)
- **Prioridad:** Alta

**Como** área de facturación, **quiero** recibir con cada solicitud el tipo de persona, la identificación, los datos fiscales y, si el cliente lo adjunta, su RUT, **para** crear el cliente y emitir la factura electrónica sin pedir información de nuevo.

## Alcance

- Selector "Persona natural" o "Persona jurídica" en el paso "Contacto" del cotizador.
- Natural: nombre completo y cédula. Jurídica: razón social o nombre comercial, NIT, dígito de verificación y nombre de la persona de contacto.
- Para ambos: código CIIU (4 dígitos) y responsabilidades fiscales.
- Adjunto opcional del RUT: PDF, JPG o PNG, hasta 5 MB. Se lee en el navegador en Base64, la API lo valida y lo reenvía al webhook; no se guarda en el navegador.
- Esquema compartido ampliado, receptor de ejemplo con Google Drive y política de datos actualizada. Decisiones: [ADR-0011](../../adr/0011-identificacion-tributaria-obligatoria-en-el-cotizador.md) y [ADR-0012](../../adr/0012-datos-fiscales-y-adjunto-del-rut.md).

## Criterios de aceptación

```gherkin
Característica: Datos fiscales y RUT

  Escenario: Persona natural
    Dado que el usuario elige "Persona natural"
    Cuando completa nombre, cédula, CIIU y al menos una responsabilidad fiscal
    Entonces avanza al resumen
    Y no se le pide razón social ni dígito de verificación

  Escenario: Persona jurídica
    Dado que el usuario elige "Persona jurídica"
    Cuando completa razón social, NIT, dígito de verificación, contacto, CIIU y responsabilidades
    Entonces avanza al resumen
    Y el resumen muestra el NIT con su dígito

  Escenario: Dígito de verificación incorrecto
    Dado una persona jurídica con NIT "900123456"
    Cuando escribe el dígito "3"
    Entonces ve "El dígito de verificación no corresponde al NIT" junto al campo

  Escenario: Faltan datos fiscales
    Cuando falta el tipo de persona, el CIIU o las responsabilidades fiscales
    Entonces el usuario permanece en el paso con el aviso junto al campo

  Escenario: IVA contradictorio
    Cuando el usuario marca "Responsable de IVA" y "No responsable de IVA"
    Entonces ve "No puedes ser responsable y no responsable de IVA a la vez"

  Escenario: Adjuntar el RUT
    Cuando el usuario elige un PDF, JPG o PNG de 5 MB o menos
    Entonces ve el nombre y el tamaño del archivo con la opción "Quitar"
    Y el archivo viaja en la solicitud como Base64

  Escenario: Archivo no permitido
    Cuando el usuario elige un archivo de otro formato, de más de 5 MB o cuyo contenido no corresponde a su tipo
    Entonces ve el motivo junto al campo
    Y el archivo no se adjunta

  Escenario: El archivo es opcional
    Cuando el usuario no adjunta el RUT
    Entonces puede enviar la solicitud y el resumen indica "Sin RUT adjunto."

  Escenario: Validación en el servidor
    Cuando la API recibe un archivo de otro formato, de más de 5 MB, con tamaño inconsistente o con una firma que no corresponde
    Entonces responde 400 con la ruta "rutFile" y no llama al webhook

  Escenario: El RUT llega al destino
    Dado un webhook configurado
    Cuando se envía una solicitud con RUT
    Entonces el webhook recibe "rutFile" con nombre, tipo, tamaño y contenido
    Y el destino lo guarda asociado a la referencia de cotización

  Escenario: Fallo al guardar con archivo
    Dado que el webhook falla
    Cuando el usuario adjuntó un RUT
    Entonces la pantalla final indica que no pudimos guardar el RUT
    Y le pide enviarlo por WhatsApp con su referencia

  Escenario: Nada sensible en WhatsApp ni en registros
    Cuando se genera el enlace de WhatsApp y se escribe el registro de la función
    Entonces no contienen el NIT o cédula, el CIIU, las responsabilidades fiscales ni el contenido del RUT

  Escenario: El archivo no se persiste en el navegador
    Cuando el usuario recarga la página
    Entonces el RUT adjunto debe volver a seleccionarse

  Escenario: Política actualizada
    Cuando el usuario abre "/privacidad/"
    Entonces encuentra declarados el RUT, el CIIU, las responsabilidades fiscales y su finalidad exclusiva de facturación y creación de terceros
```

## Definición de terminada específica

- Pruebas automáticas de esquema, API y enlace de WhatsApp (hechas).
- Prueba manual en el navegador del recorrido natural y jurídico, con y sin archivo (hecha en local).
- Prueba de extremo a extremo con el destino real del webhook, con un archivo de 5 MB (pendiente).
- Confirmación con el sistema contable de los campos y las responsabilidades fiscales requeridas (pendiente).
- Revisión legal del texto de `/privacidad/` (pendiente, HU-06).
