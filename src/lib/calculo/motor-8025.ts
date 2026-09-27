// Pure, isomorphic engine for reference 8025 — no storage, no module-level cache or
// mutable state (a cache here would leak between organizations in a multi-workshop
// setup). Discounts are injected by the caller on every call.
import {
    DESCUNTOS_DEFAULT,
    type Ventana,
    type Corte,
    type Accesorios,
    type OptimizacionPerfil,
    type VidrioCorte,
    type LaminaVidrio,
    type DescuentosPorSistema,
    type DescuentosSistema,
    type SistemaVentana,
} from "@/lib/types"

function resolverDescuentos(descuentos: DescuentosPorSistema, sistema?: SistemaVentana): DescuentosSistema {
    const sistemaKey = (sistema ?? "5020") as keyof DescuentosPorSistema
    return descuentos[sistemaKey] || DESCUNTOS_DEFAULT[sistemaKey] || DESCUNTOS_DEFAULT["5020"]
}

// === CONSTANTES ===
const LONGITUD_BARRA = 6 // metros
const LAMINA_ANCHO = 2500 // mm
const LAMINA_ALTO = 3600 // mm
const MARGEN_CORTE = 5 // mm

// === CÁLCULO DE CORTES ===

const CONFIG_PANELES = {
    "2hojas": { moviles: 2, fijas: 0, tieneFijaParche: false },
    "2hojas_mixto": { moviles: 1, fijas: 1, tieneFijaParche: true },
    "3hojas": { moviles: 2, fijas: 1, tieneFijaParche: true },
    "4hojas": { moviles: 3, fijas: 1, tieneFijaParche: true },
    "5hojas": { moviles: 4, fijas: 1, tieneFijaParche: true },
    "6hojas": { moviles: 5, fijas: 1, tieneFijaParche: true },
} as const

/**
 * Calcula todos los cortes necesarios para una ventana
 * @param ventana - Ventana a calcular
 * @param descuentos - Tabla de descuentos por sistema (inyectada, no se lee de storage)
 * @returns Array de cortes con tipo, medida, cantidad y referencia
 */
