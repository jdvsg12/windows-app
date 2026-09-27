# Handoff — windows-app

> Última actualización: 2026-09-27

Este archivo es el punto de entrada para retomar el trabajo: qué se hizo, qué falta y cómo se trabaja de ahora en adelante. Se actualiza en cada sesión relevante, no solo al cerrar una fase.

---

## Flujo de trabajo (obligatorio desde ahora)

- **Solo dos ramas permanentes: `main` y `stage`.**
  - `main` = producción (`https://windows-app-gilt.vercel.app`).
  - `stage` = test / staging en Vercel.
- **Nunca commitear directo a `main` ni a `stage`.** Todo cambio entra por Pull Request: rama nueva → PR → revisión.
- 🔴 **Regla de oro: ningún PR se mergea sin que el usuario lo indique explícitamente.** Abrir el PR y dejarlo listo para revisión no autoriza el merge. Esto aplica a `PR → stage` y, con más razón, a `stage → main` (ese sí toca producción). Ante la duda, se pregunta antes de mergear, nunca después.
- **Nomenclatura de ramas y PR: `AWA-<número>`**, incremental, en el orden en que se van creando. Ejemplos: `AWA-1`, `AWA-2`, `AWA-3`...
  - El número da la trazabilidad y el orden de carga; no se reutiliza ni se salta.
  - Rama: `AWA-<número>-nombre-corto` (ej. `AWA-4-upgrade-nextjs`).
  - Título del PR: `AWA-<número>: descripción breve`.
