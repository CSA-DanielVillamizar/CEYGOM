# HU-06: Consentimiento y política de tratamiento de datos (Habeas Data)

- **Épica:** [EP-06](../epicas/EP-06-cumplimiento-y-datos-personales.md)
- **Estado:** En revisión (página `/privacidad/` y enlace desde el cotizador y el pie de página implementados; la política ya muestra la razón social y el NIT; falta el correo para consultas y reclamos y la revisión legal del texto)
- **Prioridad:** Alta

**Como** titular de los datos, **quiero** saber para qué se usarán mis datos y aceptar su tratamiento antes de enviarlos, **para** ejercer mis derechos conforme a la Ley 1581 de 2012.

## Alcance

- Hecho: casilla obligatoria en el cotizador; el consentimiento no se guarda en el navegador; la API rechaza solicitudes sin consentimiento; los registros no contienen datos personales.
- Hecho: página `/privacidad/` (`src/pages/privacidad.astro`) con responsable, datos, finalidades, derechos, plazos de consultas y reclamos (Ley 1581 de 2012), proveedores, conservación y almacenamiento en el navegador; enlace desde la casilla del cotizador y desde el pie de página. Los datos del responsable están en `src/data/legal.ts`; los que faltan se omiten, no se inventan.
- Hecho: razón social (Electro Metálicas Ceygom S.A.S.) y NIT (900456873-5) entregados por la empresa, visibles en la política, el pie de página y los datos estructurados; la prueba `src/data/legal.test.ts` valida el dígito de verificación.
- Pendiente: revisión y aprobación del texto por quien corresponda legalmente y el correo designado para consultas y reclamos (`TODO(negocio)` en `src/data/legal.ts`; mientras falte, la página lo omite y solo ofrece dirección y teléfono).
- Nota: el campo del contrato sigue siendo `acceptsDataPolicy` (`z.literal(true)`).
- La política declara también los datos fiscales y el RUT adjunto con su finalidad exclusiva de facturación y creación de terceros ([HU-11](HU-11-datos-fiscales-y-adjunto-del-rut.md), ADR-0012). La revisión legal debe cubrirlos, y confirmar que el acceso al almacenamiento del RUT se limita al personal de facturación, tal como afirma la sección 7.

## Criterios de aceptación

```gherkin
Característica: Protección de datos personales

  Escenario: Sin consentimiento no se envía
    Cuando el usuario no acepta la política
    Entonces no puede completar el cotizador
    Y la API responde 400 si se envía "acceptsDataPolicy" distinto de true

  Escenario: Política accesible
    Cuando el usuario pulsa el enlace de la política en el cotizador o en el pie de página
    Entonces se abre "/privacidad/" con responsable, finalidades, derechos, plazos y canales de contacto

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
