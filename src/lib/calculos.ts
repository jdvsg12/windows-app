// lib/calculos.ts - Lógica de cálculo centralizada
import type {
    Ventana,
    Corte,
    Accesorios,
    OptimizacionPerfil,
    VidrioCorte,
    LaminaVidrio,
    ConfiguracionPrecios,
    CostosCalculados,
} from "./types"

// === DESCUENTOS POR SISTEMA ===
// Valores en mm
const DESCuentOS = {
    "5020": { jamba: 15, enganche: 30, traslape: 30, hInfSup: 15, anchoVidrio: 44 },
    "744": { jamba: 12, enganche: 24, traslape: 24, hInfSup: 0, anchoVidrio: 45 },
    "8025": { jamba: 12, enganche: 28, traslape: 28, hInfSup: 0, anchoVidrio: 46 },
    "7038": { jamba: 25, enganche: 41, traslape: 41, hInfSup: -10, anchoVidrio: 39.8 },
} as const

type SistemaKey = keyof typeof DESCuentOS
const SISTEMA_DEFAULT: SistemaKey = "5020"

function getDescuentos(sistema?: string) {
    return DESCuentOS[sistema as SistemaKey] || DESCuentOS[SISTEMA_DEFAULT]
}

// === CONSTANTES ===
const LONGITUD_BARRA = 6 // metros
const LAMINA_ANCHO = 2500 // mm
const LAMINA_ALTO = 3600 // mm
const LAMINA_AREA = (LAMINA_ANCHO * LAMINA_ALTO) / 1000000 // m²
const MARGEN_CORTE = 5 // mm

// === CÁLCULO DE CORTES ===

const CONFIG_PANELES = {
    "2hojas": { moviles: 2, fijas: 0, tieneFijaParche: false },
    "3hojas": { moviles: 2, fijas: 1, tieneFijaParche: true },
    "4hojas": { moviles: 3, fijas: 1, tieneFijaParche: true },
    "5hojas": { moviles: 4, fijas: 1, tieneFijaParche: true },
    "6hojas": { moviles: 5, fijas: 1, tieneFijaParche: true },
} as const

/**
 * Calcula todos los cortes necesarios para una ventana
 * @param ventana - Ventana a calcular
 * @returns Array de cortes con tipo, medida, cantidad y referencia
 */
export function calcularCortesVentana(ventana: Ventana): Corte[] {
    const { ancho, alto, tipoVentana, nombre, sistema = "5020" } = ventana
    const anchoM = ancho / 1000
    const altoM = alto / 1000
    const cortes: Corte[] = []
    const descuentos = getDescuentos(sistema)
    const config = CONFIG_PANELES[tipoVentana] || CONFIG_PANELES["2hojas"]

    // Alturas para enganches y traslapes
    const alturaEngancheNormal = altoM - (descuentos.enganche / 1000)
    const alturaEngancheParche = altoM - 0.005
    const alturaTraslapeNormal = altoM - (descuentos.traslape / 1000)
    const alturaTraslapeParche = altoM - 0.005

    const anchoHoja = anchoM / parseInt(tipoVentana)
    const anchoHorizontal = anchoHoja - (descuentos.hInfSup / 1000)

    // Marco (común para todos los tipos)
    cortes.push(
        { tipo: "Cabezal", medida: anchoM, cantidad: 1, ventana: nombre, sistema },
        { tipo: "Sillar", medida: anchoM, cantidad: 1, ventana: nombre, sistema },
        { tipo: "Jamba Izquierda", medida: altoM - (descuentos.jamba / 1000), cantidad: 1, ventana: nombre, sistema },
        { tipo: "Jamba Derecha", medida: altoM - (descuentos.jamba / 1000), cantidad: 1, ventana: nombre, sistema }
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
        cortes.push(
            { tipo: "Horizontal Superior", medida: anchoHorizontal, cantidad: cantidadHojas, ventana: nombre, sistema },
            { tipo: "Horizontal Inferior", medida: anchoHorizontal, cantidad: cantidadHojas, ventana: nombre, sistema }
        )
    }

    return cortes
}

// === OPTIMIZACIÓN DE CORTES ===

/**
 * Optimiza los cortes de perfiles usando algoritmo First Fit Decreasing
 * @param ventanas - Array de ventanas a optimizar
 * @returns Objeto con optimización por tipo de perfil y sistema
 */
