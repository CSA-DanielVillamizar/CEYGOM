# Preguntas para el equipo de marca (casos que el manual no resolvió)

Surgieron al aplicar la identidad v1. Donde no había indicación se tomó la opción más sobria, anotada aquí.

1. **PDF de "Mi cotización": número de referencia arriba a la derecha.** El manual (07.2) lo pide, pero la lista aún no tiene número: la referencia (COT-AAAA-XXXXXX) nace al enviar la solicitud. Se puso el rótulo "LISTA DE REQUERIMIENTOS" y la fecha, en Plex Mono roja. ¿Se prefiere mostrar el número solo en el correo y en la pantalla de éxito?
2. **Fotos.** *Resuelto de forma provisional:* las fotos van sobre tarjeta blanca plana; los remolinos grises siguen dentro de la foto. ¿Hay originales sin fondo o con fondo blanco?
3. **Imagen para compartir.** Se compuso con el logo A, la frase y dos fotos, con el titular en Arial. El archivo `og/og-ceygom-a.png` de `entrega-equipo-web.zip` no llegó al equipo de desarrollo: ¿se puede reenviar?
4. **Tarjetas de línea con chaflán.** *Resuelto:* borde de dos capas que sigue la diagonal. El archivo `respuestas-preguntas-rebrand.md` con el CSS exacto tampoco llegó; se implementó la técnica equivalente. ¿Coincide con lo esperado?
5. **Archivo.** *Resuelto:* dos instancias estáticas al ancho 118 (700 y 800), 15 KB cada una, generadas del mismo Archivo (OFL) porque `archivo-118-700.woff2` y `archivo-118-800.woff2` de la entrega no llegaron. Las fuentes suman 120 KB. Si se prefieren los archivos del equipo de marca, se reemplazan con los mismos nombres en `src/assets/fonts/`.
6. **Teléfono (604).** Se cambió en el sitio, los correos, los datos estructurados y el enlace `tel:`. El correo de confirmación se volvió a implementar en producción el 25-nov-2026 (versión 5 del script) y se verificó con una solicitud de prueba completa: llegó con logo, trato de usted, teléfono (604) y NIT con puntos.
7. **Política de datos con trato de usted.** El texto legal pasó de "tú" a "usted"; el contenido no cambió, pero conviene que quien revise la política lo vea con el cambio.
8. **Logo B (EMC modernizado).** Si el cliente lo elige, ¿se mantiene el descriptor "Electro Metálicas" y el favicon del kit B (`favicon-emc.svg`)?