export function calcularCortesVentana(ventana: Ventana, descuentos: DescuentosPorSistema): Corte[] {
    const { ancho, alto, tipoVentana, nombre, sistema = "5020" } = ventana
    const anchoM = ancho / 1000
    const altoM = alto / 1000
    const cortes: Corte[] = []
    const descuentosSistema = resolverDescuentos(descuentos, sistema)
    const config = CONFIG_PANELES[tipoVentana] || CONFIG_PANELES["2hojas"]

    // Alturas para enganches y traslapes
    const alturaEngancheNormal = altoM - (descuentosSistema.engancheNormal / 1000)
    const alturaEngancheParche = altoM - (descuentosSistema.engancheParche / 1000)
    const alturaTraslapeNormal = altoM - (descuentosSistema.traslapeNormal / 1000)
    const alturaTraslapeParche = altoM - (descuentosSistema.traslapeParche / 1000)

    const anchoHoja = anchoM / parseInt(tipoVentana)
    const anchoHorizontal = anchoHoja + 0.01 // ancho/hojas + 10mm

    // Marco (común para todos los tipos)
    cortes.push(
        { tipo: "Cabezal", medida: anchoM, cantidad: 1, ventana: nombre, sistema },
        { tipo: "Sillar", medida: anchoM, cantidad: 1, ventana: nombre, sistema },
        { tipo: "Jamba Izquierda", medida: altoM - (descuentosSistema.jamba / 1000), cantidad: 1, ventana: nombre, sistema },
        { tipo: "Jamba Derecha", medida: altoM - (descuentosSistema.jamba / 1000), cantidad: 1, ventana: nombre, sistema }
    )

    // Perfiles de hojas
    if (tipoVentana === "2hojas") {
        // 2 hojas móviles: enganche en ambas (1+1), traslape en ambas (1+1)
        cortes.push(
            { tipo: "Enganche", medida: alturaEngancheNormal, cantidad: 2, ventana: nombre, sistema },
            { tipo: "Traslape", medida: alturaTraslapeNormal, cantidad: 2, ventana: nombre, sistema },
            { tipo: "Horizontal Superior", medida: anchoHorizontal, cantidad: 2, ventana: nombre, sistema },
            { tipo: "Horizontal Inferior", medida: anchoHorizontal, cantidad: 2, ventana: nombre, sistema }
        )
    } else {
        const cantidadHojas = parseInt(tipoVentana)
        const moviles = config.moviles
        const tieneFijaParche = config.tieneFijaParche

        // Logica de enganches y traslapes:
        // - Hoja 1 (móvil): 1 enganche + 1 traslape (descuento normal 25mm)
        // - Hojas intermedias (móviles): 2 enganches cada una (descuento normal 25mm)
        // - Ultima hoja (fija parche): 1 enganche + 1 traslape (descuento 5mm)

        // Enganches normales: 2 * moviles - 1 (primera hoja 1 enganche, resto 2 enganches)
        const enganchesNormales = moviles > 0 ? (2 * moviles - 1) : 0
        // Enganches parche: 1 (descuento 5mm)
        const enganchesParche = tieneFijaParche ? 1 : 0

        // Traslapes normales: 1 (en la primera hoja móvil) - descuento normal
        const traslapesNormales = moviles > 0 ? 1 : 0
        // Traslapes parche: 1 (en la fija de parche) - descuento 5mm
        const traslapesParche = tieneFijaParche ? 1 : 0

        // Agregar enganches normales (descuento normal)
        if (enganchesNormales > 0) {
            cortes.push({
                tipo: "Enganche",
                medida: alturaEngancheNormal,
                cantidad: enganchesNormales,
                ventana: nombre,
                sistema
            })
        }

        // Agregar enganches de parche (descuento 5mm)
        if (enganchesParche > 0) {
            cortes.push({
                tipo: "Enganche",
                medida: alturaEngancheParche,
                cantidad: enganchesParche,
                ventana: `${nombre} (Parche)`,
                sistema
            })
        }

        // Agregar traslapes normales (descuento normal)
        if (traslapesNormales > 0) {
            cortes.push({
                tipo: "Traslape",
                medida: alturaTraslapeNormal,
                cantidad: traslapesNormales,
                ventana: nombre,
                sistema
            })
        }

        // Agregar traslapes de parche (descuento 5mm)
        if (traslapesParche > 0) {
            cortes.push({
                tipo: "Traslape",
                medida: alturaTraslapeParche,
                cantidad: traslapesParche,
                ventana: `${nombre} (Parche)`,
                sistema
            })
        }

        // Horizontales para todas las hojas
        if (sistema === "8025" && (tipoVentana === "3hojas" || tipoVentana === "4hojas")) {
            let traslapeTotal = 0
            let desfaseFija = 0
            let desfaseCerradura = 0

            if (tipoVentana === "3hojas") {
                traslapeTotal = 0.045
                desfaseFija = 0.010
                desfaseCerradura = 0.080
            } else {
                traslapeTotal = 0.080
                desfaseFija = 0.009
                desfaseCerradura = 0.075
            }

            const x = (anchoM + traslapeTotal - desfaseFija - desfaseCerradura) / cantidadHojas

            const anchoFija = x + desfaseFija
            const anchoCerradura = x + desfaseCerradura
            const anchoCentral = x

            cortes.push(
                { tipo: "Horizontal Superior", medida: anchoFija, cantidad: 1, ventana: `${nombre} (Fija)`, sistema },
                { tipo: "Horizontal Inferior", medida: anchoFija, cantidad: 1, ventana: `${nombre} (Fija)`, sistema }
            )
            cortes.push(
                { tipo: "Horizontal Superior", medida: anchoCerradura, cantidad: 1, ventana: `${nombre} (Cerradura)`, sistema },
                { tipo: "Horizontal Inferior", medida: anchoCerradura, cantidad: 1, ventana: `${nombre} (Cerradura)`, sistema }
            )
            const numCentrales = cantidadHojas - 2
            if (numCentrales > 0) {
                cortes.push(
                    { tipo: "Horizontal Superior", medida: anchoCentral, cantidad: numCentrales, ventana: `${nombre} (Centrales)`, sistema },
                    { tipo: "Horizontal Inferior", medida: anchoCentral, cantidad: numCentrales, ventana: `${nombre} (Centrales)`, sistema }
                )
            }
        } else {
            cortes.push(
                { tipo: "Horizontal Superior", medida: anchoHorizontal, cantidad: cantidadHojas, ventana: nombre, sistema },
                { tipo: "Horizontal Inferior", medida: anchoHorizontal, cantidad: cantidadHojas, ventana: nombre, sistema }
            )
        }
    }

    return cortes
}

