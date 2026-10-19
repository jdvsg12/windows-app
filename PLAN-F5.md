# Plan F5 — PDF con `@react-pdf/renderer`

> Aprobado · 2026-10-17 · **Completado 2026-10-19** (AWA-32 a AWA-41; los números se corrieron: ver HANDOFF) · PRs AWA-32 a AWA-39 (días 5 y 6 del plan)

## Objetivo

Reemplazar `jspdf` + `html2canvas` (vulnerabilidad crítica, PDF hecho de una **imagen**) por PDFs vectoriales generados en el cliente con `@react-pdf/renderer`, y agregar el PDF del plan de corte. Todo debe funcionar **sin internet** (D2, D11).

Qué gana el taller:
- Texto seleccionable y buscable, archivos mucho más livianos, saltos de página limpios (hoy una fila puede quedar cortada a la mitad entre dos páginas).
- Un PDF de corte para el operario: una página por lámina con el dibujo y los códigos `V3-M1`, y en el mismo archivo los cortes de las barras de perfil.

## Decisiones de arquitectura

1. **Un modelo de documento puro, dos renderizadores.** `lib/pdf/cotizacion-modelo.ts` arma un `DocumentoCotizacion` (encabezado, cliente, filas con especificaciones, totales, opciones de mostrar medidas/valores) a partir de proyecto + configuración + costos + contenido. Es una función pura con tests. La vista previa HTML y el PDF consumen **el mismo modelo**, así no se desalinean (hoy `VistaPreviaTab` y `pdf-generatos.ts` duplican todo a mano). El mismo modelo es el que se congela en el snapshot al emitir (D9, AWA-45).
2. **Carga diferida.** `@react-pdf/renderer` (~1 MB) se importa con `import()` solo al pulsar "Descargar PDF"; no pesa en la carga inicial. Corre solo en el cliente, nunca en el servidor.
3. **Fuentes locales.** Geist se registra desde archivos en `public/fonts` (TTF o WOFF; react-pdf no lee WOFF2). Nada se descarga de Google Fonts al generar: funciona sin red.
4. **Colores desde los tokens.** Los estilos del PDF salen de `PAPER` (`lib/design/tokens.ts`) y de `ESTILOS_PERFIL` para las piezas, como ya hace el PDF actual.
5. **Logo:** `lib/logo.ts` ya entrega PNG o JPEG, que react-pdf soporta. Sin cambios.
6. **Versión fijada:** `@react-pdf/renderer@4.9.0` (compatible con React 19).

## PRs

