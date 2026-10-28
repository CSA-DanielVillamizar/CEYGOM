# ADR-0014: Lista de cotización y buscador del catálogo en el navegador, sin servidor

- **Estado:** Aceptada
- **Fecha:** 2026-10-28
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-01, EP-02, EP-04, EP-05

## Contexto

El catálogo tiene 49 productos y 369 referencias. Para cotizar, el visitante tenía que volver al cotizador por cada producto y describir la referencia a mano, y no había forma de buscar. Las dos funciones tienen que funcionar sin infraestructura nueva (plan Free), sin sumar JavaScript a las páginas que no las usan y sin guardar datos personales antes de que el visitante envíe la solicitud.

## Alternativas consideradas

1. **Lista en `localStorage` y buscador en el cliente con un índice estático**, con scripts pequeños sin framework y lógica pura compartida y probada.
2. Lista en el servidor (cookie de sesión y almacenamiento propio). Costo, operación y datos personales sin necesidad.
3. Convertir el catálogo en una isla de React con estado. Cargaría el framework en todo el catálogo.
4. Librería de búsqueda estática (por ejemplo Pagefind). Potente, pero de cientos de KB para 49 productos.
5. Servicio externo de búsqueda. Cuenta, costo y datos de terceros.

## Decisión

- **Lista de cotización** (`packages/shared/cart.ts`): líneas de producto o de una referencia concreta con cantidad (máximo 20, el mismo límite de la solicitud), guardadas en `localStorage` (`ceygom-cart-v1`) sin datos personales y con caducidad de 30 días. Lo que viene del almacenamiento se trata como no confiable: se descartan o acotan líneas inválidas, referencias mal formadas, cantidades fuera de rango y caracteres de control, y se muestra siempre con `textContent`. El cotizador la lee con `/cotizador/?lista=1`, solo acepta productos del catálogo y la vacía al enviar con éxito.
- **Referencia por ítem:** el contrato de la solicitud gana el campo opcional `reference` (patrón de los códigos de las fichas, por ejemplo `BP0101`), que viaja al webhook, al mensaje de WhatsApp y al aviso por correo.
- **Buscador** (`packages/shared/search.ts`): por código, nombre o categoría, sin distinguir mayúsculas ni tildes, con todos los términos obligatorios, el código exacto primero y filtro de categoría. El índice (`/productos/search-index.json`, unos 3 KB comprimidos) se genera en el build y se descarga solo cuando el visitante enfoca el buscador o llega con `?q=`.
- Scripts propios sin framework: `site.ts` en todas las páginas (contador y botones "Agregar"), `catalog-search.ts` solo en el catálogo y `cart-page.ts` solo en "Mi cotización". La página de la lista es `noindex` y no entra al sitemap.
- Presupuesto en el CI (`npm run budget`): JavaScript del inicio y de las páginas de producto de 15 KB como máximo, del catálogo de 20 KB y del índice de 15 KB. Hoy: 1,8 KB, 1,8 KB y 4,1 KB, y 3,1 KB.

## Consecuencias

- Positivas: se cotizan varios productos y referencias en una sola solicitud, se encuentra una referencia por su código, sin costo, sin servidores y sin sumar peso al resto del sitio.
- Negativas: la lista vive en un solo navegador (no se comparte entre dispositivos); si el navegador bloquea `localStorage` se avisa y queda el botón "Cotizar solo este producto"; el buscador no corrige errores de escritura ni busca en el texto de las fichas.
- El cotizador crece unos 3 KB (93,5 KB de 200 KB).
- El receptor de Apps Script y su aviso por correo muestran la referencia solo después de desplegar su versión nueva (ADR-0012).
- Pendiente: analítica (HU-09) para medir qué se busca y cuántas listas llegan a envío.

## Verificación

Pruebas de la lista (suma de cantidades, límite de líneas, entradas inválidas, caducidad, almacenamiento bloqueado o corrupto, carga útil maliciosa), del buscador (cada una de las 369 referencias se encuentra por su propio código) y del contrato (referencia válida e inválida, en la API y en el mensaje de WhatsApp). En el navegador: agregar desde resultados de búsqueda y desde la ficha, sumar cantidades, editar y quitar, continuar al cotizador con la referencia precargada, validación de una referencia inválida y vaciado de la lista tras el envío.