// === OPTIMIZACIÓN DE CORTES ===

/**
 * Optimiza los cortes de perfiles usando algoritmo First Fit Decreasing
 * @param ventanas - Array de ventanas a optimizar
 * @param descuentos - Tabla de descuentos por sistema (inyectada)
 * @returns Objeto con optimización por tipo de perfil y sistema
 */
export function optimizarCortes(ventanas: readonly Ventana[], descuentos: DescuentosPorSistema): Record<string, OptimizacionPerfil> {
    // Obtener todos los cortes de todas las ventanas
    const todosLosCortes: Corte[] = ventanas.flatMap((ventana) => calcularCortesVentana(ventana, descuentos))

    // Agrupar cortes por tipo de perfil Y sistema
    const cortesAgrupados: Record<string, Corte[]> = {}
    todosLosCortes.forEach(corte => {
        const clave = corte.sistema ? `${corte.sistema} - ${corte.tipo}` : corte.tipo
        if (!cortesAgrupados[clave]) {
            cortesAgrupados[clave] = []
        }
        // Expandir cantidades a cortes individuales
        for (let i = 0; i < corte.cantidad; i++) {
            cortesAgrupados[clave].push({ ...corte, cantidad: 1 })
        }
    })

    const optimizacion: Record<string, OptimizacionPerfil> = {}

    // Optimizar cada tipo de perfil por separado
    Object.entries(cortesAgrupados).forEach(([tipo, cortes]) => {
        // Ordenar de mayor a menor (First Fit Decreasing)
        const ordenados = [...cortes].sort((a, b) => b.medida - a.medida)
        const barras: number[][] = []

        // Algoritmo First Fit Decreasing
        ordenados.forEach(corte => {
            let colocado = false

            // Intentar colocar en barras existentes
            for (const barra of barras) {
                const espacioUsado = barra.reduce((sum, m) => sum + m, 0)
                if (espacioUsado + corte.medida <= LONGITUD_BARRA) {
                    barra.push(corte.medida)
                    colocado = true
                    break
                }
            }

            // Si no cabe en ninguna barra, crear nueva
            if (!colocado) {
                barras.push([corte.medida])
            }
        })

        // Calcular metros totales usados
        const metrosUsados = barras.reduce((total, barra) =>
            total + barra.reduce((sum, m) => sum + m, 0), 0
        )

        optimizacion[tipo] = { barras, metrosUsados }
    })

    return optimizacion
}

// === CÁLCULO DE ACCESORIOS ===

const CONFIG_ACCESORIOS = {
    "2hojas": { rodachinas: 4, cerraduras: 1, guias: 4, tornillosHoja: 4 },
    "2hojas_mixto": { rodachinas: 2, cerraduras: 1, guias: 2, tornillosHoja: 4 },
    "3hojas": { rodachinas: 4, cerraduras: 1, guias: 4, tornillosHoja: 4 },
    "4hojas": { rodachinas: 6, cerraduras: 1, guias: 6, tornillosHoja: 4 },
    "5hojas": { rodachinas: 8, cerraduras: 1, guias: 8, tornillosHoja: 4 },
    "6hojas": { rodachinas: 10, cerraduras: 1, guias: 10, tornillosHoja: 4 },
} as const

/**
 * Calcula la cantidad de accesorios necesarios para todas las ventanas
 * @param ventanas - Array de ventanas
 * @param descuentos - Tabla de descuentos por sistema (inyectada)
 * @returns Objeto con cantidades de cada accesorio
 */
