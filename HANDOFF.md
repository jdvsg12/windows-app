# Handoff — windows-app

> Última actualización: 2026-10-10 (AWA-12: especificaciones de ventana, color de aluminio y precios de vidrio)

Este archivo es el punto de entrada para retomar el trabajo: qué se hizo, qué falta y cómo se trabaja de ahora en adelante. Se actualiza en cada sesión relevante, no solo al cerrar una fase.

---

## Flujo de trabajo (obligatorio)

- **Solo dos ramas permanentes: `main` y `stage`.**
  - `main` = producción (`https://windows-app-gilt.vercel.app`, protegido con SSO de Vercel).
  - `stage` = test / staging en Vercel.
- **Nunca commitear directo a `main` ni a `stage`.** Todo cambio entra por Pull Request: rama nueva → PR → revisión.
- 🔴 **Regla de oro: ningún PR se mergea sin que el usuario lo indique explícitamente.** El harness de Claude Code además bloquea el merge de PRs a nivel de herramienta ("Merge Without Review") — el usuario tiene que mergear él mismo (botón en GitHub o `gh pr merge <n> --merge --delete-branch`), sea desde GitHub o pidiéndolo en el chat.
- **Nomenclatura de ramas y PR: `AWA-<número>`**, incremental, en el orden en que se van creando. El número no se reutiliza ni se salta, aunque una rama termine sin usarse.
  - Rama: `AWA-<número>-nombre-corto`. Título del PR: `AWA-<número>: descripción breve`.
