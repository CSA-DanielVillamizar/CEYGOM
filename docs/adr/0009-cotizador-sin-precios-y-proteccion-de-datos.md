# ADR-0009: Cotizador sin precios y tratamiento mínimo de datos personales

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-02, EP-06

## Contexto

No existe una lista de precios confirmada, por lo que calcular valores automáticamente podría comprometer a la empresa con cifras incorrectas. El cotizador recoge datos personales sujetos a la Ley 1581 de 2012 (Habeas Data).

## Alternativas consideradas

1. **Cotizador de solicitud: no calcula precios; un asesor responde con cotización formal.** Datos mínimos y consentimiento explícito.
2. Cálculo automático de precios. Requiere lista oficial y reglas comerciales.

## Decisión

- El cotizador no muestra ni calcula precios.
- `acceptsDataPolicy` es obligatorio (`z.literal(true)`); el consentimiento no se guarda en `sessionStorage`.
- Se almacenan solo los datos necesarios; el celular se normaliza a dígitos y el correo a minúsculas.
- Los registros de la función no contienen nombre, correo ni celular.
- Campo oculto `website` como señuelo contra automatizaciones; si se llena, la función responde 200 sin registrar nada.

## Consecuencias

- Positivas: menor riesgo comercial y de privacidad.
- Negativas: la respuesta de precio depende de un asesor.
- Pendiente de negocio: texto revisado de la política de tratamiento de datos y definición del responsable del tratamiento.

## Verificación

Pruebas de esquema (consentimiento obligatorio) y del handler (señuelo, ausencia de datos personales en registros).
