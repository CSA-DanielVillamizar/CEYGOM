# HU-04: Redirecciones de URLs heredadas y página 404 real

- **Épica:** [EP-04](../epicas/EP-04-seo-y-migracion.md)
- **Estado:** Hecha (verificada en el emulador; repetir en el entorno desplegado)
- **Prioridad:** Alta

**Como** responsable de marketing, **quiero** que las URLs antiguas lleven a las nuevas y que las inexistentes devuelvan 404, **para** no perder posicionamiento durante la migración.

## Alcance

`public/staticwebapp.config.json` y `src/pages/404.astro`. Decisión: ADR-0007.

## Criterios de aceptación

```gherkin
Característica: Migración de URLs

  Esquema del escenario: Redirección permanente
    Cuando se solicita "<origen>"
    Entonces se responde 301 con destino "<destino>"

    Ejemplos:
      | origen            | destino             |
      | /index.html       | /                   |
      | /empresa.html     | /empresa/           |
      | /productos.html   | /productos/         |
      | /desarrollos.html | /productos/#a-medida |
      | /ubicacion.html   | /contacto/          |
      | /contacto.html    | /contacto/          |

  Escenario: Ruta inexistente
    Cuando se solicita "/no-existe/"
    Entonces el estado HTTP es 404
    Y se muestra la página con enlaces a productos y al cotizador

  Escenario: Recursos versionados
    Cuando se solicita un archivo bajo "/_astro/"
    Entonces "Cache-Control" es "public, max-age=31536000, immutable"

  Escenario: Cabeceras de seguridad
    Cuando se solicita una página HTML
    Entonces incluye "X-Content-Type-Options: nosniff", HSTS y Content-Security-Policy
```

## Nota

El criterio del destino de `/ubicacion.html` y `/desarrollos.html` puede ajustarse cuando existan páginas propias.