- **Flujo completo:** rama nueva desde `stage` → cambios → PR a `stage` → **esperar OK del usuario** → merge → verificar en el deploy de staging → PR de `stage` a `main` → **esperar OK del usuario** → merge.
- Commits en inglés, imperativo presente (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`), según `AGENTS.md`.
- **Nunca sobrescribir `localStorage`/IndexedDB del navegador del usuario.** Pruebas visuales en un puerto aislado (`pnpm dev -p 3100` = otro origen), datos de prueba borrados al terminar la verificación.
- **Antes de mergear un PR nuevo, sincronizar la rama contra el `stage` más reciente** (rebase/merge) y confirmar que el CI pasa ahí — un PR abierto desde un `stage` desactualizado puede traer un CI roto que ya se arregló en otra rama (pasó con AWA-2, ver más abajo).

---

## Estado actual (2026-10-10)

- **`stage` al día con F3.1, F3.2 y F3.3** (PRs #11, #12 y #13: `AWA-9`, `AWA-10` y `AWA-11`). `main` no se ha tocado desde F2: falta el PR `stage → main`.
- **Rama abierta: `AWA-12-ventana-especificaciones`** (sale de `origin/stage` en `5994457`). **Sin commit al escribir esto.** `tsc`, lint y 294 tests pasan. Se verificó en navegador aislado (puerto 3100, en un contenedor: los datos del navegador del usuario no se tocaron).
- **Siguiente paso inmediato:** decidir si se arregla el desfase de la pestaña Optimización (ver "Pendiente de AWA-12") antes del PR, y después commit + PR `AWA-12` a `stage`.

### AWA-12 — qué incluye

Pedido del usuario: más datos al agregar ventanas, y precios de vidrio por tipo.

1. **Formulario de ventana** (`VentanaForm` + `VentanaEspecificacionesFields` nuevo):
   - Casilla **"Ambas hojas móviles"**, visible solo con "2 Hojas". **Decisión del usuario (2026-10-10): es opcional y viene desmarcada**, así que una ventana nueva de 2 hojas es por defecto 1 móvil + 1 fija (`2hojas_mixto`); marcada → `2hojas` (2 móviles). Las ventanas `2hojas` ya guardadas se abren con la casilla marcada y no cambian. Helpers puros `tipoDesdeFormulario` / `tipoParaFormulario` en `lib/types.ts`, con tests.
   - ⚠️ Esto **vuelve a habilitar 1 móvil + 1 fija**, que en F1 se había bloqueado (regla de 1 cerradura por ventana). Sigue pendiente definir en qué extremo va la hoja fija.
   - **Color de aluminio** (Natural anodizado mate, Blanco, Negro, Bronce, Champaña, Madera; por defecto Natural).
   - **Cerradura** (Impacto / Dummy / Manija), **Rodachina** (Plástica / Metálica / Pabose), **Calibre de vidrio** (4 / 5 / 6 mm), **Color de vidrio** (Incoloro, Bronce, Gris humo, Azul, Verde, Reflectivo plata/bronce/azul/verde) y casilla **Acabado sandblasting**.
   - Colores: Vidrio Andino (fabricante nacional) solo publica incoloro. Los demás son los que suelen manejar las vidrierías en Colombia: el usuario debe confirmar la lista.
   - Valores por defecto de ventana nueva: Impacto, Plástica, 4 mm, Incoloro, sin sandblasting. El formulario conserva las especificaciones de la ventana anterior, igual que ya hacía con el sistema.
   - Los campos son **opcionales en `VentanaSchema`**: las ventanas guardadas antes siguen cargando y salen como "Sin especificaciones".
   - Tarjetas de ventana y export a Excel muestran las especificaciones.
   - `agregarVentana(datos, editandoId)` en `useVentanas` ahora recibe un objeto en vez de 6 argumentos posicionales.
   - Nuevo `components/ui/checkbox.tsx` (shadcn estándar sobre el paquete `radix-ui` ya instalado, sin dependencias nuevas).
2. **Precios** (Admin → Precios, `PreciosVidrioTabla` y `RecargosColorAluminio` nuevos):
   - **Recargo % por color de aluminio** sobre el precio base de cada perfil (`recargosColorAluminio`; 0 % = precio base). Se eligió porcentaje y no una tabla perfil × color (8 × 6 precios) por ser más fácil de mantener: si el proveedor da precio por perfil y color, se cambia a tabla.
   - Tabla de **precio por lámina para cada color × calibre** (`preciosVidrio`, clave `"<color>-<calibre>"`). Celda vacía = usa el **precio general por lámina** (`precioVidrioLamina`, que pasa a ser el respaldo).
   - **Sandblasting por m²** (`precioSandblasting`).
   - Ambos con `.default()` en el esquema: los precios ya guardados cargan sin perder nada.
   - La tarjeta vieja "Vidrio y Mano de Obra" se separó en "Vidrio" y "Mano de Obra y Margen".
3. **Costeo** (`lib/calculo/costeo.ts`):
   - Los perfiles se optimizan **en barras separadas por color de aluminio** (no se mezclan colores en una barra de 6 m), y cada color lleva su recargo. Las ventanas sin color se costean como Natural.
   - Cada tipo de vidrio (color + calibre) se empaqueta en **sus propias láminas** con su propio precio: no se puede cortar bronce e incoloro de la misma lámina.
   - Las ventanas sin especificaciones se costean como **incoloro 4 mm** (`VIDRIO_POR_DEFECTO`).
   - El sandblasting se suma por m² de vidrio de las ventanas que lo llevan, **dentro de la línea "Vidrio"** de la cotización, no como línea aparte.
   - Con un solo tipo de vidrio el resultado es idéntico al anterior: los snapshots de caracterización no cambiaron.

### Pendiente de AWA-12 (decidir antes o después del PR)

- 🔴 **Desfase Optimización ↔ cotización:** las pestañas Materiales y Optimización (`useVentanas`) todavía mezclan todos los colores: barras de perfil sin importar el color del aluminio y láminas sin importar el tipo de vidrio. En un proyecto con colores mezclados, las barras y láminas que muestra el plan no coinciden con las que cobra la cotización. Arreglo (AWA-13): agrupar barras por color de aluminio y láminas por tipo de vidrio, y mostrarlas por grupo.
- Cerradura y rodachina **no cambian el precio** todavía (hoy hay un solo `precioCerradura` / `precioRodachina`). Falta precio por tipo, si el usuario lo quiere.
- Las especificaciones no salen aún en la cotización ni en el PDF (solo en las tarjetas y en el Excel).

## Seguridad — estado

1. ✅ **Deploy público — resuelto.** `windows-app-gilt.vercel.app` respondía `200` sin login por `ssoProtection.deploymentType = "all_except_custom_domains"` en el proyecto de Vercel. Se cambió a `"all"` vía API. Verificado: ahora responde `302` a `vercel.com/sso-api`, igual que el resto de deploys.
2. ✅ **Datos reales de la empresa hardcodeados — resuelto (AWA-7).** NIT, dirección, nombre y cédula del representante, dos cuentas bancarias y un WhatsApp personal estaban en `CONFIGURACION_DEFAULT` (`lib/storage.ts`), visibles en el código y en el bundle del cliente. Ahora se leen de 9 variables `NEXT_PUBLIC_COMPANY_*`, ya cargadas en Vercel (Production/Preview/Development) con los mismos valores reales. `.env.example` documenta los nombres sin valores reales.
   - ⚠️ **Esto NO borra el historial de git** — los datos siguen legibles en commits viejos. Reescribir el historial es una acción disruptiva (force-push, rompe clones existentes) que necesita aprobación explícita aparte; no se hizo.
3. **Contraseña de admin (`admin123`) — decisión explícita del usuario: se deja igual "para probar", se revisa en una fase siguiente.** No confundir con "resuelto"; sigue hardcodeada y sin autenticación real. Ligado a F4 (Supabase auth).
4. **Revocar el token de GitHub viejo** que estaba incrustado en la URL del remoto — sigue pendiente, sin hacer.
5. **Upgrade de Next.js.** 16.0.11 tiene vulnerabilidades críticas (RCE); corrige desde 16.3.3+ (última: 16.3.6). Sin decidir si ahora o en F5. Auditoría (`pnpm audit`): 19 paquetes afectados, 3 críticos (`next`, `jspdf`, `tar`).
6. **`jspdf`** (crítica, HTML injection): solo cliente, datos propios del usuario, riesgo real bajo hoy; F5 lo reemplaza por `@react-pdf/renderer`.
7. **`xlsx`** sin parche disponible; la app solo escribe (no lee archivos ajenos), así que la ruta vulnerable no se ejecuta. Evaluar SheetJS oficial (0.20.3) o aceptar el riesgo.

### Entornos Vercel
- Confirmar que `stage` tenga un dominio fijo de pruebas en vez de URLs de preview que cambian en cada push.
- Confirmar que la protección SSO de staging esté activa (ya lo está en `main`).

---

## Plan de escalamiento — avance

Referencia: el prompt de arquitectura (decisiones D1–D13, fases F1–F5 y módulo optimizador de vidrio). Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Cada ítem está verificado contra el código en `stage` + AWA-12, no solo contra el historial.

### Decisiones cerradas

| | Decisión | Estado | Evidencia / qué falta |
|---|---|---|---|
| D1 | Solo 80-25 habilitada | ✅ | `lib/calculo/registro.ts` (`REGISTRO_MOTORES`, `opcionesSistema`); el formulario deshabilita las no validadas |
| D2 | Offline-first, motor y PDF en cliente | 🟡 | Motor puro isomorfo en `lib/calculo/` ✅; registrado en `AGENTS.md` ✅. El PDF corre en cliente pero sigue en `jspdf`/`html2canvas` (F5) |
| D3 | Vercel + Supabase us-east | 🟡 | Vercel ✅ (con SSO). Supabase ⬜ (F4) |
| D4 | Marca ALUVE en tokens, sin modo oscuro | ✅ | `globals.css` + `lib/design/tokens.ts` (espejo hex para el PDF), con tests |
| D5 | Touch targets ≥44 px con `pointer: coarse` | ✅ | `@media (pointer: coarse)` en `globals.css`, sin tocar `ui/` |
| D6 | Paleta de piezas por tipo de perfil + segundo indicador | ✅ | `lib/design/piezas.ts` (`ESTILOS_PERFIL`, códigos F/M, R/S) |
| D7 | Autosave con debounce + indicador | 🟡 | `useAutosave` + `SaveIndicator` en ConfiguracionTab y datos del proyecto ✅. Estado "offline" ⬜. `ContenidoTab` sin persistencia ⬜ |
| D8 | Costeo por absorción en el tiempo | 🟡 | Cascada única en `lib/calculo/costeo.ts` ✅; las dos `calcularCostos` viejas eliminadas; Overhead en Admin; duración/transporte por proyecto. AWA-12 añade precio de vidrio por tipo y recargo por color de aluminio. ⬜ "precios con descuento de proveedor" |
| D9 | Snapshot al emitir cotización | ⬜ | F4 |
| D10 | Roles owner/operario | ⬜ | F4 (sigue `admin123`) |
| D11 | PDF con `@react-pdf/renderer` | ⬜ | F5 |
| D12 | Vitest como dev dep | ✅ | 290 tests en 8 archivos |
| D13 | Logo ≤512 KB y ≤400 px | ✅ | `lib/logo.ts` (canvas + error inline) |

### Fases

**F1 — Tokens de diseño · ✅ completa**
- ✅ Escala de color ALUVE + success/warning/info, tipografía semántica, layout, touch targets (D5), paleta de piezas (D6), colores compartidos PDF/preview (`lib/design/tokens.ts`).
- ✅ `AGENTS.md` actualizado: orden "tipos → motor (puro isomorfo) → módulo → hook → componente" y arquitectura offline-first.

**F2 — Componentes reutilizables · 🟡 casi completa**
- ✅ `PageHeader`, `StatCard`, `EmptyState`, `SectionTitle`; `lib/format.ts`; `CreateProjectForm` compartido.
- ✅ `ConfiguracionTab` con react-hook-form + Zod + autosave.
- ✅ Datos reales de la empresa fuera del código (variables `NEXT_PUBLIC_COMPANY_*`); logo validado (D13); código muerto eliminado; skeletons.
- ⬜ `ContenidoTab` a react-hook-form + persistencia: decisión de producto pendiente (dónde se guarda).
- ⬜ Botón borrar proyecto en móvil: sin verificar en esta auditoría.

**F3 — Motor de cálculo isomorfo · 🟡 núcleo hecho**
- ✅ 3.0 Tests de caracterización del motor 80-25 (6 tipos, medidas límite, barras, láminas) con snapshots.
- ✅ 3.1 Motor 80-25 extraído a módulo puro (sin storage ni caché; descuentos inyectados) — `AWA-9`.
- ✅ Contrato `EntradaCalculo`/`SalidaCalculo` + `MotorReferencia` + registro (D1).
- ✅ 3.2 Modelo de costeo D8 — `AWA-10`.
- ✅ 3.3 Optimizador de vidrio (ver módulo abajo) — `AWA-11`.
- 🟡 Tipos derivados de Zod: los esquemas existen, pero `types.ts` aún mantiene 17 interfaces paralelas (`Ventana`, `Proyecto`, `ConfiguracionPrecios`…).
- ⬜ `useCalculo` reemplazando los `useMemo` de `useVentanas`/`useCotizador`.
- ⬜ Backlog: motores 50-20 / 70-44 / 70-38 (uno por PR, cuando el usuario entregue fórmulas y casos).

**F4 — Supabase · ⬜ sin empezar**
- ⬜ Esquema con `organization_id` + RLS, auth y roles (quitar `admin123`), repositorios en lugar de `storage.ts`, IndexedDB local-first + sincronización, snapshot al emitir (D9), logo en Storage, migración desde `localStorage` con respaldo, tests de RLS + seed del piloto.

**F5 — PDF con react-pdf · ⬜ sin empezar**
- ⬜ Cotización y archivos de corte en `@react-pdf/renderer`, versionado (buffer de 3 + "guardada"), mapeo del editor de texto enriquecido, visor react-pdf como vista previa. Cierra la vulnerabilidad de `jspdf`.

### Módulo optimizador de corte de vidrio

| Requisito | Estado | Evidencia / qué falta |
|---|---|---|
| Módulo puro isomorfo, testeable | ✅ | `lib/calculo/vidrio.ts` + `vidrio.test.ts` |
| Cortes guillotina, mínimo de láminas | ✅ | Empaquetado guillotina tipo "shelf" escrito en casa |
| Documentar librería elegida vs. propia | ⬜ | No quedó escrito por qué no se usó una librería maxrects/guillotine |
| Kerf configurable, default 0 | ✅ | `precios.kerfVidrio`, en Admin |
| Tamaño de lámina configurable, una sola fuente | ✅ | `precios.tamanoLamina` |
| Mínimo de resto reutilizable configurable | ✅ | `precios.minRestoVidrio` (default 200 mm) |
| Clasificación resto (R) / desperdicio | ✅ | `RestoLamina.tipo`; marcados en la pestaña Optimización |
| Costo por láminas enteras × precio | ✅ | `costeo.ts`; con AWA-12, por tipo de vidrio |
| Merma % excluyendo la última lámina | ⬜ | No implementada |
| Etiquetas de pieza `V3-M1` (ventana + hoja) | 🟡 | Existe el tipo de hoja F/M (`piezas.ts`); falta el código de dos niveles generado |
| Caso Heliconias (29 piezas → 7 láminas, 40,063 m², 146,490 m / 116 cantos) | 🟡 | Totales de piezas, m², bordeado y cantos ✅. Láminas: el test acepta ≤8, no las 7 exactas |
| Gancho para dirección/grano del vidrio | ⬜ | |
| Gancho para inventario de restos | ⬜ | |
| PDF del plan de corte (una página por lámina + lista maestra) | ⬜ | Depende de F5 |
| Snapshot del plan de corte al emitir | ⬜ | Depende de F4 (D9) |
| Láminas separadas por color/calibre | 🟡 | En el costeo ✅ (AWA-12); en la pestaña Optimización ⬜ |

---

## Plan de trabajo — 4 PRs por día (revisado 2026-10-10)

Decisiones del usuario que cambian el plan:
- **Las referencias (50-20, 70-44, 70-38) las irá agregando con el tiempo**: quedan fuera del calendario fijo y cada una entra cuando llegan sus fórmulas, descuentos y casos de prueba (~3 PRs por referencia: motor + caracterización, descuentos, habilitar en el registro).
- **Supabase va de último**, cuando estén listos los descuentos: su objetivo es tener varios usuarios usando la app. Lo local-first que no necesita Supabase (repositorios, IndexedDB, migración, snapshot al emitir, indicador offline) se adelanta.
- **El color del aluminio entra en las cuentas** (hecho en AWA-12).

Supuestos: días hábiles de lunes a viernes; el 12-oct es festivo, así que arranca el **martes 13-oct**. Cada PR mide aprox. ¼ de día, sale de `stage` y sigue el flujo de siempre (PR → OK del usuario → merge → verificar staging). Las fases grandes arrancan con su plan aprobado. Al cierre de cada bloque hay un PR de release `stage → main`.

| Día | Fecha | PRs | Bloque |
|---|---|---|---|
| 1 | mar 13-oct | **AWA-12** especificaciones + color de aluminio + precios de vidrio (listo) · **AWA-13** Materiales/Optimización agrupados por color de aluminio y tipo de vidrio · **AWA-14** upgrade de Next.js ≥16.3.3 (vulnerabilidad RCE) · **AWA-15** release `stage → main` | Cierre + seguridad |
| 2 | mié 14-oct | **AWA-16** `ContenidoTab`: persistencia + react-hook-form · **AWA-17** botón borrar proyecto en móvil · **AWA-18** tipos desde Zod I (`Ventana`, `Proyecto`) · **AWA-19** tipos desde Zod II (configuraciones) | Restos de F2/F3 |
| 3 | jue 15-oct | **AWA-20** `useCalculo` en lugar de los `useMemo` · **AWA-21** merma sin la última lámina + métricas de bordeado y cantos · **AWA-22** códigos de pieza `V3-M1` · **AWA-23** Heliconias en 7 láminas exactas + nota de por qué no se usó una librería | F3 optimizador |
| 4 | vie 16-oct | **AWA-24** ganchos de grano del vidrio e inventario de restos · **AWA-25** precio por tipo de cerradura y rodachina · **AWA-26** especificaciones en la cotización y el PDF actual · **AWA-27** release `stage → main` | Cierre de F3 |
| 5 | lun 19-oct | **AWA-28** base de `@react-pdf/renderer` (documento, fuentes, tokens) · **AWA-29** cotización en react-pdf · **AWA-30** mapeo del editor de texto enriquecido · **AWA-31** vista previa con el visor de react-pdf; se quitan `jspdf`/`html2canvas` | F5 PDF |
| 6 | mar 20-oct | **AWA-32** PDF del plan de corte: una página por lámina con diagrama · **AWA-33** plan de corte: tablas por lámina + lista maestra + totales · **AWA-34** versionado de PDF (buffer de 3 + "guardada") · **AWA-35** reemplazo o actualización de `xlsx` | F5 plan de corte |
| 7 | mié 21-oct | **AWA-36** release `stage → main` · **AWA-37** descuento de proveedor en los precios (D8) · **AWA-38** interfaz de repositorios (`storage.ts` detrás, sin cambiar comportamiento) · **AWA-39** repositorio IndexedDB | Descuentos + local-first |
| 8 | jue 22-oct | **AWA-40** migración `localStorage → IndexedDB` con respaldo JSON y validación Zod · **AWA-41** emitir cotización con snapshot local (D9) · **AWA-42** indicador offline en el autosave (D7) · **AWA-43** release `stage → main` | Cierre local-first |

**Calendario fijo: 32 PRs (AWA-12 a AWA-43) en 8 días hábiles → fin ideal el jueves 22-oct-2026. Realista: ~2 semanas (fin entre el 27 y el 30 de octubre).**

Después, sin fecha fija (depende de lo que entregue el usuario):
- **Referencias nuevas** a medida que lleguen: ~3 PRs cada una (~1 día).
- **F4 Supabase — multiusuario** (~12 PRs, 3 días ideales, 1–1,5 semanas realistas): esquema con `organization_id` + RLS (2 PRs), tests de RLS, auth email/contraseña (quita `admin123`), roles owner/operario, invitar usuarios al taller, sync envío, sync recepción + conflictos, logo en Storage, seed del piloto + entornos de Vercel, release.

Por qué el estimado realista es mayor que el ideal:
- El cuello de botella es la revisión: el usuario debe revisar, mergear y probar en staging 4 PRs al día. Un día con 2 merges corre el plan.
- Los PRs de un mismo día dependen entre sí: se trabajan apilados y cada uno se rebasa cuando el anterior entra a `stage`.
- La migración a IndexedDB toca datos reales del taller: hay que ir con calma.

Bloqueos que dependen del usuario:
- **Antes del día 1:** confirmar las listas de colores de vidrio y de aluminio, y si el recargo % por color sirve o hace falta precio por perfil y color.
- **Antes del día 2:** dónde se guarda `ContenidoTab` (propuesta: campos nuevos en `Proyecto`).
- **Antes del día 4:** precios por tipo de cerradura/rodachina y en qué extremo va la hoja fija.
- **Antes del día 5:** aprobar el plan detallado de F5.
- **Antes del día 7:** cómo funciona el descuento de proveedor (¿% general, por perfil, por proveedor?).
- **Para F4:** crear el proyecto de Supabase (región us-east) y definir cómo se dan de alta los usuarios.
- Manual: revocar el token viejo de GitHub.

## Cómo continuar

1. **Cerrar AWA-12:** decidir lo de la pestaña Optimización → commit por bloques (`feat: window specs…`, `feat: glass prices by color and thickness…`, `docs: handoff`) → PR `AWA-12: especificaciones de ventana y precios de vidrio` a `stage` → **esperar OK del usuario** para mergear.
2. **Verificar `stage`** antes de asumir nada: `git fetch origin && gh run list --branch stage --limit 1`. `gh` no está instalado en la máquina del usuario: correrlo desde otro entorno o revisar GitHub.
3. Seguir el **plan de trabajo** de arriba: cierre de F3 → F5 (PDF) → descuentos + local-first → referencias según lleguen → F4 Supabase de último.
6. Pendientes menores: revocar el token viejo de GitHub, upgrade de Next.js (16.0.11 → ≥16.3.3 por vulnerabilidad RCE), dominio fijo de `stage`, decidir persistencia de `ContenidoTab`.

### Notas de entorno (sesión 2026-10-10)
- El repo vive en la máquina del usuario; ahí no hay `pnpm` ni `gh` en el PATH. `tsc`, `eslint` y `vitest` se corren desde `node_modules/.bin/`.
- Git en la carpeta conectada necesita permiso de borrado para limpiar sus `.lock` (ya concedido en esta sesión; en otra hay que pedirlo de nuevo).
- Las pruebas visuales se hicieron en un contenedor aparte (copia del código + Playwright), así que el `localStorage` del usuario quedó intacto.
