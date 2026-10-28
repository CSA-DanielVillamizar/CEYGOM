# ADR-0007: 404 real y redirecciones 301 de URLs heredadas

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-04

## Contexto

El sitio actual publica páginas como `/productos.html` y `/empresa.html`. Cambiar a URLs limpias sin redirecciones pierde posicionamiento. Un `navigationFallback` en Static Web Apps respondería 200 a rutas inexistentes (soft 404), perjudicial para el indexado.

## Alternativas consideradas

1. **`responseOverrides.404` con `/404.html` y estado 404, más rutas con redirección 301** para cada URL heredada.
2. `navigationFallback`. Adecuado para aplicaciones de una sola página, no para un sitio multipágina.
3. Mantener las URLs `.html`. Contradice la estructura de URLs limpias con barra final.

## Decisión

En `public/staticwebapp.config.json`: redirecciones 301 de `/index.html`, `/empresa.html`, `/productos.html`, `/desarrollos.html` (hacia `/productos/#a-medida`), `/ubicacion.html` y `/contacto.html`; página 404 personalizada con estado 404; cabeceras de caché para `/_astro/*` y `/fichas/*`.

## Consecuencias

- Positivas: se conserva la señal de las URLs antiguas; los buscadores reciben 404 reales.
- Negativas: `desarrollos.html` pierde su página propia hasta que exista contenido de proyectos.

## Verificación

Comprobado en el emulador de Static Web Apps y en producción (2026-10-28): 301 de `/empresa.html` a `/empresa/` y de `/productos.html` a `/productos/`, y 404 real para rutas inexistentes.
