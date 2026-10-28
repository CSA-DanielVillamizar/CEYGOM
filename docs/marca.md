# Marca: logo, favicon e imagen para compartir

## Qué hay y de dónde sale

| Pieza | Archivo | Origen |
|---|---|---|
| Logo del encabezado | `src/assets/brand/logo-emc.webp` | Recorte (186×146 px) del monograma "EMC" del banner de la web actual de la empresa, con su fondo oscuro |
| Imagen para compartir (1200×630) | `src/assets/brand/og-default.jpg` | Compuesta con el logo, el nombre de la empresa y dos fotos de producto |
| Favicon | `public/favicon.svg` | Provisional: cuadrado rojo con las letras "EMC", escrito a mano. No es el logo de la empresa |
| Ícono de iPhone y iPad | `public/apple-touch-icon.png` | Generado a partir del favicon |

`node scripts/brand/make-brand-assets.mjs <carpeta-con-banner.png>` regenera el logo, la imagen para compartir y el ícono. Se usa en el encabezado, en los datos estructurados `LocalBusiness` del inicio y como imagen por defecto de las páginas.

## Pendiente con la empresa

- **Logo vectorial (SVG) o en alta resolución.** El actual es un recorte de baja resolución de un banner; se ve bien a 40 px de alto, pero no escala. Al recibirlo, reemplazar `logo-emc.webp` y construir de él el favicon.
- **Colores y tipografía oficiales** (hoy el rojo `#c8102e` y los grises acero del sitio son una aproximación al logo).
- **Razón social.** El banner dice "S.A.S."; hay que confirmarla antes de publicarla en la política de datos (`src/data/legal.ts`).
- Fotos reales de planta y de productos instalados para el inicio.
