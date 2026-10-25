import { useMemo } from "react"

import { calcularPlanCorte, type EntradaPlanCorte, type PlanCorte } from "@/lib/calculo/plan"
import type { DescuentosPorSistema, ParametrosPuertaAlumina, Puerta, Ventana } from "@/lib/types"

// Plan de corte memoizado: solo se recalcula cuando cambian las ventanas, las puertas, los
// descuentos o los parámetros de lámina, no con cualquier otro cambio de precios.
export function useCalculo(
    ventanas: readonly Ventana[],
    precios: EntradaPlanCorte["precios"],
    descuentos: DescuentosPorSistema,
    puertas: readonly Puerta[],
    parametrosPuerta: ParametrosPuertaAlumina,
): PlanCorte {
    const { tamanoLamina, kerfVidrio, minRestoVidrio } = precios

    return useMemo(
        () =>
            calcularPlanCorte({
                ventanas,
                descuentos,
                precios: { tamanoLamina, kerfVidrio, minRestoVidrio },
                puertas,
                parametrosPuerta,
            }),
        [ventanas, descuentos, tamanoLamina, kerfVidrio, minRestoVidrio, puertas, parametrosPuerta]
    )
}