export function calcularAccesorios(ventanas: readonly Ventana[], descuentos: DescuentosPorSistema): Accesorios {
    const accesorios: Accesorios = {
        rodachinas: 0,
        guiasSuperior: 0,
        guiasInferior: 0,
        tornillosHojas: 0,
        tornillosMarco: 0,
        tornillosInstalacion: 0,
        cerraduras: 0,
        empaqueTotal: 0,
    }

    ventanas.forEach(ventana => {
        const descuentosSistema = resolverDescuentos(descuentos, ventana.sistema)
        const config = CONFIG_ACCESORIOS[ventana.tipoVentana] || CONFIG_ACCESORIOS["2hojas"]

        // Tornillos comunes para todas las ventanas
        accesorios.tornillosMarco += 8
        accesorios.tornillosInstalacion += 8

        // Rodachinas (2 por hoja móvil)
        accesorios.rodachinas += config.rodachinas

        // Guías
        accesorios.guiasSuperior += config.guias
        accesorios.guiasInferior += config.guias

        // Tornillos de hojas
        accesorios.tornillosHojas += config.tornillosHoja * (config.rodachinas / 2)

        // Cerraduras
        accesorios.cerraduras += config.cerraduras

        // Empaque
        const cantidadHojas = parseInt(ventana.tipoVentana)
        const configPaneles = CONFIG_PANELES[ventana.tipoVentana] || CONFIG_PANELES["2hojas"]
        const moviles = configPaneles.moviles

        const anchoHoja = ventana.ancho / cantidadHojas
        const anchoVidrio = anchoHoja - descuentosSistema.anchoVidrio
        const altoVidrio = ventana.alto - descuentosSistema.jamba
        const perimetroHoja = ((anchoVidrio * 2 + altoVidrio * 2) / 1000)

        accesorios.empaqueTotal += perimetroHoja * moviles
    })

    return accesorios
}

// === CÁLCULO DE VIDRIOS ===

/**
 * Calcula las dimensiones de todos los vidrios necesarios
 * @param ventanas - Array de ventanas
 * @param descuentos - Tabla de descuentos por sistema (inyectada)
 * @returns Array con información de cada vidrio
 */
export function calcularVidrios(ventanas: readonly Ventana[], descuentos: DescuentosPorSistema): VidrioCorte[] {
    const vidrios: VidrioCorte[] = []

    ventanas.forEach(ventana => {
        const descuentosSistema = resolverDescuentos(descuentos, ventana.sistema)
        const cantidadHojas = parseInt(ventana.tipoVentana)
        const config = CONFIG_PANELES[ventana.tipoVentana] || CONFIG_PANELES["2hojas"]

        const altoVidrio = ventana.alto - descuentosSistema.jamba

        if (ventana.sistema === "8025" && (ventana.tipoVentana === "3hojas" || ventana.tipoVentana === "4hojas")) {
            let traslapeTotal = 0
            let desfaseFija = 0
            let desfaseCerradura = 0

            if (ventana.tipoVentana === "3hojas") {
                traslapeTotal = 45; desfaseFija = 10; desfaseCerradura = 80
            } else {
                traslapeTotal = 80; desfaseFija = 9; desfaseCerradura = 75
            }

            const x_mm = (ventana.ancho + traslapeTotal - desfaseFija - desfaseCerradura) / cantidadHojas

            const anchoVidrioFija = (x_mm + desfaseFija) - descuentosSistema.anchoVidrio
            const anchoVidrioCerradura = (x_mm + desfaseCerradura) - descuentosSistema.anchoVidrio
            const anchoVidrioCentral = x_mm - descuentosSistema.anchoVidrio

            vidrios.push({ ventana: ventana.nombre, tipo: "Hoja Fija (Parche)", ancho: anchoVidrioFija, alto: altoVidrio, area: (anchoVidrioFija * altoVidrio) / 1000000 })
            vidrios.push({ ventana: ventana.nombre, tipo: "Hoja Móvil (Cerradura)", ancho: anchoVidrioCerradura, alto: altoVidrio, area: (anchoVidrioCerradura * altoVidrio) / 1000000 })

            for (let i = 0; i < cantidadHojas - 2; i++) {
                vidrios.push({ ventana: ventana.nombre, tipo: `Hoja Móvil (Central ${i + 1})`, ancho: anchoVidrioCentral, alto: altoVidrio, area: (anchoVidrioCentral * altoVidrio) / 1000000 })
            }
        } else {
            const anchoHoja = ventana.ancho / cantidadHojas
            const anchoVidrio = anchoHoja - descuentosSistema.anchoVidrio
            const area = (anchoVidrio * altoVidrio) / 1000000

            const moviles = config.moviles
            for (let i = 0; i < moviles; i++) {
                vidrios.push({
                    ventana: ventana.nombre,
                    tipo: `Hoja Móvil ${i + 1}`,
                    ancho: anchoVidrio,
                    alto: altoVidrio,
                    area,
                })
            }

            if (config.fijas > 0) {
                for (let i = 0; i < config.fijas; i++) {
                    vidrios.push({
                        ventana: ventana.nombre,
                        tipo: `Hoja Fija ${i + 1}`,
                        ancho: anchoVidrio,
                        alto: altoVidrio,
                        area,
                    })
                }
            }
        }
    })

    return vidrios
}

