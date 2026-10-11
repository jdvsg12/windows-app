// Plan de corte que muestran las pestañas Materiales y Optimización: barras por color de
// aluminio y láminas por tipo de vidrio, la misma agrupación que cobra el costeo.
// Puro: descuentos y parámetros de lámina se inyectan; sin storage ni estado.
import {
    agruparPorColorAluminio,
    agruparPorTipoVidrio,
    etiquetarVidrios,
    fusionarLaminasPorTipo,
    fusionarPerfilesPorColor,
} from "./grupos"
import { calcularAccesorios, calcularVidrios, optimizarCortes } from "./motor-8025"
import { optimizarLaminasVidrio } from "./vidrio"
import {
    TAMANOS_LAMINA,
    type Accesorios,
    type ConfiguracionPrecios,
    type DescuentosPorSistema,
    type LaminaVidrio,
    type OptimizacionPerfil,
    type Ventana,
    type VidrioCorte,
} from "@/lib/types"

export interface EntradaPlanCorte {
    ventanas: readonly Ventana[]
    descuentos: DescuentosPorSistema
    precios: Pick<ConfiguracionPrecios, "tamanoLamina" | "kerfVidrio" | "minRestoVidrio">
}

export interface PlanCorte {
    optimizacion: Record<string, OptimizacionPerfil>
    accesorios: Accesorios | null
    vidrios: VidrioCorte[]
    laminasVidrio: LaminaVidrio[]
    // El optimizador lanza si una pieza no cabe en ninguna orientación de la lámina
    // configurada (F3.3): se devuelve el mensaje para no tumbar la pestaña de Optimización.
    errorLaminas: string | null
}

export function calcularPlanCorte({ ventanas, descuentos, precios }: EntradaPlanCorte): PlanCorte {
    if (ventanas.length === 0) {
        return { optimizacion: {}, accesorios: null, vidrios: [], laminasVidrio: [], errorLaminas: null }
    }

    const optimizacion = fusionarPerfilesPorColor(
        agruparPorColorAluminio(ventanas).map(({ color, ventanas: grupo }) => ({
            color,
            optimizacion: optimizarCortes(grupo, descuentos),
        }))
    )
    const accesorios = calcularAccesorios(ventanas, descuentos)
    const vidriosPorTipo = agruparPorTipoVidrio(ventanas).map(({ etiqueta, ventanas: grupo }) => ({
        etiqueta,
        vidrios: etiquetarVidrios(calcularVidrios(grupo, descuentos), etiqueta),
    }))
    const vidrios = vidriosPorTipo.flatMap((grupo) => grupo.vidrios)

    const { ancho: laminaAncho, alto: laminaAlto } = TAMANOS_LAMINA[precios.tamanoLamina]
    const opciones = { laminaAncho, laminaAlto, kerf: precios.kerfVidrio, minResto: precios.minRestoVidrio }
    try {
        const laminasVidrio = fusionarLaminasPorTipo(
            vidriosPorTipo.map(({ etiqueta, vidrios: grupo }) => ({
                etiqueta,
                laminas: optimizarLaminasVidrio(grupo, opciones),
            }))
        )
        return { optimizacion, accesorios, vidrios, laminasVidrio, errorLaminas: null }
    } catch (error) {
        return {
            optimizacion,
            accesorios,
            vidrios,
            laminasVidrio: [],
            errorLaminas: error instanceof Error ? error.message : String(error),
        }
    }
}
