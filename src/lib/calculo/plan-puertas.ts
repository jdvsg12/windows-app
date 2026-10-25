// Plan de las puertas de un proyecto: el despiece de cada una, las barras de perfil por color y
// referencia, los herrajes y los vidrios (que se acomodan en las láminas junto con los de las
// ventanas del mismo tipo). Puro: los parámetros se inyectan.
//
// Una puerta con medidas imposibles no tumba el plan: queda con su error y sin despiece. El
// formulario ya las rechaza; esto cubre las guardadas antes de cambiar un descuento.
import { type ResultadoBarras } from "./barras"
import {
    calcularDespiecePuerta,
    optimizarPerfilesPuertas,
    sumarAccesoriosPuertas,
    REFERENCIAS_PERFIL_PUERTA,
    type AccesoriosPuerta,
    type DespiecePuerta,
    type ReferenciaPerfilPuerta,
} from "./motor-puerta-alumina"
import { COLORES_ALUMINIO, type ColorAluminio, type ParametrosPuertaAlumina, type Puerta, type VidrioCorte } from "@/lib/types"

export interface PuertaCalculada {
    puerta: Puerta
    // "P1": puerta 1 del proyecto, en el orden de la lista (las ventanas son V1, V2…).
    codigo: string
    despiece: DespiecePuerta | null
    error: string | null
}

export interface BarrasPuertaPorColor {
    color: ColorAluminio
    referencia: ReferenciaPerfilPuerta
    resultado: ResultadoBarras
}

export interface PlanPuertas {
    puertas: PuertaCalculada[]
    barras: BarrasPuertaPorColor[]
    accesorios: AccesoriosPuerta | null
    vidrios: VidrioCorte[]
    // Errores que impiden calcular algo: una puerta con medidas imposibles o una pieza más larga que la barra.
    errores: string[]
}

export const codigoPuerta = (indice: number): string => `P${indice + 1}`

function calcularPuerta(puerta: Puerta, indice: number, parametros: ParametrosPuertaAlumina): PuertaCalculada {
    const codigo = codigoPuerta(indice)
    try {
        return { puerta, codigo, despiece: calcularDespiecePuerta(puerta, parametros), error: null }
    } catch (error) {
        return { puerta, codigo, despiece: null, error: `${codigo} ${puerta.nombre}: ${error instanceof Error ? error.message : String(error)}` }
    }
}

export function calcularPlanPuertas(puertas: readonly Puerta[], parametros: ParametrosPuertaAlumina): PlanPuertas {
    const calculadas = puertas.map((puerta, indice) => calcularPuerta(puerta, indice, parametros))
    const validas = calculadas.filter((calculada): calculada is PuertaCalculada & { despiece: DespiecePuerta } => calculada.despiece !== null)
    const errores = calculadas.flatMap((calculada) => (calculada.error ? [calculada.error] : []))

    // Perfiles de distinto color no comparten barra, igual que en las ventanas.
    const barras: BarrasPuertaPorColor[] = []
    for (const { value: color } of COLORES_ALUMINIO) {
        const delColor = validas.filter((calculada) => calculada.puerta.colorAluminio === color)
        if (delColor.length === 0) continue
        try {
            const porReferencia = optimizarPerfilesPuertas(
                delColor.map((calculada) => calculada.despiece),
                parametros,
            )
            barras.push(...REFERENCIAS_PERFIL_PUERTA.map((referencia) => ({ color, referencia, resultado: porReferencia[referencia] })))
        } catch (error) {
            errores.push(error instanceof Error ? error.message : String(error))
        }
    }

    const vidrios: VidrioCorte[] = validas.map(({ puerta, codigo, despiece }) => ({
        ventana: puerta.nombre,
        ventanaId: puerta.id,
        codigo,
        tipo: "Puerta",
        ancho: despiece.vidrio.ancho,
        alto: despiece.vidrio.alto,
        area: despiece.vidrio.area,
    }))

    return {
        puertas: calculadas,
        barras,
        accesorios: validas.length > 0 ? sumarAccesoriosPuertas(validas.map((calculada) => calculada.despiece)) : null,
        vidrios,
        errores,
    }
}