// === OPTIMIZACIÓN DE LÁMINAS DE VIDRIO ===

interface EspacioLibre {
    x: number
    y: number
    ancho: number
    alto: number
}

interface LaminaExtendida {
    numero: number
    anchoLamina: number
    altoLamina: number
    areaLamina: number
    vidrios: Array<{
        vidrio: VidrioCorte
        x: number
        y: number
        rotado: boolean
    }>
    areaUsada: number
    areaSobrante: number
    espaciosLibres: EspacioLibre[]
}

function buscarEspacioEnLamina(
    lamina: LaminaExtendida,
    anchoConMargen: number,
    altoConMargen: number,
    vidrio: VidrioCorte
): { espacio: EspacioLibre; indice: number; rotado: boolean } | null {
    let mejorEspacio: { espacio: EspacioLibre; indice: number; rotado: boolean } | null = null
    let menorDesperdicio = Infinity

    lamina.espaciosLibres.forEach((espacio, indice) => {
        // Opción 1: Sin rotar
        if (anchoConMargen <= espacio.ancho && altoConMargen <= espacio.alto) {
            const desperdicio = espacio.ancho * espacio.alto - anchoConMargen * altoConMargen
            if (desperdicio < menorDesperdicio) {
                menorDesperdicio = desperdicio
                mejorEspacio = { espacio, indice, rotado: false }
            }
        }

        // Opción 2: Rotado 90° (solo si no es cuadrado)
        if (vidrio.ancho !== vidrio.alto &&
            altoConMargen <= espacio.ancho &&
            anchoConMargen <= espacio.alto) {
            const desperdicio = espacio.ancho * espacio.alto - altoConMargen * anchoConMargen
            if (desperdicio < menorDesperdicio) {
                menorDesperdicio = desperdicio
                mejorEspacio = { espacio, indice, rotado: true }
            }
        }
    })

    return mejorEspacio
}

function procesarVidrioEnLamina(
    lamina: LaminaExtendida,
    vidrio: VidrioCorte,
    anchoConMargen: number,
    altoConMargen: number
): boolean {
    const mejorEspacio = buscarEspacioEnLamina(lamina, anchoConMargen, altoConMargen, vidrio)

    if (!mejorEspacio) return false

    const { espacio, indice, rotado } = mejorEspacio
    const vidrioFinal = rotado
        ? { ...vidrio, ancho: vidrio.alto, alto: vidrio.ancho }
        : vidrio

    lamina.vidrios.push({ vidrio: vidrioFinal, x: espacio.x, y: espacio.y, rotado })
    lamina.areaUsada += vidrio.area
    lamina.areaSobrante = lamina.areaLamina - lamina.areaUsada
    lamina.espaciosLibres.splice(indice, 1)

    // Algoritmo Guillotine Cut: crear nuevos espacios libres
    // Espacio a la derecha
    if (espacio.ancho > vidrioFinal.ancho + MARGEN_CORTE) {
        lamina.espaciosLibres.push({
            x: espacio.x + vidrioFinal.ancho + MARGEN_CORTE,
            y: espacio.y,
            ancho: espacio.ancho - vidrioFinal.ancho - MARGEN_CORTE,
            alto: vidrioFinal.alto + MARGEN_CORTE,
        })
    }

    // Espacio arriba
    if (espacio.alto > vidrioFinal.alto + MARGEN_CORTE) {
        lamina.espaciosLibres.push({
            x: espacio.x,
            y: espacio.y + vidrioFinal.alto + MARGEN_CORTE,
            ancho: espacio.ancho,
            alto: espacio.alto - vidrioFinal.alto - MARGEN_CORTE,
        })
    }

    // Ordenar espacios por área (usar primero los más pequeños)
    lamina.espaciosLibres.sort((a, b) => a.ancho * a.alto - b.ancho * b.alto)

    return true
}

