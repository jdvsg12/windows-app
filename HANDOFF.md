# Handoff — windows-app

> Última actualización: 2026-10-17 (cierre del día 4 del plan: AWA-26 a AWA-29; F3 completa)

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
- **Antes de cambiar el comportamiento del motor, capturar las salidas actuales en tests** (caracterización). Si un snapshot cambia, revisar el diff: solo debe cambiar lo que se quiso cambiar.

### Comandos de verificación

| Comando | Qué corre |
|---|---|
| `pnpm exec tsc --noEmit` | Tipos |
| `pnpm lint` | ESLint (hoy: 0 errores, 2 avisos de `<img>` ya existentes) |
| `pnpm test` | Vitest: 347 tests en 13 archivos (con AWA-24) |
| `pnpm test:e2e` | Playwright: 13 tests × escritorio y móvil (Pixel 7). Levanta su propio build en el puerto **3200** y cada test usa un navegador limpio: nunca toca el servidor ni los datos del desarrollador |
| `pnpm build` | Build de producción |

---

## Estado actual (2026-10-17)

- **`main`** tiene el release AWA-27 (#29): todo hasta AWA-26, incluido el arreglo crítico del transporte (AWA-22).
- **`stage`** tiene además AWA-28 (#30). **Falta un release `stage → main`** (AWA-31) para llevar AWA-28 y AWA-29 a producción.
- **Abierto, esperando revisión:** AWA-29 (#31, especificaciones en la cotización y el PDF) y AWA-30 (este HANDOFF).
- **Con AWA-29, F3 queda completa** (salvo las referencias nuevas, que entran cuando lleguen sus fórmulas).
- **Siguiente:** release AWA-31 y el plan detallado de F5 para aprobación (bloquea el día 5).

### Hecho en el día 4 (2026-10-11 / 17)

| PR | Tarea | Qué quedó |
|---|---|---|
| #26 AWA-24 · #27 AWA-25 | Heliconias + HANDOFF del día 3 | Mergeados |
| #28 AWA-26 | Ganchos de grano e inventario de restos | `VidrioCorte.permitirGiro: false` = vidrio con grano o diseño: el empaquetador nunca lo gira, y una pieza que solo cabe girada es error. `OpcionesOptimizacionVidrio.restosInventario`: los restos guardados se usan antes de abrir láminas nuevas (el más chico que sirva primero). **La app todavía no pasa ninguno de los dos** (no hay opción de vidrio con diseño ni inventario guardado): ningún plan cambió |
| #29 AWA-27 | Release `stage → main` | Producción al día hasta AWA-26 |
| #30 AWA-28 | Precios del cotizador completos | `preciosCerradura` / `preciosRodachina` por tipo (con `.default({})`); **un tipo sin precio propio usa el `precioCerradura` / `precioRodachina` de siempre**, así que ninguna cotización cambió. El costeo cobra las cerraduras y rodachinas de cada ventana a su precio (`accesoriosPorVentana`, `precioPorTipo` en `lib/precios.ts`). El cotizador tiene la sección "Precios según lo elegido en cada ventana" (recargo por color de aluminio, vidrio color × calibre, sandblasting, cerradura y rodachina) reutilizando los componentes de Admin. Playwright lo cubre |
| #31 AWA-29 | Especificaciones en la cotización y el PDF (abierto) | Vista previa y PDF `jspdf` muestran, bajo el tipo de cada ventana: aluminio, cerradura, rodachina, calibre, color de vidrio y sandblasting. Helper compartido `especificacionesVentana` en `lib/types.ts` (también lo usan las tarjetas). Las ventanas sin especificaciones no muestran la línea. Cambio mínimo en el PDF a propósito: F5 lo reescribe. **Falta descargar el PDF en staging y revisarlo** |

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

- ✅ Precios del cotizador incompletos: resuelto en AWA-28.
  - ⚠️ Sigue igual: cambiar un precio desde el cotizador cambia el precio **global**, no el de esa cotización. Se resuelve con el snapshot al emitir (D9, AWA-45).
  - Los precios por tipo de cerradura y rodachina arrancan vacíos (= precio general). **Falta que el usuario cargue los precios reales** en Admin → Precios.
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
6. **`jspdf`** (crítica, HTML injection): solo cliente y datos propios; F5 lo reemplaza por `@react-pdf/renderer`.
7. **`xlsx`** sin parche; la app solo escribe archivos. Evaluar SheetJS oficial (0.20.3) o aceptar el riesgo (AWA-39).

### Entornos Vercel
- Confirmar que `stage` tenga un dominio fijo de pruebas en vez de URLs de preview que cambian en cada push.
- Confirmar que la protección SSO de staging esté activa (ya lo está en `main`).

---

## Plan de escalamiento — avance

Referencia: el prompt de arquitectura (decisiones D1–D13, fases F1–F5 y módulo optimizador de vidrio). Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Verificado contra el código en `stage` (+ AWA-24).

### Decisiones cerradas

| | Decisión | Estado | Evidencia / qué falta |
|---|---|---|---|
| D1 | Solo 80-25 habilitada | ✅ | `lib/calculo/registro.ts`; el formulario deshabilita las no validadas |
| D2 | Offline-first, motor y PDF en cliente | 🟡 | Motor puro isomorfo en `lib/calculo/` ✅. El PDF sigue en `jspdf`/`html2canvas` (F5) |
| D3 | Vercel + Supabase us-east | 🟡 | Vercel ✅ (con SSO). Supabase ⬜ (F4) |
| D4 | Marca ALUVE en tokens, sin modo oscuro | ✅ | `globals.css` + `lib/design/tokens.ts`, con tests |
| D5 | Touch targets ≥44 px con `pointer: coarse` | ✅ | `globals.css`; desde AWA-17 también los botones dentro de un `*Trigger asChild` |
| D6 | Paleta de piezas por tipo de perfil + segundo indicador | ✅ | `lib/design/piezas.ts` (códigos F/M, R/S) + códigos `V3-M1` (AWA-23) |
| D7 | Autosave con debounce + indicador | 🟡 | ConfiguracionTab, datos del proyecto y ContenidoTab ✅. Estado "offline" ⬜ (AWA-46) |
| D8 | Costeo por absorción en el tiempo | 🟡 | Cascada única en `costeo.ts` ✅, vidrio por tipo y recargo por color ✅. Precio por tipo de cerradura/rodachina ✅ (AWA-28). ⬜ descuento de proveedor (AWA-41) |
| D9 | Snapshot al emitir cotización | ⬜ | AWA-45 |
| D10 | Roles owner/operario | ⬜ | F4 (sigue `admin123`) |
| D11 | PDF con `@react-pdf/renderer` | ⬜ | F5 |
| D12 | Vitest como dev dep | ✅ | 366 tests (con AWA-29) + Playwright para e2e (4 specs) |
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

**F5 — PDF con react-pdf · ⬜ sin empezar** — cotización y archivos de corte en `@react-pdf/renderer`, versionado, mapeo del editor de texto enriquecido, vista previa. Cierra la vulnerabilidad de `jspdf`.

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
| PDF del plan de corte | ⬜ | F5 (AWA-36/37) |
| Snapshot del plan de corte al emitir | ⬜ | AWA-45 |

---

## Plan de trabajo — 4 PRs por día (revisado 2026-10-17)

Decisiones del usuario que siguen vigentes:
- **Referencias nuevas (50-20, 70-44, 70-38)** fuera del calendario fijo: cada una entra cuando llegan sus fórmulas, descuentos y casos (~3 PRs por referencia).
- **Supabase va de último** (objetivo: varios usuarios). Lo local-first que no lo necesita se adelanta.

Días 1 a 4 cumplidos (AWA-12 a AWA-29, ver "Hecho"). Los números se corrieron dos veces más: AWA-30 es esta actualización del HANDOFF y AWA-31 el release que cierra el día 4, así que todo lo que sigue sube 2.

| Día | PRs | Bloque |
|---|---|---|
| 4 | ✅ **AWA-26** ganchos de grano e inventario de restos · ✅ **AWA-27** release · ✅ **AWA-28** precios del cotizador completos · 🟡 **AWA-29** especificaciones en la cotización (#31 abierto) · **AWA-30** este HANDOFF · **AWA-31** release `stage → main` | Cierre de F3 |
| 5 | **AWA-32** base de `@react-pdf/renderer` · **AWA-33** cotización en react-pdf · **AWA-34** mapeo del editor de texto enriquecido · **AWA-35** vista previa con el visor; se quitan `jspdf`/`html2canvas` | F5 PDF |
| 6 | **AWA-36** PDF del plan de corte: una página por lámina · **AWA-37** tablas por lámina + lista maestra · **AWA-38** versionado de PDF · **AWA-39** reemplazo o actualización de `xlsx` | F5 plan de corte |
| 7 | **AWA-40** release `stage → main` · **AWA-41** descuento de proveedor (D8) · **AWA-42** interfaz de repositorios · **AWA-43** repositorio IndexedDB | Descuentos + local-first |
| 8 | **AWA-44** migración `localStorage → IndexedDB` con respaldo · **AWA-45** emitir cotización con snapshot (D9) · **AWA-46** indicador offline (D7) · **AWA-47** release `stage → main` | Cierre local-first |

Después, sin fecha fija: referencias nuevas según lleguen; **F4 Supabase — multiusuario** (~12 PRs); Playwright en el CI.

Bloqueos que dependen del usuario:
- Cargar en Admin → Precios el precio real de cada tipo de cerradura y rodachina (hoy todos usan el precio general).
- Confirmar las listas de colores de vidrio y de aluminio, y si el recargo % por color sirve o hace falta precio por perfil y color.
- En qué extremo va la hoja fija (ya no bloquea los códigos de pieza; sí el dibujo de la ventana).
- **Antes del día 5:** aprobar el plan detallado de F5.
- **Antes del día 7:** cómo funciona el descuento de proveedor (¿% general, por perfil, por proveedor?).
- **Para F4:** crear el proyecto de Supabase (us-east) y definir el alta de usuarios.
- Manual: revocar el token viejo de GitHub.

## Cómo continuar

1. Revisar y mergear #31 (AWA-29) y el PR de AWA-30. Descargar el PDF en staging y revisar la línea de especificaciones.
2. Release **AWA-31** `stage → main` (lleva AWA-28, AWA-29 y AWA-30).
3. Escribir el plan detallado de F5 y pedir aprobación antes de arrancar **AWA-32**.
4. Arreglos chicos si hay tiempo (un PR cada uno): X de los diálogos a 44 px, quitar `DatosEmpresa`/`DatosBancarios`, Playwright en el CI.

### Notas de entorno (sesión 2026-10-17)
- Máquina del usuario: `pnpm`, `gh` y Node 20 en el PATH. `gh` tiene dos cuentas (`jdvsg12` y `dev2-prog`); este repo usa **`jdvsg12`**: el remoto lleva el usuario en la URL y `.envrc` (direnv, ignorado por git) fija `GH_TOKEN` de esa cuenta. Desde Claude Code, `direnv exec . gh …`. Para `git push`, el helper de credenciales por defecto entra como `dev2-prog` (403): usar `direnv exec . git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`.
- Puertos: **3000** = servidor de desarrollo del usuario (`.claude/launch.json`, config `dev`), **3100** = pruebas visuales aisladas (config `dev-test`), **3200** = Playwright.
- El navegador de Playwright (chromium v1248) ya está en `~/.cache/ms-playwright`.
