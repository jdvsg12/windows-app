# Handoff — windows-app

> Última actualización: 2026-09-27 (fin de sesión — "mañana continuamos")

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

## Estado actual (2026-09-27, fin de día)

- **F1 y F2 completos y mergeados a `stage`.** 9 PRs (`AWA-1` a `AWA-7`, dos de ellos con commits de arreglo adicionales) mergeados hoy. Ver detalle en "F2" más abajo.
- **255 tests (Vitest) pasando**, 3 `it.todo` esperando el optimizador de vidrio de F3.
- CI de GitHub Actions **arreglado** (ver "Incidentes de hoy").
- `stage` verde: `tsc`, lint, tests y build pasan, verificado también con instalación limpia (`node_modules` borrado + `pnpm install --frozen-lockfile`) más de una vez.
- Producción (`main`) NO se tocó hoy — todo el trabajo quedó en `stage`. Falta decidir cuándo promover `stage → main` (PR nuevo, con el mismo OK explícito).

### Incidentes de hoy (para no repetirlos)

1. **El usuario mergeó el PR #3 directamente** (fuera del control de Claude) mientras Claude estaba bloqueado por falta del scope `workflow` en el token de `gh`. Eso metió a `stage` una versión del CI todavía rota. Lección: si el usuario mergea por su cuenta, la siguiente sesión debe verificar `stage` con `gh run list --branch stage` antes de asumir que está sano.
2. **CI roto en cadena, 3 causas distintas**, todas reales y confirmadas una por una corriendo el CI de verdad (no asumidas):
   - `ci.yml` seguía con `npm ci` desde antes de migrar a pnpm (sin `package-lock.json`).
   - `pnpm/action-setup@v4` necesita una versión de pnpm declarada → se agregó `"packageManager": "pnpm@10.33.0"` a `package.json`.
   - `eslint-plugin-react-hooks` se usa en `eslint.config.mjs` pero nunca estuvo en `package.json` (dependencia fantasma, solo funcionaba localmente por residuos de antes de pnpm). Ahora es dependencia directa.
   - Con esto, `stage` pasó a estar verde por primera vez desde la migración a pnpm.
3. **PR #4 (`AWA-2`) se abrió desde un `stage` desactualizado** (antes del fix de CI) y su CI fallaba por eso, no por su propio contenido. Se resolvió haciendo merge de `stage` dentro de la rama antes de mergear.
4. **Bug real de autosave, encontrado probando en navegador, no asumido:** el primer diseño de `useAutosave` (basado en "saltar solo la primera llamada de `watch()`") guardaba un valor fantasma al cargar la página sin que el usuario tocara nada, porque `react-hook-form` emite varias veces durante el montaje. Se corrigió comparando contenido serializado contra el último valor procesado. Verificado con `localStorage.setItem` instrumentado: 0 guardados fantasma, exactamente 1 guardado por pausa real al escribir.

---

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

## Roadmap de arquitectura (ver `AGENTS.md` para el detalle técnico)

**F1 — Completo.** AGENTS.md offline-first, Vitest + tests de caracterización del motor 80-25 y fixture Heliconias, design tokens ALUVE, pnpm, restricción a sistema 8025 y a tipos sin "1 Móvil + 1 Fija", regla de 1 cerradura por ventana.

**F2 — Completo (2026-09-27).** 7 PRs (`AWA-1` a `AWA-7`):
- `lib/format.ts` + `PageHeader`/`StatCard`/`EmptyState`/`SectionTitle` en `components/common/` (AWA-2).
- `CreateProjectForm` compartido, react-hook-form + Zod (AWA-4).
- `ConfiguracionTab` con autosave real y debounce, indicador guardando/guardado/error (D7) (AWA-5).
- Validación/redimensión de logo (≤400×400 px, canvas), skeletons reales en vez de "Cargando…", limpieza de código muerto confirmado con grep antes de borrar (AWA-6).
- Datos de la empresa a variables de entorno de Vercel (AWA-7, ver Seguridad #2).
- La cotización y el PDF ya usan `getTipoVentanaLabel` en vez de mostrar `"3hojas"`/`"2hojas_mixto"` crudos al cliente.
- **`ContenidoTab` — decisión pendiente, NO se tocó.** Sus campos (`descripcion`, `mostrarMedidas`, `mostrarValores`, `fecha`) no tienen ninguna capa de persistencia hoy: viven en estado local de `app/cotizador/page.tsx` y se pierden al recargar (comportamiento previo, no es una regresión). Migrarlo a autosave real exige decidir dónde persiste eso (¿nuevo campo en `Proyecto`? ¿tabla aparte?) — es una decisión de producto, no una tarea mecánica. **Usuario dijo: revisar cuando lleguemos a la siguiente fase.**

**F3 — Siguiente fase (el núcleo del plan, sin empezar):**
- Extraer el motor 80-25 a `lib/calculo/` como módulo puro isomorfo (sin `storage`, sin cache de módulo, descuentos inyectados).
- Contrato `EntradaCalculo`/`SalidaCalculo` + registro de motores por referencia (reemplaza `SISTEMAS_HABILITADOS`/`TIPOS_HABILITADOS`, hoy constantes temporales en `lib/types.ts`).
- Modelo de costeo D8 en una sola cascada (materiales + MO + transporte por proyecto + overhead por tiempo + imprevistos + utilidad), eliminando las dos `calcularCostos` actuales.
- Optimizador de vidrio nuevo: guillotina, kerf configurable (default 0 — ver memoria `glass-cutting-domain-rules`), clasificación de restos/desperdicio, costo por láminas enteras, códigos de pieza tipo `V3-M1`. Falta que el usuario defina en qué extremo va la hoja fija (ver memoria `window-leaf-and-lock-rules`). Hay 3 tests `it.todo` esperando esto.
- Unificar la fuente del tamaño de lámina (hoy se ignora en el cálculo de costo).
- `useCalculo` reemplazando los `useMemo` actuales.
- **Decidir persistencia de `ContenidoTab`** (quedó pendiente de F2, ver arriba).
- Backlog: motores 50-20, 70-44, 70-38 (uno por PR, cuando el usuario entregue fórmulas y casos de prueba).

**F4 — Pendiente:** Supabase (multi-taller, `organization_id` + RLS desde el día uno), auth real reemplazando `admin123`/`admin_auth`, IndexedDB local-first con sync a Supabase, snapshot de precios/plan de corte al emitir cotización, logo en Supabase Storage, migración de datos desde `localStorage` con respaldo, tests de RLS.

**F5 — Pendiente:** PDF en cliente con `@react-pdf/renderer` (reemplaza `jspdf`/`html2canvas`, cierra su vulnerabilidad crítica), versionado de PDF (buffer de 3 + "guardada"), mapeo del editor de texto enriquecido a componentes de react-pdf, evaluar reemplazo de `xlsx`.

---

## Cómo continuar mañana

1. **Verificar `stage`** antes de asumir nada: `git fetch origin && gh run list --branch stage --limit 1` (confirmar CI verde) — por si hubo algún merge manual fuera de sesión.
2. **Decidir si `stage → main`** (promover todo F1+F2 a producción) antes de empezar F3, o seguir acumulando en `stage`. No se ha propuesto ese PR todavía.
3. **Empezar F3** con su propio plan detallado (como se hizo con F1/F2) — es la fase de mayor riesgo, toca el motor de cálculo. Antes de tocar código: mostrar el plan y esperar OK, según la regla ya establecida.
4. Pendientes menores sin decisión: revocar token viejo de GitHub, upgrade de Next.js, dominio fijo de `stage`.