| PR | Qué hace | Cambio visible | Pruebas |
|---|---|---|---|
| **AWA-32** Base | Instala `@react-pdf/renderer`, fuentes locales, `lib/pdf/estilos.ts` desde los tokens, `DocumentoCotizacion` + `armarDocumentoCotizacion()`, helper `descargarPdf(documento, nombre)` con import diferido | Ninguno | Vitest del modelo (filas, totales, especificaciones, opciones, ventanas sin especificaciones) |
| **AWA-33** Cotización en react-pdf | `CotizacionPdf.tsx`: misma estructura que hoy (encabezado, cliente, tabla, totales, forma de pago, datos bancarios, firma). Filas que no se parten entre páginas, encabezado de tabla repetido, número de página. "Descargar PDF" pasa a usarlo. La descripción sale como texto plano hasta AWA-34 | PDF nuevo (vectorial) | Playwright: la descarga es un PDF válido (`%PDF`), nombre del archivo; Vitest del modelo |
| **AWA-34** Texto enriquecido | Parser propio y puro del HTML del editor (solo lo que el editor produce: negrita, cursiva, listas con viñetas y numeradas, alineación izquierda/centro/derecha, saltos de línea) → nodos de react-pdf. Cualquier otra etiqueta se convierte en texto plano (también limpia lo pegado desde Word) | Formato de la descripción en el PDF | Vitest: un caso por comando del editor + HTML pegado raro + vacío |
| **AWA-35** Vista previa + limpieza | La vista previa usa `DocumentoCotizacion` (ver decisión 1 abajo). Se borran `pdf-generatos.ts`, `jspdf` y `html2canvas`. `pnpm audit` sin las críticas de `jspdf` | Vista previa igual o mejor | Playwright de la vista previa; `pnpm audit` |
| **AWA-36** Plan de corte: dibujo | `PlanCortePdf.tsx`: una página por lámina, agrupadas por tipo de vidrio (color + calibre). Dibujo SVG a escala con cada pieza, su código `V3-M1` y medidas; restos (R) y desperdicio (S) marcados. Botón "Descargar plan de corte" en Optimización | PDF de corte nuevo | Vitest del modelo del plan; Playwright de la descarga |
| **AWA-37** Plan de corte: tablas + perfiles | Debajo de cada dibujo, la tabla de piezas de esa lámina. Después, la sección de **barras de perfil** en el mismo PDF: una barra de 6 m por fila, agrupadas por color de aluminio, con sus cortes y el sobrante. Al final, la lista maestra (todas las piezas por ventana) y los totales: láminas por tipo, m², merma (sin la última lámina), bordeado, cantos y barras por color. Si resulta más grande que ¼ de día, la sección de perfiles se separa en su propio PR | Más contenido en el PDF de corte | Vitest con el caso Heliconias (totales ya validados) y con un proyecto de colores mezclados |
| **AWA-38** Versionado | Guarda los 3 últimos PDFs generados por proyecto + uno marcado "guardada" que no se rota. Lista en el cotizador para volver a descargar | Historial de PDFs | Vitest de la rotación (buffer de 3, la "guardada" no sale) |
| **AWA-39** `xlsx` | Reemplaza `xlsx@0.18.5` (sin parche) por SheetJS oficial 0.20.3 desde su tarball fijado. El Excel sale igual | Ninguno | Playwright: el Excel descargado tiene las mismas columnas |

Cada PR sale de `stage`, sigue el flujo de siempre y se puede mergear solo. AWA-33 depende de AWA-32; AWA-35 de AWA-33 y AWA-34; AWA-37 de AWA-36. AWA-38 y AWA-39 son independientes.

## Decisiones tomadas (2026-10-17)

1. **Vista previa (AWA-35): HTML, desde el mismo `DocumentoCotizacion`.** El visor de react-pdf (`PDFViewer`) usa un iframe y Chrome en Android no muestra PDFs dentro de un iframe: en el celular quedaría en blanco. La vista HTML es instantánea, funciona en el celular y no se desalinea del PDF.
2. **Versiones (AWA-38): se guardan los datos, no el PDF.** Cada versión guarda su `DocumentoCotizacion` (unos pocos KB) y el PDF se regenera al descargarlo. `localStorage` (~5 MB en total) no alcanza para PDFs, e IndexedDB llega después (AWA-43); los datos pasan a IndexedDB sin cambios en AWA-44.
3. **Plan de corte: vidrio y perfiles en el mismo PDF.** Las barras de perfil (ya calculadas, separadas por color de aluminio) entran en AWA-37.
4. **Texto fijo de la cotización:** "Anticipo 60%" y "Saldo: pagos parciales según avance de la obra" se quedan como están, en el código.

## Riesgos

- **Turbopack + react-pdf:** si el bundle falla en el cliente, el plan B es cargar react-pdf solo con `import()` dentro del handler (ya previsto) y, si hace falta, configurarlo en `next.config.ts`. Se verifica primero en AWA-32, antes de construir encima.
- **Offline real:** hoy la app no tiene service worker, así que sin red solo funciona si la página ya estaba abierta. Generar el PDF no necesitará red, pero instalar la app como PWA es otra tarea (fuera de F5).
- **Caracteres especiales:** tildes, ñ, `m²` y `·` tienen que estar en la fuente registrada. Se cubre con un caso en las pruebas de AWA-33.
