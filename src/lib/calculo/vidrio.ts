// Guillotine sheet packer for glass panes (F3.3) — shared by every reference engine, since
// packing pieces into sheets has nothing to do with a specific window system. Only piece
// geometry (calcularVidrios) is engine-specific and stays in motor-8025.ts.
//
// Pure: no storage, no module-level cache. Kerf and minResto are injected by the caller.
//
// Free-space bookkeeping: each sheet keeps a list of free rectangles that exactly tile its
// unused area (a classic "shelf" guillotine split — placing a piece replaces its chosen free
// rect with a right-of-piece strip spanning the piece's height and a top-of-piece strip
// spanning the full width). With kerf 0 this tiles exactly, so areaUsada + Σ(restos areas) =
// areaLamina. With kerf > 0 a thin kerf-width strip along each cut is genuinely lost to the
// blade and is not represented as a free rectangle — it's real waste, not a reusable/labelable
// leftover, so it is intentionally left out of the restos/desperdicio classification.
import type { VidrioCorte, LaminaVidrio, RestoLamina } from "@/lib/types"

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
    vidrios: Array<{ vidrio: VidrioCorte; x: number; y: number; rotado: boolean }>
    areaUsada: number
    areaSobrante: number
    espaciosLibres: EspacioLibre[]
}

export interface OpcionesOptimizacionVidrio {
    laminaAncho: number
    laminaAlto: number
    kerf?: number // mm consumidos por cada corte (default 0: vidrio rayado y partido, sin pérdida)
    minResto?: number // mm de lado menor a partir del cual un sobrante es "resto" y no desperdicio (default 200)
}

function cabeEnLamina(vidrio: VidrioCorte, laminaAncho: number, laminaAlto: number): boolean {
    const cabeDerecho = vidrio.ancho <= laminaAncho && vidrio.alto <= laminaAlto
    const cabeRotado = vidrio.alto <= laminaAncho && vidrio.ancho <= laminaAlto
    return cabeDerecho || cabeRotado
}

function buscarEspacioEnLamina(
    lamina: LaminaExtendida,
    vidrio: VidrioCorte,
    kerf: number
): { espacio: EspacioLibre; indice: number; rotado: boolean } | null {
    const anchoConMargen = vidrio.ancho + kerf
    const altoConMargen = vidrio.alto + kerf

    let mejorEspacio: { espacio: EspacioLibre; indice: number; rotado: boolean } | null = null
    let menorDesperdicio = Infinity

    lamina.espaciosLibres.forEach((espacio, indice) => {
        // Opción 1: sin rotar
        if (anchoConMargen <= espacio.ancho && altoConMargen <= espacio.alto) {
            const desperdicio = espacio.ancho * espacio.alto - anchoConMargen * altoConMargen
            if (desperdicio < menorDesperdicio) {
                menorDesperdicio = desperdicio
                mejorEspacio = { espacio, indice, rotado: false }
            }
        }

        // Opción 2: rotado 90° (solo si no es cuadrado)
        if (vidrio.ancho !== vidrio.alto && altoConMargen <= espacio.ancho && anchoConMargen <= espacio.alto) {
            const desperdicio = espacio.ancho * espacio.alto - altoConMargen * anchoConMargen
            if (desperdicio < menorDesperdicio) {
                menorDesperdicio = desperdicio
                mejorEspacio = { espacio, indice, rotado: true }
            }
        }
    })

    return mejorEspacio
}

// Un guillotine split tiene dos formas válidas de partir el espacio sobrante en dos
// rectángulos (franja derecha a todo el alto + franja superior del ancho de la pieza, o
// viceversa). Se elige la que deja el rectángulo remanente más grande, para fragmentar menos
// el espacio libre — heurística estándar de packing por guillotina.
function splitEspacio(espacio: EspacioLibre, piezaAncho: number, piezaAlto: number, kerf: number): EspacioLibre[] {
    const anchoRestante = espacio.ancho - piezaAncho - kerf
    const altoRestante = espacio.alto - piezaAlto - kerf

    const opcionA: EspacioLibre[] = []
    if (anchoRestante > 0) {
        opcionA.push({ x: espacio.x + piezaAncho + kerf, y: espacio.y, ancho: anchoRestante, alto: piezaAlto + kerf })
    }
    if (altoRestante > 0) {
        opcionA.push({ x: espacio.x, y: espacio.y + piezaAlto + kerf, ancho: espacio.ancho, alto: altoRestante })
    }

    const opcionB: EspacioLibre[] = []
    if (anchoRestante > 0) {
        opcionB.push({ x: espacio.x + piezaAncho + kerf, y: espacio.y, ancho: anchoRestante, alto: espacio.alto })
    }
    if (altoRestante > 0) {
        opcionB.push({ x: espacio.x, y: espacio.y + piezaAlto + kerf, ancho: piezaAncho + kerf, alto: altoRestante })
    }

    const mayorArea = (rects: EspacioLibre[]) => rects.reduce((max, r) => Math.max(max, r.ancho * r.alto), 0)
    return mayorArea(opcionA) >= mayorArea(opcionB) ? opcionA : opcionB
}

