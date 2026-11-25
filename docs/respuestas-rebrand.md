# Respuestas del equipo de marca a `docs/preguntas-rebrand.md`

PR #35 · rama `feat/rebrand-ceygom` · 25/11/2026

**1. Número de referencia en el PDF de "Mi cotización".**
Aprobado como está: "LISTA DE REQUERIMIENTOS" + fecha en Plex Mono roja. El número COT-AAAA-XXXXXX se muestra en la pantalla de éxito y en el correo de confirmación. Si después del envío se ofrece descargar el PDF otra vez, esa versión sí debe llevar el número en el mismo lugar.

**2. Fotos sobre gris RAL plano.**
No tenemos originales sin fondo; se los pedimos al cliente (está en la lista de pendientes junto con la sesión de fotos). Mientras llegan:
- Si con `multiply` asoman los remolinos, es preferible una **tarjeta blanca plana** (`#FFFFFF`) con la foto tal cual, a un gris manchado.
- No hay que recortar a mano 49 fotos que se van a reemplazar. Si el cliente tarda, el equipo de marca recorta las 14 fotos reales con quitado de fondo y las entrega en PNG transparente.

**3. Imagen para compartir.**
Incluimos tres piezas de 1200 × 630 en Archivo, en `og/`:
- `og-ceygom-neutra.png`: **úsenla ahora**, porque no lleva logo y el cliente todavía no elige.
- `og-ceygom-a.png` y `og-ceygom-b.png`: para cuando elija.

En la vista previa no se debe usar el logo A como si ya estuviera aprobado.

**4. Borde de las tarjetas con chaflán.**
No conviene dejar el borde cortado. Sin SVG se resuelve con dos capas que comparten el mismo `clip-path`:

```css
.card-line{ background:#D7D9D6; padding:1px;               /* el "borde" */
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%); }
.card-line > .inner{ background:#fff; height:100%;
  clip-path:polygon(0 0,calc(100% - 13.6px) 0,100% 13.6px,100% 100%,0 100%); }
```

Así el borde de 1 px sigue la diagonal. Si el hover cambia el color del borde, se cambia el `background` del contenedor.

**5. Peso de Archivo.**
Adjuntamos Archivo **estática ya al 118 % de ancho**, solo con caracteres latinos y del español, en `fuentes/`:

| Archivo | Peso | Tamaño |
|---|---|---|
| `archivo-118-700.woff2` | 700 | 10 KB |
| `archivo-118-800.woff2` | 800 | 10 KB |

Reemplazan al archivo variable de 90 KB **sin cambiar el aspecto**. Al usarlas:
- Declaren `@font-face` con `font-weight` 700 y 800 y **quiten `font-stretch: 118%`**, porque el ancho ya viene incorporado.
- Pueden quitar también Plex Mono 500 y usar solo 400.
- Las tres familias deberían quedar por debajo de 100 KB.

**6. Teléfono (604) en el correo de producción.**
Correcto, no bloquea. Re-implementen el script cuando se fusione el PR o antes si hay una ventana. Mientras tanto no hace falta tocar producción.

**7. Política de datos con trato de usted.**
De acuerdo. Queda en la lista de pendientes del cliente: la revisión de su abogado se hace sobre la versión en usted.

**8. Si el cliente elige el logo B.**
Sí a las dos cosas:
- Se mantiene el bloque completo: monograma EMC + separador + "ELECTRO METÁLICAS / CEYGOM" (`emc-horizontal*.svg`). El monograma solo, sin "Ceygom", queda únicamente para troquel, placas y sellos.
- El favicon y el avatar son `favicon-emc.svg` (la E con los tres módulos rojos).

---

**Pendiente del lado del equipo web:** probar la vista previa en un teléfono real (Android de gama media y iPhone) antes de enviarla al cliente. Revisar sobre todo la barra inferior, el menú, el cotizador y el PDF.