- **Flujo completo:** rama nueva desde `stage` → cambios → PR a `stage` → **esperar OK del usuario** → merge → verificar en el deploy de staging → PR de `stage` a `main` → **esperar OK del usuario** → merge.
- Commits en inglés, imperativo presente (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`), según `AGENTS.md`.
- Sigue vigente la regla previa de sesión: nunca sobrescribir `localStorage`/IndexedDB del navegador del usuario. Pruebas visuales en un puerto aislado (ej. `3100`), datos de prueba borrados al terminar.

---

## Estado actual (2026-09-27)

- Repo: solo existen `main` y `stage`, ambas sincronizadas en el mismo commit (`e0db49d`). Este archivo (`HANDOFF.md`) está sin commitear todavía — será el primer PR bajo el flujo `AWA-<número>` (ver "Cómo continuar").
- Se cerró y fusionó el trabajo de `feature/cotizador-improvements` (12 commits) hacia `main` y `stage`.
- Producción (`main`) tiene un deploy activo en Vercel; Production Branch del proyecto ya apunta a `main` (antes apuntaba por error a `stage`).
- 239 tests (Vitest) pasando.
- `origin` limpio: se removió el token de acceso incrustado en la URL del remoto; ahora usa el credential helper de `gh` (cuenta `jdvsg12`).
- Se agregó la descripción del repo en GitHub. El campo Website del About sigue apuntando a `windows-app-gilt.vercel.app`.

---

## Pendiente / tareas por trabajar

### Seguridad (prioridad alta — antes de features nuevas)
1. ✅ **Acceso al deploy público — resuelto (2026-09-27).** `windows-app-gilt.vercel.app` respondía `200` sin login por un `ssoProtection.deploymentType = "all_except_custom_domains"` en el proyecto de Vercel (esa exclusión existe justo para no proteger dominios propios, pero el alias `.vercel.app` de producción caía ahí). Se cambió a `"all"` vía API; verificado: ahora responde `302` a `vercel.com/sso-api` igual que el resto de deploys. **Sigue pendiente la mitad de esta tarea:** sacar `admin123` y los datos reales de la empresa (NIT, dirección, correo) del código fuente — hoy siguen hardcodeados en el cliente (`lib/storage.ts`) y quedarían expuestos si algún día se relaja la protección. Programado como tarea de F2.
2. **Revocar el token de GitHub viejo** que estaba incrustado en la URL del remoto (ya no se usa, pero sigue vigente en GitHub hasta que se revoque manualmente).
3. **Upgrade de Next.js.** Next.js 16.0.11 tiene vulnerabilidades críticas (RCE) reportadas; corrige desde 16.3.3+ (última publicada: 16.3.6). Definir si se sube ahora o se difiere a F5. Auditoría general (`pnpm audit`): 19 paquetes afectados, 3 críticos (`next`, `jspdf`, `tar`).
4. **`jspdf`** (crítica, LFI/RCE-adyacente vía HTML injection): usado solo en cliente con datos propios del usuario; bajo riesgo real hoy, pero F5 lo reemplaza por `@react-pdf/renderer`. Decidir si se actualiza ahora (salto mayor a 4.2.1) o se espera a F5.
5. **`xlsx`** no tiene parche disponible para su vulnerabilidad (prototype pollution / ReDoS al leer archivos; la app solo escribe, así que la ruta vulnerable no se ejecuta). Evaluar reemplazo por el paquete oficial de SheetJS (0.20.3, vía su CDN) o aceptar el riesgo documentado.

### Entornos Vercel
- Confirmar que `stage` tenga su propio dominio fijo de pruebas (ej. `windows-app-stage.vercel.app`) en vez de URLs de preview que cambian en cada push.
- Confirmar que la protección de acceso (SSO) del entorno de staging esté activa, dado el punto de seguridad #1.

### Roadmap de arquitectura (fases F2–F5, ver `AGENTS.md`)

**F1 — Completo:** AGENTS.md offline-first, Vitest + tests de caracterización del motor 80-25 y fixture Heliconias, design tokens ALUVE (color/tipografía/touch targets), paleta de piezas por perfil, pnpm, restricción a sistema 8025 y a tipos sin "1 Móvil + 1 Fija" en el formulario, regla de 1 cerradura por ventana.

**F2 — Pendiente (siguiente fase recomendada; bajo riesgo, alto impacto en mantenibilidad):**
- `PageHeader`, `StatCard`, `EmptyState`, `SectionTitle` en `components/common/`.
- `lib/format.ts` centralizando moneda/fecha/número (~25 usos repartidos hoy).
- `CreateProjectForm` compartido entre dashboard y `/calculators` (hoy son dos formularios distintos).
- Migrar `ConfiguracionTab` y `ContenidoTab` a `react-hook-form` + Zod, con autosave y debounce.
- Sacar del código los datos reales de la empresa (`lib/storage.ts`) hacia un seed/config, no hardcodeados (ver seguridad #1).
- Botón de borrar proyecto: arreglar su posición en móvil.
- Validación del logo (≤512 KB, ≤400 px, error inline).
- Skeletons en vez de "Cargando…"; borrar código muerto.
- La cotización y el PDF muestran identificadores internos al cliente ("3hojas", "2hojas_mixto") en vez de las etiquetas legibles (`getTipoVentanaLabel` ya existe).

**F3 — Pendiente (el núcleo del plan):**
- Extraer el motor 80-25 a `lib/calculo/` como módulo puro isomorfo (sin `storage`, sin cache de módulo, descuentos inyectados).
- Contrato `EntradaCalculo`/`SalidaCalculo` + registro de motores por referencia (reemplaza las constantes temporales `SISTEMAS_HABILITADOS`/`TIPOS_HABILITADOS`).
- Modelo de costeo D8 en una sola cascada (materiales + MO + transporte por proyecto + overhead por tiempo + imprevistos + utilidad), eliminando las dos `calcularCostos` actuales.
- Optimizador de vidrio nuevo: guillotina, kerf configurable (default 0 — ver `glass-cutting-domain-rules`), clasificación de restos/desperdicio, costo por láminas enteras, códigos de pieza tipo `V3-M1`. Pendiente que el usuario defina en qué extremo va la hoja fija (ver `window-leaf-and-lock-rules`). Hay 3 tests `it.todo` esperando esto.
- Unificar la fuente del tamaño de lámina (hoy se ignora en el cálculo de costo).
- `useCalculo` reemplazando los `useMemo` actuales.
- Backlog: motores 50-20, 70-44, 70-38 (uno por PR, cuando el usuario entregue fórmulas y casos de prueba).

**F4 — Pendiente:** Supabase (multi-taller, `organization_id` + RLS desde el día uno), auth reemplazando `admin123`/`admin_auth`, IndexedDB local-first con sync a Supabase, snapshot de precios/plan de corte al emitir cotización, logo en Supabase Storage, migración de datos desde `localStorage` con respaldo, tests de RLS.

**F5 — Pendiente:** PDF en cliente con `@react-pdf/renderer` (reemplaza `jspdf`/`html2canvas`, cierra su vulnerabilidad crítica), versionado de PDF (buffer de 3 + "guardada"), mapeo del editor de texto enriquecido a componentes de react-pdf, evaluar reemplazo de `xlsx`.

---

## Cómo continuar

1. **Decidir seguridad #1 con el usuario** (deploy público) antes de seguir con features — es el de mayor impacto real.
2. **Usar el flujo `AWA-<número>` desde ya:** el primer candidato es commitear este mismo `HANDOFF.md` en una rama `AWA-1-handoff`, PR a `stage`, y **esperar el OK del usuario antes de mergear** (regla de oro de arriba).
3. Priorizar F2 como siguiente fase de arquitectura una vez resuelto el punto de seguridad.