function procesarVidrioEnLamina(lamina: LaminaExtendida, vidrio: VidrioCorte, kerf: number): boolean {
    const mejorEspacio = buscarEspacioEnLamina(lamina, vidrio, kerf)
    if (!mejorEspacio) return false

    const { espacio, indice, rotado } = mejorEspacio
    const vidrioFinal = rotado ? { ...vidrio, ancho: vidrio.alto, alto: vidrio.ancho } : vidrio

    lamina.vidrios.push({ vidrio: vidrioFinal, x: espacio.x, y: espacio.y, rotado })
    lamina.areaUsada += vidrio.area
    lamina.areaSobrante = lamina.areaLamina - lamina.areaUsada
    lamina.espaciosLibres.splice(indice, 1)
    lamina.espaciosLibres.push(...splitEspacio(espacio, vidrioFinal.ancho, vidrioFinal.alto, kerf))
    lamina.espaciosLibres.sort((a, b) => a.ancho * a.alto - b.ancho * b.alto)
    return true
}

function crearNuevaLamina(
    vidrio: VidrioCorte,
    numero: number,
    laminaAncho: number,
    laminaAlto: number,
    kerf: number
): LaminaExtendida {
    // La pieza ya pasó cabeEnLamina en optimizarLaminasVidrio: si no entra derecha, entra rotada.
    const rotado = !(vidrio.ancho <= laminaAncho && vidrio.alto <= laminaAlto)
    const vidrioFinal = rotado ? { ...vidrio, ancho: vidrio.alto, alto: vidrio.ancho } : vidrio

    const areaLamina = (laminaAncho * laminaAlto) / 1_000_000
    return {
        numero,
        anchoLamina: laminaAncho,
        altoLamina: laminaAlto,
        areaLamina,
        vidrios: [{ vidrio: vidrioFinal, x: 0, y: 0, rotado }],
        areaUsada: vidrio.area,
        areaSobrante: areaLamina - vidrio.area,
        espaciosLibres: splitEspacio(
            { x: 0, y: 0, ancho: laminaAncho, alto: laminaAlto },
            vidrioFinal.ancho,
            vidrioFinal.alto,
            kerf
        ),
    }
}

function clasificarRestos(espaciosLibres: readonly EspacioLibre[], minResto: number): RestoLamina[] {
    return espaciosLibres.map((espacio) => ({
        x: espacio.x,
        y: espacio.y,
        ancho: espacio.ancho,
        alto: espacio.alto,
        tipo: Math.min(espacio.ancho, espacio.alto) >= minResto ? "resto" : "desperdicio",
    }))
}

/**
 * Empaqueta piezas de vidrio en láminas con algoritmo Guillotine Cut, kerf configurable y
 * clasificación de sobrantes en resto/desperdicio.
 * @throws si alguna pieza no cabe en ninguna orientación de la lámina configurada — una pieza
 * así no se puede pedir en esa lámina y no debe cotizarse en silencio.
 */
export function optimizarLaminasVidrio(
    vidrios: readonly VidrioCorte[],
    opciones: OpcionesOptimizacionVidrio
): LaminaVidrio[] {
    const { laminaAncho, laminaAlto, kerf = 0, minResto = 200 } = opciones

    for (const vidrio of vidrios) {
        if (!cabeEnLamina(vidrio, laminaAncho, laminaAlto)) {
            throw new Error(
                `El vidrio de ${vidrio.ventana} - ${vidrio.tipo} (${vidrio.ancho}×${vidrio.alto} mm) no cabe ` +
                `en ninguna orientación de la lámina configurada (${laminaAncho}×${laminaAlto} mm).`
            )
        }
    }

    const vidriosOrdenados = [...vidrios].sort((a, b) => b.area - a.area)
    const laminas: LaminaExtendida[] = []

    vidriosOrdenados.forEach((vidrio) => {
        let colocado = false
        for (const lamina of laminas) {
            if (procesarVidrioEnLamina(lamina, vidrio, kerf)) {
                colocado = true
                break
            }
        }

        if (!colocado) {
            laminas.push(crearNuevaLamina(vidrio, laminas.length + 1, laminaAncho, laminaAlto, kerf))
        }
    })

    return laminas.map((lamina) => ({
        numero: lamina.numero,
        anchoLamina: lamina.anchoLamina,
        altoLamina: lamina.altoLamina,
        vidrios: lamina.vidrios,
        restos: clasificarRestos(lamina.espaciosLibres, minResto),
        areaUsada: lamina.areaUsada,
        areaSobrante: lamina.areaSobrante,
    }))
}