export function optimizarCortes(ventanas: Ventana[]): Record<string, OptimizacionPerfil> {
    // Obtener todos los cortes de todas las ventanas
    const todosLosCortes: Corte[] = ventanas.flatMap(calcularCortesVentana)

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
    "3hojas": { rodachinas: 4, cerraduras: 2, guias: 4, tornillosHoja: 4 },
    "4hojas": { rodachinas: 6, cerraduras: 1, guias: 6, tornillosHoja: 4 },
    "5hojas": { rodachinas: 8, cerraduras: 1, guias: 8, tornillosHoja: 4 },
    "6hojas": { rodachinas: 10, cerraduras: 2, guias: 10, tornillosHoja: 4 },
} as const

/**
 * Calcula la cantidad de accesorios necesarios para todas las ventanas
 * @param ventanas - Array de ventanas
 * @returns Objeto con cantidades de cada accesorio
 */
export function calcularAccesorios(ventanas: Ventana[]): Accesorios {
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
        const descuentos = getDescuentos(ventana.sistema)
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
        const anchoVidrio = anchoHoja - descuentos.anchoVidrio
        const altoVidrio = ventana.alto - descuentos.jamba
        const perimetroHoja = ((anchoVidrio * 2 + altoVidrio * 2) / 1000)

        accesorios.empaqueTotal += perimetroHoja * moviles
    })

    return accesorios
}

// === CÁLCULO DE VIDRIOS ===

/**
 * Calcula las dimensiones de todos los vidrios necesarios
 * @param ventanas - Array de ventanas
 * @returns Array con información de cada vidrio
 */
