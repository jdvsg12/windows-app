import { describe, expect, it } from "vitest"

import {
    agruparPorColorAluminio,
    agruparPorTipoVidrio,
    etiquetarVidrios,
    fusionarLaminasPorTipo,
    fusionarPerfilesPorColor,
} from "../grupos"
import { calcularAccesorios, calcularVidrios, optimizarCortes } from "../motor-8025"
import { calcularPlanCorte, type EntradaPlanCorte } from "../plan"
import { optimizarLaminasVidrio } from "../vidrio"
import { DESCUNTOS_DEFAULT, TAMANOS_LAMINA, type Ventana } from "@/lib/types"
import { VENTANAS_8025 } from "@/lib/__tests__/fixtures/ventanas-8025"

const base = VENTANAS_8025.find((v) => v.nombre === "3hojas-tipica")!
const mezcla: Ventana[] = [
    { ...base, id: "a", nombre: "A" },
    { ...base, id: "b", nombre: "B", colorAluminio: "negro" },
    { ...base, id: "c", nombre: "C", colorVidrio: "bronce", calibreVidrio: 5 },
]

const precios: EntradaPlanCorte["precios"] = { tamanoLamina: "2440x3660", kerfVidrio: 0, minRestoVidrio: 200 }

// Lo que useVentanas calculaba con sus useMemo antes de AWA-20, copiado tal cual.
function planComoAntes(ventanas: Ventana[]) {
    const descuentos = DESCUNTOS_DEFAULT
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
    const laminasVidrio = fusionarLaminasPorTipo(
        vidriosPorTipo.map(({ etiqueta, vidrios: grupo }) => ({ etiqueta, laminas: optimizarLaminasVidrio(grupo, opciones) }))
    )
    return { optimizacion, accesorios, vidrios, laminasVidrio, errorLaminas: null }
}

describe("plan de corte (pestañas Materiales y Optimización)", () => {
    it("da exactamente lo mismo que los useMemo de useVentanas antes de AWA-20", () => {
        expect(calcularPlanCorte({ ventanas: mezcla, descuentos: DESCUNTOS_DEFAULT, precios })).toEqual(
            planComoAntes(mezcla)
        )
    })

    it("sin ventanas no calcula nada", () => {
        expect(calcularPlanCorte({ ventanas: [], descuentos: DESCUNTOS_DEFAULT, precios })).toEqual({
            optimizacion: {},
            accesorios: null,
            vidrios: [],
            laminasVidrio: [],
            errorLaminas: null,
        })
    })

    it("un vidrio que no cabe en la lámina devuelve el error en vez de lanzar, y conserva perfiles y accesorios", () => {
        const enorme: Ventana = { ...base, id: "x", nombre: "X", ancho: 9000, alto: 9000 }
        const plan = calcularPlanCorte({ ventanas: [enorme], descuentos: DESCUNTOS_DEFAULT, precios })
        expect(plan.errorLaminas).toEqual(expect.any(String))
        expect(plan.laminasVidrio).toEqual([])
        expect(plan.accesorios).not.toBeNull()
        expect(Object.keys(plan.optimizacion).length).toBeGreaterThan(0)
    })
})
