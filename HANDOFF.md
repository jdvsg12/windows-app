# Handoff — windows-app

> Última actualización: 2026-10-19 (días 5 y 6: F5 completa, AWA-32 a AWA-41; release AWA-43 abierto)

Este archivo es el punto de entrada para retomar el trabajo: qué se hizo, qué falta y cómo se trabaja de ahora en adelante. Se actualiza en cada sesión relevante, no solo al cerrar una fase.

---

## Flujo de trabajo (obligatorio)

- **Solo dos ramas permanentes: `main` y `stage`.**
  - `main` = producción (`https://windows-app-gilt.vercel.app`, protegido con SSO de Vercel).
  - `stage` = test / staging en Vercel.
- **Nunca commitear directo a `main` ni a `stage`.** Todo cambio entra por Pull Request: rama nueva → PR → revisión.
- 🔴 **Regla de oro: ningún PR se mergea sin que el usuario lo indique explícitamente.** El harness de Claude Code además bloquea el merge de PRs a nivel de herramienta ("Merge Without Review") — el usuario tiene que mergear él mismo (botón en GitHub o `gh pr merge <n> --merge --delete-branch`), sea desde GitHub o pidiéndolo en el chat.
- **Nomenclatura de ramas y PR: `AWA-<número>`**, incremental, en el orden en que se van creando. El número no se reutiliza ni se salta, aunque una rama termine sin usarse. Si entra una tarea no planeada, toma el siguiente número y las del plan se corren uno.
  - Rama: `AWA-<número>-nombre-corto`. Título del PR: `AWA-<número>: descripción breve`.
- **Flujo completo:** rama nueva desde `stage` → cambios → PR **a `stage`** → **esperar OK del usuario** → merge → verificar en el deploy de staging → PR de `stage` a `main` → **esperar OK del usuario** → merge.
  - El botón "Create PR" de la app propone `main` como base: los PRs de tareas se abren igual contra `stage` y se avisa en la respuesta.