export function calcularVidrios(ventanas: Ventana[]): VidrioCorte[] {
    const vidrios: VidrioCorte[] = []

    ventanas.forEach(ventana => {
        const descuentos = getDescuentos(ventana.sistema)
        const cantidadHojas = parseInt(ventana.tipoVentana)
        const config = CONFIG_PANELES[ventana.tipoVentana] || CONFIG_PANELES["2hojas"]

        const anchoHoja = ventana.ancho / cantidadHojas
        const anchoVidrio = anchoHoja - descuentos.anchoVidrio
        const altoVidrio = ventana.alto - descuentos.jamba
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
    lamina.areaSobrante = LAMINA_AREA - lamina.areaUsada
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

function crearNuevaLamina(vidrio: VidrioCorte, numero: number): LaminaExtendida {
    const nuevaLamina: LaminaExtendida = {
        numero,
        vidrios: [{ vidrio, x: 0, y: 0, rotado: false }],
        areaUsada: vidrio.area,
        areaSobrante: LAMINA_AREA - vidrio.area,
        espaciosLibres: [],
    }

    // Crear espacios libres iniciales
    if (LAMINA_ANCHO > vidrio.ancho + MARGEN_CORTE) {
        nuevaLamina.espaciosLibres.push({
            x: vidrio.ancho + MARGEN_CORTE,
            y: 0,
            ancho: LAMINA_ANCHO - vidrio.ancho - MARGEN_CORTE,
            alto: vidrio.alto + MARGEN_CORTE,
        })
    }

    if (LAMINA_ALTO > vidrio.alto + MARGEN_CORTE) {
        nuevaLamina.espaciosLibres.push({
            x: 0,
            y: vidrio.alto + MARGEN_CORTE,
            ancho: LAMINA_ANCHO,
            alto: LAMINA_ALTO - vidrio.alto - MARGEN_CORTE,
        })
    }

    return nuevaLamina
}

/**
 * Optimiza el corte de vidrios en láminas de 2500x3600mm usando algoritmo Guillotine Cut
 * @param ventanas - Array de ventanas
 * @returns Array de láminas con vidrios colocados
 */
export function optimizarLaminasVidrio(ventanas: Ventana[]): LaminaVidrio[] {
    const vidrios = calcularVidrios(ventanas)
    const vidriosOrdenados = [...vidrios].sort((a, b) => b.area - a.area)

    const laminas: LaminaExtendida[] = []

    vidriosOrdenados.forEach(vidrio => {
        const anchoConMargen = vidrio.ancho + MARGEN_CORTE
        const altoConMargen = vidrio.alto + MARGEN_CORTE

        // Intentar colocar en láminas existentes
        let colocado = false
        for (const lamina of laminas) {
            if (procesarVidrioEnLamina(lamina, vidrio, anchoConMargen, altoConMargen)) {
                colocado = true
                break
            }
        }

        // Si no cabe en ninguna lámina, crear nueva
        if (!colocado) {
            laminas.push(crearNuevaLamina(vidrio, laminas.length + 1))
        }
    })

    return laminas
}

// === CÁLCULO DE COSTOS ===

/**
 * Calcula todos los costos del proyecto
 * @param ventanas - Array de ventanas
 * @param precios - Configuración de precios
 * @returns Objeto con desglose completo de costos
 */
export function calcularCostos(
    ventanas: Ventana[],
    precios: ConfiguracionPrecios
): CostosCalculados {
    const optimizacion = optimizarCortes(ventanas)
    const accesorios = calcularAccesorios(ventanas)

    // Mapeo de tipos de perfil a sus precios (por metro)
    const mapeoPrecios: Record<string, number> = {
        "Cabezal": precios.precioCabezal,
        "Sillar": precios.precioSillar,
        "Jamba Izquierda": precios.precioJamba,
        "Jamba Derecha": precios.precioJamba,
        "Enganche": precios.precioEnganche,
        "Traslape": precios.precioTraslape,
        "Horizontal Superior": precios.precioHorizontalSuperior,
        "Horizontal Inferior": precios.precioHorizontalInferior,
    }

    // Costo de perfiles (precio por metro × metros usados)
    const costoPerfiles = Object.entries(optimizacion).reduce((total, [tipo, opt]) => {
        return total + (mapeoPrecios[tipo] || 0) * opt.metrosUsados
    }, 0)

    // Costo de accesorios
    const costoAccesorios =
        accesorios.rodachinas * precios.precioRodachina +
        accesorios.guiasSuperior * precios.precioGuia +
        accesorios.guiasInferior * precios.precioGuia +
        accesorios.tornillosHojas * precios.precioTornillo8mm +
        accesorios.tornillosMarco * precios.precioTornillo8mm +
        accesorios.tornillosInstalacion * precios.precioTornillo10mm +
        accesorios.cerraduras * precios.precioCerradura

    // Costo de empaque
    const costoEmpaque = accesorios.empaqueTotal * precios.precioEmpaque

    // Subtotal de materiales
    const subtotal = costoPerfiles + costoAccesorios + costoEmpaque

    // Mano de obra (porcentaje sobre subtotal)
    const costoManoObra = subtotal * (precios.manoDeObra / 100)

    // Costos adicionales personalizables
    const costosAdicionalesDetalle = (precios.costosAdicionales || []).map(costo => ({
        ...costo,
        valorCalculado: costo.tipo === "porcentaje"
            ? subtotal * (costo.valor / 100)
            : costo.valor,
    }))

    const costosAdicionalesTotal = costosAdicionalesDetalle.reduce(
        (sum, c) => sum + c.valorCalculado, 0
    )

    // Total sin utilidad
    const totalSinUtilidad =
        subtotal +
        costoManoObra +
        precios.transporte +
        precios.otros +
        costosAdicionalesTotal

    // Utilidad (porcentaje sobre total sin utilidad)
    const utilidadMonto = totalSinUtilidad * (precios.utilidad / 100)

    // Total final
    const total = totalSinUtilidad + utilidadMonto

    // Cálculo de área total y precio por m²
    const areaTotal = ventanas.reduce((sum, v) =>
        sum + (v.ancho * v.alto) / 1000000, 0
    )
    const precioPorM2 = areaTotal > 0 ? total / areaTotal : 0

    // Calcular valor individual por ventana
    const valoresPorVentana = ventanas.map(v => {
        const area = (v.ancho * v.alto) / 1000000
        return {
            id: v.id,
            area,
            valor: area * precioPorM2
        }
    })

    return {
        costoPerfiles,
        costoAccesorios,
        costoEmpaque,
        subtotal,
        costoManoObra,
        costoTransporte: precios.transporte,
        costoOtros: precios.otros,
        costosAdicionalesDetalle,
        costosAdicionalesTotal,
        utilidadMonto,
        total,
        areaTotal,
        precioPorM2,
        valoresPorVentana,
    }
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

// === ALIAS PARA COMPATIBILIDAD ===
export const optimizarCortesVidrio = optimizarLaminasVidrio
