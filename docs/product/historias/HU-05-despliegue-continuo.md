# HU-05: Despliegue continuo en Azure Static Web Apps

- **Épica:** [EP-05](../epicas/EP-05-plataforma-y-calidad.md)
- **Estado:** Pendiente (workflow escrito, no ejecutado contra un recurso real)
- **Prioridad:** Alta

**Como** equipo de desarrollo, **quiero** que cada cambio se pruebe automáticamente y se despliegue desde GitHub, **para** publicar con seguridad y ver una vista previa por PR.

## Alcance

`.github/workflows/azure-static-web-apps.yml`: trabajo `test` (instalación, tipos, pruebas, build del sitio y de la API) y trabajo `build_and_deploy_job` con `Azure/static-web-apps-deploy@v1`; cierre del entorno de vista previa al cerrar el PR. Decisiones: ADR-0002, ADR-0003, ADR-0008.

## Tareas previas (negocio y plataforma)

1. Crear el recurso Static Web Apps (plan Free) en Azure.
2. Cargar el secreto `AZURE_STATIC_WEB_APPS_API_TOKEN` y las variables `PUBLIC_WHATSAPP_NUMBER` y `PUBLIC_SITE_URL` en el repositorio.
3. Configurar las Application settings del servidor (ADR-0008).
4. Proteger la rama `main` (PR obligatorio y CI en verde).

## Criterios de aceptación

```gherkin
Característica: Entrega continua

  Escenario: Pruebas antes de desplegar
    Cuando se abre un PR hacia "main"
    Entonces se ejecutan tipos, pruebas y builds
    Y el despliegue no corre si alguno falla

  Escenario: Vista previa por PR
    Dado un PR con CI en verde
    Entonces se publica un entorno de vista previa con su URL en el PR

  Escenario: Despliegue a producción
    Cuando se fusiona un PR a "main"
    Entonces el sitio y la API se despliegan en producción

  Escenario: La API se compila en el despliegue
    Cuando termina el despliegue
    Entonces "POST /api/quote" responde con la validación esperada en el entorno desplegado

  Escenario: Cierre de vista previa
    Cuando se cierra el PR
    Entonces se elimina su entorno de vista previa
```

## Riesgo abierto

Confirmar que Oryx construye `api/` con el paso de esbuild (ADR-0003). Si no lo hace, se ajusta el flujo para compilar la API antes del despliegue.