function crearNuevaLamina(
    vidrio: VidrioCorte,
    numero: number,
    laminaAncho: number = LAMINA_ANCHO,
    laminaAlto: number = LAMINA_ALTO
): LaminaExtendida {
    const areaLamina = (laminaAncho * laminaAlto) / 1000000
    const nuevaLamina: LaminaExtendida = {
        numero,
        anchoLamina: laminaAncho,
        altoLamina: laminaAlto,
        areaLamina,
        vidrios: [{ vidrio, x: 0, y: 0, rotado: false }],
        areaUsada: vidrio.area,
        areaSobrante: areaLamina - vidrio.area,
        espaciosLibres: [],
    }

    if (laminaAncho > vidrio.ancho + MARGEN_CORTE) {
        nuevaLamina.espaciosLibres.push({
            x: vidrio.ancho + MARGEN_CORTE,
            y: 0,
            ancho: laminaAncho - vidrio.ancho - MARGEN_CORTE,
            alto: vidrio.alto + MARGEN_CORTE,
        })
    }

    if (laminaAlto > vidrio.alto + MARGEN_CORTE) {
        nuevaLamina.espaciosLibres.push({
            x: 0,
            y: vidrio.alto + MARGEN_CORTE,
            ancho: laminaAncho,
            alto: laminaAlto - vidrio.alto - MARGEN_CORTE,
        })
    }

    return nuevaLamina
}

/**
 * Optimiza el corte de vidrios en láminas usando algoritmo Guillotine Cut.
 * Reemplazado en F3.3 por un optimizador con kerf configurable y clasificación de
 * restos/desperdicio; se mantiene aquí tal cual hasta entonces.
 * @param ventanas - Array de ventanas
 * @param descuentos - Tabla de descuentos por sistema (inyectada)
 * @param laminaAncho - Ancho de la lámina en mm (default: 2500)
 * @param laminaAlto - Alto de la lámina en mm (default: 3600)
 * @returns Array de láminas con vidrios colocados
 */
export function optimizarLaminasVidrio(
    ventanas: readonly Ventana[],
    descuentos: DescuentosPorSistema,
    laminaAncho: number = LAMINA_ANCHO,
    laminaAlto: number = LAMINA_ALTO
): LaminaVidrio[] {
    const vidrios = calcularVidrios(ventanas, descuentos)
    const vidriosOrdenados = [...vidrios].sort((a, b) => b.area - a.area)

    const laminas: LaminaExtendida[] = []

    vidriosOrdenados.forEach(vidrio => {
        const anchoConMargen = vidrio.ancho + MARGEN_CORTE
        const altoConMargen = vidrio.alto + MARGEN_CORTE

        let colocado = false
        for (const lamina of laminas) {
            if (procesarVidrioEnLamina(lamina, vidrio, anchoConMargen, altoConMargen)) {
                colocado = true
                break
            }
        }

        if (!colocado) {
            laminas.push(crearNuevaLamina(vidrio, laminas.length + 1, laminaAncho, laminaAlto))
        }
    })

    return laminas
}

// === ORDEN DE PERFILES (para iterar en el cotizador) ===
export const ORDEN_PERFILES = [
    "Cabezal",
    "Sillar",
    "Jamba Izquierda",
    "Jamba Derecha",
    "Enganche",
    "Traslape",
    "Horizontal Superior",
    "Horizontal Inferior",
] as const