- Commits en inglés, imperativo presente (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`), según `AGENTS.md`. Un commit = un cambio lógico.
- **Nunca sobrescribir `localStorage`/IndexedDB del navegador del usuario.** Pruebas visuales en un puerto aislado (`pnpm dev -p 3100` = otro origen), datos de prueba borrados al terminar la verificación. Next solo permite un `next dev` por carpeta: para usar el 3100 hay que parar el del 3000 y volver a levantarlo al terminar.
- **Antes de mergear un PR nuevo, sincronizar la rama contra el `stage` más reciente** (rebase/merge) y confirmar que el CI pasa ahí.
- 🔴 **No apilar PRs (base = otra rama de tarea).** Todo PR va **contra `stage`**, aunque dependa de otro abierto (su diff muestra también los commits del otro hasta que entre). Lo que pasó con la pila AWA-33 → 34 → 35: al mergear #35 GitHub borró su rama, **cerró #36 sin mergear** (se quedó sin base) y #37 se mergeó en la rama de AWA-34 en vez de en `stage`; hubo que reabrir todo como #38.
- Después de que el usuario dice "mergeado", **comprobar con `gh pr view <n> --json state`** antes de construir encima: varias veces seguía abierto (`gh pr list` también puede mostrar un estado viejo).
- **Antes de cambiar el comportamiento del motor, capturar las salidas actuales en tests** (caracterización). Si un snapshot cambia, revisar el diff: solo debe cambiar lo que se quiso cambiar.

### Comandos de verificación

| Comando | Qué corre |
|---|---|
| `pnpm exec tsc --noEmit` | Tipos |
| `pnpm lint` | ESLint (hoy: 0 errores, 3 avisos de `<img>` en vistas con imágenes data URL) |
| `pnpm test` | Vitest: 421 tests en 19 archivos |
| `pnpm test:e2e` | Playwright: 21 tests × escritorio y móvil (Pixel 7) = 42, en 8 archivos. Levanta su propio build en el puerto **3200** y cada test usa un navegador limpio: nunca toca el servidor ni los datos del desarrollador. El build revisa tipos de `e2e/` también: un spec temporal con errores tumba el servidor de pruebas |
| `pnpm build` | Build de producción |

---

## Estado actual (2026-10-19)

- **`main`** tiene el release AWA-31 (#33): todo hasta AWA-30 (F3 completa).
- **`stage`** tiene además AWA-32 a AWA-41 (**F5 completa** + arreglos). CI en verde.
- **Abierto:** AWA-42 (este HANDOFF) y **AWA-43, release `stage → main`**. Revisar staging antes de mergear el release (ver "Cómo continuar").
- **Siguiente bloque:** descuento de proveedor (necesita una respuesta del usuario) y local-first (repositorios + IndexedDB).

### Hecho en los días 5 y 6 (2026-10-17 / 19) — F5 PDF

| PR | Tarea | Qué quedó |
|---|---|---|
| #33 AWA-31 | Release `stage → main` | Producción al día hasta AWA-30 |
| #34 AWA-32 | Base de react-pdf | `@react-pdf/renderer` 4.9.0 cargado con `import()` solo al descargar; Geist local en `public/fonts/geist` (sin CDN); `DocumentoCotizacion` (Zod) + `armarDocumentoCotizacion`: **una sola fuente** para vista previa, PDF, versiones y el futuro snapshot. `PLAN-F5.md` con las 4 decisiones |
| #35 AWA-33 | Cotización en react-pdf | PDF vectorial con texto seleccionable; encabezado de tabla repetido, filas que no se parten, "Página X de Y". ⚠️ react-pdf 4.9: `lineHeight` en la página oculta los textos con `render` y en un `View` se aplica doble: no se usa |
| #38 AWA-34 + 35 | Formato del editor + vista previa desde el modelo | `parsearTextoEnriquecido` (puro, sin DOM, probado con HTML real del editor): negrita, cursiva (Geist 1.7.2 con cursivas reales), listas, alineación. La vista previa usa el mismo modelo y el mismo intérprete (se quitó `dangerouslySetInnerHTML`). **Se eliminaron `jspdf` y `html2canvas`** (críticas 2 → 0). Arreglo: `useContenidoCotizacion` devolvía `{}` en el primer render. *(Reabierto de #36/#37, ver la regla de no apilar)* |
| #39 AWA-36 | Plan de corte en PDF | Botón "Descargar plan de corte" en Optimización. Una página por lámina (vertical u horizontal según la lámina), agrupadas por tipo de vidrio, dibujo a escala: piezas por tipo de hoja con código `V3-M1` y medida, restos (R) y desperdicio (S), leyenda. `useDescargaPdf` genérico |
| #40 AWA-37 | Prueba del flujo completo + 🔴 `cotizador?id=null` | Playwright crea un proyecto de 3 ventanas con todas las especificaciones y revisa cada pantalla y los dos PDF. Bug: desde un proyecto, el enlace "Calculadora" dejaba abierto el proyecto anterior y "Cotizar" iba a `/cotizador?id=null` |
| #41 AWA-38 | Plan de corte completo | Tabla de piezas bajo cada dibujo; **barras de perfil** (por color y perfil, a escala, con sobrante, coma decimal); lista maestra ordenada por ventana; totales (láminas por tipo, piezas, m², bordeado, cantos, merma, barras y metros por color). `LONGITUD_BARRA` pasa a `calculo/comun.ts` |
| #42 AWA-39 | Versiones del PDF | Se guardan las **3 últimas + 1 "guardada"** por proyecto (`Proyecto.versionesCotizacion`), **los datos y no el archivo**, sin logo ni firma (peso). Volver a descargar regenera igual que entonces, con el logo actual. `useProyecto.update` ahora trabaja sobre el proyecto más reciente |
| #43 AWA-40 | `xlsx` → SheetJS 0.20.3 oficial | Tarball de `cdn.sheetjs.com` con hash fijado en el lockfile; se carga al exportar. Prueba e2e que relee el Excel |
| #44 AWA-41 | Mejoras de la cotización (desde la cotización de Word C075 del taller) | "Girardot, 18 de octubre de 2026"; dirección de la obra; **tiempo de entrega** y **validez** (por defecto 25 y 15 días hábiles); fila TOTAL en la tabla; **firma escaneada** opcional en Configuración. 🔴 Arreglos: el autoguardado **perdía lo último escrito al cambiar de pestaña** (se cancelaba al desmontar) y subir el logo pisaba un campo recién escrito |

Días 1 a 4 (AWA-12 a AWA-30): especificaciones de ventana y precios de vidrio, upgrade de Next, tipos desde Zod, `useCalculo`, merma, códigos de pieza, Heliconias, precios por tipo. El detalle está en las tablas siguientes y en el historial de git.

### Hecho en los días 2 y 3 (2026-10-10 / 11)

| PR | Tarea | Qué quedó |
|---|---|---|
| #21 AWA-16 | `ContenidoTab` | Fecha, cliente, descripción y opciones se guardan en el proyecto (`contenidoCotizacion`, con `.default()`); react-hook-form + autoguardado. La fecha es la del día hasta que se edita algo. Arregló que Cliente abriera vacío |
| #18 AWA-17 | Borrar proyecto en móvil | Los botones dentro de un `DialogTrigger asChild` perdían el tamaño táctil de 44 px (D5); arreglado en `globals.css` |
| #19 / #20 AWA-18/19 | Tipos desde Zod | `Ventana`, `Proyecto`, sus opciones y las 4 configuraciones salen de `z.infer`. Las 11 interfaces que quedan en `types.ts` no tienen esquema (salidas del motor) |
| #22 AWA-20 | `useCalculo` | El plan de corte es la función pura `calcularPlanCorte` (`lib/calculo/plan.ts`) memoizada por `useCalculo`; el costeo es un `useMemo` sobre `intentarCosteo`. Autoguardar el contenido ya no recalcula costos |
| #24 AWA-21 | Merma, bordeado y cantos | `calcularMetricasVidrio` + resumen en Optimización. Merma = vidrio de lámina que no queda en piezas (restos incluidos), **sin la última lámina de cada tipo de vidrio** (definición confirmada por el usuario) |
| #23 AWA-22 | 🔴 Bug del transporte (no planeado) | Vaciar Transporte/Duración guardaba `null` y **todos los proyectos desaparecían** del dashboard. `ProyectoSchema` repara esos campos con `.catch()` (los proyectos ocultos vuelven) y el formulario no guarda vacíos. Los campos de precio tenían un "0" pegado ("045000"): nuevo `components/common/NumberInput`. Se agregó **Playwright** |
| #25 AWA-23 | Códigos de pieza | `V3-M1` = ventana 3 del proyecto, hoja móvil 1. Hojas numeradas desde la fija (F1, M1, M2…), cerradura en la última móvil: no depende de en qué extremo va la fija. Se ven en Optimización, Materiales, tarjetas (`V1`) y Excel |
| #26 AWA-24 | Heliconias | **7 láminas es el mínimo para cualquier acomodo** (17 piezas largas que solo se apilan) y un **plan de referencia de 7** validado como guillotina. El optimizador sigue en 8 (llegar a 7 tomó ~84 s de búsqueda). Nota de por qué no se usó una librería en `vidrio.ts` |

### Pendientes que siguen abiertos

- ⚠️ Cambiar un precio desde el cotizador cambia el precio **global**, no el de esa cotización. Se resuelve con el snapshot al emitir (D9, AWA-48).
- Los precios por tipo de cerradura y rodachina arrancan vacíos (= precio general). **Falta que el usuario cargue los precios reales** en Admin → Precios.
- **Offline real:** generar PDF/Excel no usa red, pero la app no tiene service worker: sin red solo funciona si la página (y los chunks de react-pdf/SheetJS y las fuentes) ya estaban cargados. Instalarla como PWA es una tarea aparte.
- `eslint-config-next` está en `dependencies` y debe ir en `devDependencies`: hoy hace que `pnpm audit --prod` muestre 23 avisos altos que son solo de herramientas de build/lint.
- Playwright no corre en el CI de GitHub Actions (falta el paso que instala el navegador).
- Si la lámina de diferencia en Heliconias importa en obras reales: botón "Optimizar a fondo" que corra la búsqueda exhaustiva en un Web Worker.
- `DatosEmpresa` y `DatosBancarios` en `types.ts` no se usan (código muerto).
- La X de cerrar de los diálogos mide 16 px en pantallas táctiles (el botón Cancelar sí cumple 44 px).
- ⚠️ Con el bug de AWA-22, si alguien creó un proyecto nuevo mientras los demás estaban ocultos, la lista guardada se sobrescribió: esos proyectos no se recuperan.

---

## Seguridad — estado

1. ✅ **Deploy público — resuelto.** `windows-app-gilt.vercel.app` responde `302` a `vercel.com/sso-api` (SSO en todos los deploys).
2. ✅ **Datos reales de la empresa fuera del código (AWA-7).** Se leen de 9 variables `NEXT_PUBLIC_COMPANY_*` cargadas en Vercel.
   - ⚠️ **Esto NO borra el historial de git** — los datos siguen legibles en commits viejos. Reescribirlo (force-push) necesita aprobación explícita aparte; no se hizo.
3. **Contraseña de admin (`admin123`)** — decisión del usuario: se deja "para probar" hasta F4 (Supabase auth). No está resuelto.
4. **Revocar el token de GitHub viejo** que estaba en la URL del remoto — pendiente, lo hace el usuario.
5. ✅ **Next.js** actualizado a 16.3.8 (AWA-14), cierra el RCE de 16.0.11.
6. ✅ **`jspdf` y `html2canvas`** eliminados (AWA-35, PR #38): el PDF es `@react-pdf/renderer`. `pnpm audit --prod` sin críticas.
7. ✅ **`xlsx`** reemplazado por SheetJS 0.20.3 oficial (AWA-40).
8. ✅ La descripción de la cotización ya no se inyecta como HTML en la vista previa (AWA-35): un `<img onerror>` pegado no se ejecuta.

### Entornos Vercel
- Confirmar que `stage` tenga un dominio fijo de pruebas en vez de URLs de preview que cambian en cada push.
- Confirmar que la protección SSO de staging esté activa (ya lo está en `main`).

---

## Plan de escalamiento — avance

Referencia: el prompt de arquitectura (decisiones D1–D13, fases F1–F5 y módulo optimizador de vidrio). Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Verificado contra el código en `stage` (2026-10-19).

### Decisiones cerradas

| | Decisión | Estado | Evidencia / qué falta |
|---|---|---|---|
| D1 | Solo 80-25 habilitada | ✅ | `lib/calculo/registro.ts`; el formulario deshabilita las no validadas |
| D2 | Offline-first, motor y PDF en cliente | 🟡 | Motor puro ✅; PDF y Excel en el cliente sin red ✅. Falta service worker para abrir la app sin red |
| D3 | Vercel + Supabase us-east | 🟡 | Vercel ✅ (con SSO). Supabase ⬜ (F4) |
| D4 | Marca ALUVE en tokens, sin modo oscuro | ✅ | `globals.css` + `lib/design/tokens.ts`, con tests |
| D5 | Touch targets ≥44 px con `pointer: coarse` | ✅ | `globals.css`; desde AWA-17 también los botones dentro de un `*Trigger asChild` |
| D6 | Paleta de piezas por tipo de perfil + segundo indicador | ✅ | `lib/design/piezas.ts` (códigos F/M, R/S) + códigos `V3-M1` (AWA-23) |
| D7 | Autosave con debounce + indicador | 🟡 | ConfiguracionTab, datos del proyecto y ContenidoTab ✅; guarda lo pendiente al cambiar de pestaña (AWA-41). Estado "offline" ⬜ (AWA-49) |
| D8 | Costeo por absorción en el tiempo | 🟡 | Cascada única en `costeo.ts` ✅, vidrio por tipo y recargo por color ✅. Precio por tipo de cerradura/rodachina ✅ (AWA-28). ⬜ descuento de proveedor (AWA-44) |
| D9 | Snapshot al emitir cotización | ⬜ | AWA-48, junto con el número de cotización (decisión del usuario: se asigna al emitir) |
| D10 | Roles owner/operario | ⬜ | F4 (sigue `admin123`) |
| D11 | PDF con `@react-pdf/renderer` | ✅ | Cotización, plan de corte y versiones (F5) |
| D12 | Vitest como dev dep | ✅ | 421 tests + Playwright (8 specs, 42 casos) |
| D13 | Logo ≤512 KB y ≤400 px | ✅ | `lib/logo.ts` |

### Fases

**F1 — Tokens de diseño · ✅ completa**

**F2 — Componentes reutilizables · ✅ completa**
- ✅ `PageHeader`, `StatCard`, `EmptyState`, `SectionTitle`, `NumberInput`; `lib/format.ts`; `CreateProjectForm` compartido.
- ✅ `ConfiguracionTab` y `ContenidoTab` con react-hook-form + Zod + autosave.
- ✅ Botón borrar proyecto en móvil (AWA-17).

**F3 — Motor de cálculo isomorfo · ✅ completa (con AWA-29)**
- ✅ Caracterización del motor 80-25, motor puro, contrato + registro, costeo D8, optimizador de vidrio.
- ✅ Tipos derivados de Zod (AWA-18/19).
- ✅ `useCalculo` + `calcularPlanCorte` (AWA-20).
- ✅ Ganchos de grano e inventario de restos (AWA-26), precio por tipo de cerradura/rodachina (AWA-28), especificaciones en la cotización (AWA-29).
- ⬜ Backlog: motores 50-20 / 70-44 / 70-38 (uno por PR, cuando el usuario entregue fórmulas y casos).

**F4 — Supabase · ⬜ sin empezar** — esquema con `organization_id` + RLS, auth y roles (quitar `admin123`), sincronización, logo en Storage, tests de RLS + seed del piloto.

**F5 — PDF con react-pdf · ✅ completa (AWA-32 a AWA-41)**
- ✅ Cotización en react-pdf, formato del editor, vista previa desde el mismo modelo, versiones (3 + guardada), plan de corte de vidrio y perfiles, `xlsx` oficial, mejoras tomadas de la cotización de Word del taller.
- Decisiones en `PLAN-F5.md`: vista previa en HTML (el visor de PDF no se ve en Android), versiones como datos, vidrio y perfiles en el mismo PDF, texto de forma de pago fijo.

### Módulo optimizador de corte de vidrio

| Requisito | Estado | Evidencia / qué falta |
|---|---|---|
| Módulo puro isomorfo, testeable | ✅ | `lib/calculo/vidrio.ts` + `vidrio.test.ts` |
| Cortes guillotina | ✅ | Verificado con `esGuillotina` (helper de tests) |
| Documentar librería elegida vs. propia | ✅ | Encabezado de `vidrio.ts` (AWA-24) |
| Kerf configurable, default 0 | ✅ | `precios.kerfVidrio` |
| Tamaño de lámina, una sola fuente | ✅ | `precios.tamanoLamina` |
| Mínimo de resto reutilizable | ✅ | `precios.minRestoVidrio` (200 mm) |
| Clasificación resto (R) / desperdicio (S) | ✅ | `RestoLamina.tipo` |
| Costo por láminas enteras × precio | ✅ | `costeo.ts`, por tipo de vidrio |
| Merma % excluyendo la última lámina | ✅ | `calcularMetricasVidrio` (AWA-21), por tipo de vidrio |
| Etiquetas de pieza `V3-M1` | ✅ | `lib/calculo/codigos.ts` (AWA-23) |
| Caso Heliconias (29 piezas, 40,063 m², 146,490 m / 116 cantos) | ✅ | Totales ✅. Láminas: mínimo demostrado 7, plan de referencia de 7; el optimizador da 8 (aceptado ≤8) |
| Láminas separadas por color/calibre | ✅ | Costeo y pestaña Optimización (AWA-13) |
| Gancho para dirección/grano del vidrio | ✅ | `permitirGiro` (AWA-26); falta la opción en la ventana |
| Gancho para inventario de restos | ✅ | `restosInventario` (AWA-26); falta guardar el inventario |
| PDF del plan de corte | ✅ | `PlanCortePdf` (AWA-36/38): una página por lámina, tablas, perfiles, lista maestra, totales |
| Snapshot del plan de corte al emitir | ⬜ | AWA-48 (`DocumentoPlanCorte` ya tiene esquema Zod) |

---

## Plan de trabajo (revisado 2026-10-19)

Decisiones del usuario que siguen vigentes:
- **Referencias nuevas (50-20, 70-44, 70-38)** fuera del calendario fijo: cada una entra cuando llegan sus fórmulas, descuentos y casos (~3 PRs por referencia).
- **Supabase va de último** (objetivo: varios usuarios). Lo local-first que no lo necesita se adelanta.
- **Número de cotización** (como el "C075" de Word): se asigna **al emitir**, con el snapshot; el usuario elige el número inicial.

Días 1 a 6 cumplidos. Los números se corrieron otra vez (AWA-37 fue la prueba del flujo completo y AWA-41 las mejoras de la cotización):

| Bloque | PRs |
|---|---|
| Cierre F5 | **AWA-42** este HANDOFF · **AWA-43** release `stage → main` |
| Descuentos | **AWA-44** descuento de proveedor (D8) — necesita la respuesta del usuario |
| Local-first | **AWA-45** interfaz de repositorios (`storage.ts` detrás, sin cambiar comportamiento) · **AWA-46** repositorio IndexedDB · **AWA-47** migración `localStorage → IndexedDB` con respaldo JSON y validación Zod |
| Emitir | **AWA-48** emitir cotización: snapshot (precios, plan de corte) + número consecutivo · **AWA-49** indicador offline en el autoguardado (D7) · **AWA-50** release |

Después, sin fecha fija: referencias nuevas según lleguen; **F4 Supabase — multiusuario** (~12 PRs); PWA / service worker; Playwright en el CI; arreglos chicos de "Pendientes".

Bloqueos que dependen del usuario:
- **Antes de AWA-44:** cómo funciona el descuento de proveedor (¿% general, por perfil, por proveedor?).
- **Antes de AWA-48:** número inicial de las cotizaciones y su formato (¿`C-0076`?).
- Cargar en Admin → Precios el precio real de cada tipo de cerradura y rodachina.
- Confirmar las listas de colores de vidrio y de aluminio, y si el recargo % por color sirve.
- En qué extremo va la hoja fija (solo para un futuro dibujo de la ventana).
- **Para F4:** crear el proyecto de Supabase (us-east) y definir el alta de usuarios.
- Manual: revocar el token viejo de GitHub.

## Cómo continuar

1. Mergear AWA-42 (este HANDOFF).
2. **Antes del release AWA-43**, revisar en el deploy de `stage`: descargar una cotización (con logo, firma, entrega y validez) y un plan de corte; exportar el Excel; volver a descargar una versión guardada.
3. Mergear el release AWA-43 → producción.
4. Responder cómo funciona el descuento de proveedor para arrancar AWA-44.

### Notas de entorno (sesión 2026-10-19)
- Máquina del usuario: `pnpm`, `gh` y Node 20 en el PATH. `gh` tiene dos cuentas (`jdvsg12` y `dev2-prog`); este repo usa **`jdvsg12`**: el remoto lleva el usuario en la URL y `.envrc` (direnv, ignorado por git) fija `GH_TOKEN` de esa cuenta. Desde Claude Code, `direnv exec . gh …`. Para `git push`, el helper de credenciales por defecto entra como `dev2-prog` (403): usar `direnv exec . git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`.
- Puertos: **3000** = servidor de desarrollo del usuario (`.claude/launch.json`, config `dev`), **3100** = pruebas visuales aisladas (config `dev-test`), **3200** = Playwright.
- El navegador de Playwright (chromium v1248) ya está en `~/.cache/ms-playwright`.
- Para revisar un PDF generado: `pdftotext`, `pdffonts` y `pdftoppm` (poppler) están instalados; el panel del navegador no muestra PDFs en iframes.
- `pkill -f next-server` mata **cualquier** servidor Next, incluido el `pnpm dev` del usuario en el 3000: no usarlo; parar solo el proceso propio.
