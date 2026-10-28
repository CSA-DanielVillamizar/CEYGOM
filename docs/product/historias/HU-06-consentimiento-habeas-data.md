# HU-06: Consentimiento y política de tratamiento de datos (Habeas Data)

- **Épica:** [EP-06](../epicas/EP-06-cumplimiento-y-datos-personales.md)
- **Estado:** Parcial (casilla implementada; falta el texto y la página de la política)
- **Prioridad:** Alta

**Como** titular de los datos, **quiero** saber para qué se usarán mis datos y aceptar su tratamiento antes de enviarlos, **para** ejercer mis derechos conforme a la Ley 1581 de 2012.

## Alcance

- Hecho: casilla obligatoria en el cotizador; el consentimiento no se guarda en el navegador; la API rechaza solicitudes sin consentimiento; los registros no contienen datos personales.
- Pendiente: página `/politica-de-datos/` con el texto aprobado y enlace desde el cotizador y el pie de página.

## Criterios de aceptación

```gherkin
Característica: Protección de datos personales

  Escenario: Sin consentimiento no se envía
    Cuando el usuario no acepta la política
    Entonces no puede completar el cotizador
    Y la API responde 400 si se envía "acceptsDataPolicy" distinto de true

  Escenario: Política accesible
    Cuando el usuario pulsa el enlace de la política en el cotizador
    Entonces se muestra la política con responsable, finalidad, derechos y canal de contacto

  Escenario: Sin datos personales en registros
    Cuando la función procesa una solicitud
    Entonces el registro contiene la referencia y el resultado
    Y no contiene nombre, correo ni celular

  Escenario: Consentimiento no persistente
    Cuando el usuario recarga el cotizador
    Entonces la casilla aparece sin marcar
```

## Dependencia del negocio

Texto de la política y responsable del tratamiento, aprobados por quien corresponda legalmente. No se redacta ni se publica texto legal sin esa aprobación.
