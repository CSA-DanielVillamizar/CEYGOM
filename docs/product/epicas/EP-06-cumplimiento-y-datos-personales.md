# EP-06: Cumplimiento y protección de datos personales

- **Estado:** En curso
- **Prioridad:** Alta
- **Historias:** [HU-06](../historias/HU-06-consentimiento-habeas-data.md) (parcial)

## Objetivo

Tratar los datos personales de los clientes conforme a la Ley 1581 de 2012 (Habeas Data): finalidad informada, consentimiento previo y datos mínimos.

## Alcance

- Casilla de consentimiento obligatoria en el cotizador, sin persistirla en el navegador.
- Registros del servidor sin nombre, correo ni celular.
- Publicación de la política de tratamiento de datos revisada por el responsable.

## Decisiones relacionadas

ADR-0009, ADR-0006.

## Datos pendientes del negocio

Texto de la política, identificación del responsable del tratamiento y canal para ejercer derechos (consulta, actualización, supresión). El texto legal debe revisarlo quien corresponda; el código solo aloja lo que el negocio apruebe.

## Indicadores de éxito

- Cero datos personales en registros del servidor.
- Política publicada y enlazada desde el cotizador y el pie de página.
