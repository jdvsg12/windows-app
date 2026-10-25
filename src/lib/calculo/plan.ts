// Plan de corte que muestran las pestañas Materiales y Optimización: barras por color de
// aluminio y láminas por tipo de vidrio, la misma agrupación que cobra el costeo.
// Puro: descuentos y parámetros de lámina se inyectan; sin storage ni estado.
import {
    agruparPorColorAluminio,
    agruparPorTipoVidrio,
    etiquetaTipoVidrio,
    etiquetarVidrios,
    fusionarLaminasPorTipo,
    fusionarPerfilesPorColor,
} from "./grupos"
import { asignarCodigos } from "./codigos"
import { calcularAccesorios, calcularVidrios, optimizarCortes } from "./motor-8025"
import { calcularPlanPuertas, type PlanPuertas } from "./plan-puertas"
import { calcularMetricasVidrio, optimizarLaminasVidrio, type MetricasVidrio } from "./vidrio"
import { ParametrosPuertaAluminaSchema } from "@/lib/schemas"
import {
    TAMANOS_LAMINA,
    claveVidrio,
    type Accesorios,
    type ClaveVidrio,
    type ConfiguracionPrecios,
    type DescuentosPorSistema,
    type LaminaVidrio,
    type OptimizacionPerfil,
    type ParametrosPuertaAlumina,
    type Puerta,
    type Ventana,
    type VidrioCorte,
} from "@/lib/types"

export interface EntradaPlanCorte {
    ventanas: readonly Ventana[]
    descuentos: DescuentosPorSistema
    precios: Pick<ConfiguracionPrecios, "tamanoLamina" | "kerfVidrio" | "minRestoVidrio">
    puertas?: readonly Puerta[]
    parametrosPuerta?: ParametrosPuertaAlumina
}

export interface PlanCorte {
    optimizacion: Record<string, OptimizacionPerfil>
    accesorios: Accesorios | null
    vidrios: VidrioCorte[]
    laminasVidrio: LaminaVidrio[]
    metricasVidrio: MetricasVidrio
    // El optimizador lanza si una pieza no cabe en ninguna orientación de la lámina
    // configurada (F3.3): se devuelve el mensaje para no tumbar la pestaña de Optimización.
    errorLaminas: string | null
    puertas: PlanPuertas
}

const PARAMETROS_PUERTA_POR_DEFECTO = ParametrosPuertaAluminaSchema.parse({})

// Los vidrios de puertas van a las mismas láminas que los de ventanas del mismo color y calibre.
function vidriosPorTipo(
    ventanas: readonly Ventana[],
    descuentos: DescuentosPorSistema,
    puertas: readonly Puerta[],
    planPuertas: PlanPuertas,
): Array<{ etiqueta: string; vidrios: VidrioCorte[] }> {
    const grupos = new Map<ClaveVidrio, { etiqueta: string; vidrios: VidrioCorte[] }>()
    for (const { clave, etiqueta, ventanas: grupo } of agruparPorTipoVidrio(ventanas)) {
        grupos.set(clave, { etiqueta, vidrios: etiquetarVidrios(asignarCodigos(calcularVidrios(grupo, descuentos), ventanas), etiqueta) })
    }
    const puertaPorId = new Map(puertas.map((puerta) => [puerta.id, puerta]))
    for (const vidrio of planPuertas.vidrios) {
        const puerta = puertaPorId.get(vidrio.ventanaId ?? "")
        if (!puerta) continue
        const clave = claveVidrio(puerta.colorVidrio, puerta.calibreVidrio)
        const grupo = grupos.get(clave) ?? { etiqueta: etiquetaTipoVidrio(puerta.colorVidrio, puerta.calibreVidrio), vidrios: [] }
        grupo.vidrios.push({ ...vidrio, grupo: grupo.etiqueta })
        grupos.set(clave, grupo)
    }
    return [...grupos.values()]
}

export function calcularPlanCorte({
    ventanas,
    descuentos,
    precios,
    puertas = [],
    parametrosPuerta = PARAMETROS_PUERTA_POR_DEFECTO,
}: EntradaPlanCorte): PlanCorte {
    const planPuertas = calcularPlanPuertas(puertas, parametrosPuerta)
    if (ventanas.length === 0 && puertas.length === 0) {
        return {
            optimizacion: {},
            accesorios: null,
            vidrios: [],
            laminasVidrio: [],
            metricasVidrio: calcularMetricasVidrio([]),
            errorLaminas: null,
            puertas: planPuertas,
        }
    }

    const optimizacion = fusionarPerfilesPorColor(
        agruparPorColorAluminio(ventanas).map(({ color, ventanas: grupo }) => ({
            color,
            optimizacion: optimizarCortes(grupo, descuentos),
        }))
    )
    const accesorios = ventanas.length > 0 ? calcularAccesorios(ventanas, descuentos) : null
    const grupos = vidriosPorTipo(ventanas, descuentos, puertas, planPuertas)
    const vidrios = grupos.flatMap((grupo) => grupo.vidrios)

    const { ancho: laminaAncho, alto: laminaAlto } = TAMANOS_LAMINA[precios.tamanoLamina]
    const opciones = { laminaAncho, laminaAlto, kerf: precios.kerfVidrio, minResto: precios.minRestoVidrio }
    try {
        const laminasVidrio = fusionarLaminasPorTipo(
            grupos.map(({ etiqueta, vidrios: grupo }) => ({
                etiqueta,
                laminas: optimizarLaminasVidrio(grupo, opciones),
            }))
        )
        return {
            optimizacion,
            accesorios,
            vidrios,
            laminasVidrio,
            metricasVidrio: calcularMetricasVidrio(laminasVidrio),
            errorLaminas: null,
            puertas: planPuertas,
        }
    } catch (error) {
        return {
            optimizacion,
            accesorios,
            vidrios,
            laminasVidrio: [],
            metricasVidrio: calcularMetricasVidrio([]),
            errorLaminas: error instanceof Error ? error.message : String(error),
            puertas: planPuertas,
        }
    }
}
