import { describe, expect, it } from "vitest"

import {
    agruparPorColorAluminio,
    agruparPorTipoVidrio,
    etiquetarVidrios,
    fusionarLaminasPorTipo,
    fusionarPerfilesPorColor,
} from "../grupos"
import { asignarCodigos } from "../codigos"
import { calcularAccesorios, calcularVidrios, optimizarCortes } from "../motor-8025"
import { calcularPlanCorte, type EntradaPlanCorte } from "../plan"
import { calcularMetricasVidrio, optimizarLaminasVidrio } from "../vidrio"
import { DESCUNTOS_DEFAULT, TAMANOS_LAMINA, type Puerta, type Ventana } from "@/lib/types"
import { VENTANAS_8025 } from "@/lib/__tests__/fixtures/ventanas-8025"

const base = VENTANAS_8025.find((v) => v.nombre === "3hojas-tipica")!
const mezcla: Ventana[] = [
    { ...base, id: "a", nombre: "A" },
    { ...base, id: "b", nombre: "B", colorAluminio: "negro" },
    { ...base, id: "c", nombre: "C", colorVidrio: "bronce", calibreVidrio: 5 },
]

const precios: EntradaPlanCorte["precios"] = { tamanoLamina: "2440x3660", kerfVidrio: 0, minRestoVidrio: 200 }
const SIN_PUERTAS = { puertas: [], barras: [], accesorios: null, vidrios: [], errores: [] }

// Lo que useVentanas calculaba con sus useMemo antes de AWA-20, copiado tal cual
// (más los códigos de pieza que agregó AWA-23).
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
        vidrios: etiquetarVidrios(asignarCodigos(calcularVidrios(grupo, descuentos), ventanas), etiqueta),
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
        const { metricasVidrio, puertas, ...plan } = calcularPlanCorte({ ventanas: mezcla, descuentos: DESCUNTOS_DEFAULT, precios })
        expect(plan).toEqual(planComoAntes(mezcla))
        expect(puertas).toEqual(SIN_PUERTAS)
        expect(metricasVidrio).toEqual(calcularMetricasVidrio(plan.laminasVidrio))
    })

    it("sin ventanas no calcula nada", () => {
        expect(calcularPlanCorte({ ventanas: [], descuentos: DESCUNTOS_DEFAULT, precios })).toEqual({
            optimizacion: {},
            accesorios: null,
            vidrios: [],
            laminasVidrio: [],
            metricasVidrio: calcularMetricasVidrio([]),
            errorLaminas: null,
            puertas: SIN_PUERTAS,
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

describe("plan de corte con puertas Alumina", () => {
    const puerta: Puerta = {
        id: "p1",
        nombre: "Entrada",
        producto: "alumina_europeo",
        ancho: 654,
        alto: 1984,
        colorAluminio: "natural",
        calibreVidrio: 4,
        colorVidrio: "incoloro",
        sandblasting: false,
    }

    it("una puerta sola: despiece P1, barras por referencia, herrajes y su vidrio en lámina", () => {
        const plan = calcularPlanCorte({ ventanas: [], descuentos: DESCUNTOS_DEFAULT, precios, puertas: [puerta] })
        expect(plan.puertas.puertas.map(({ codigo, error }) => [codigo, error])).toEqual([["P1", null]])
        expect(plan.puertas.barras.map(({ color, referencia, resultado }) => [color, referencia, resultado.barras.length])).toEqual([
            ["natural", "U-57", 1],
            ["natural", "VP-1102", 1],
            ["natural", "PISAVIDRIO-CUADRADO", 1],
        ])
        expect(plan.puertas.accesorios?.bisagraOmega).toBe(4)
        expect(plan.vidrios).toEqual([
            { ventana: "Entrada", ventanaId: "p1", codigo: "P1", tipo: "Puerta", ancho: 406, alto: 1754, area: 0.712124, grupo: "Incoloro 4 mm" },
        ])
        expect(plan.laminasVidrio).toHaveLength(1)
        // Sin ventanas no hay perfiles ni accesorios de ventana.
        expect(plan.optimizacion).toEqual({})
        expect(plan.accesorios).toBeNull()
    })

    it("el vidrio de la puerta comparte lámina con las ventanas del mismo tipo y no cambia el de ellas", () => {
        const ventana: Ventana = { ...base, colorVidrio: "incoloro", calibreVidrio: 4 }
        const soloVentana = calcularPlanCorte({ ventanas: [ventana], descuentos: DESCUNTOS_DEFAULT, precios })
        const conPuerta = calcularPlanCorte({ ventanas: [ventana], descuentos: DESCUNTOS_DEFAULT, precios, puertas: [puerta] })
        expect(conPuerta.vidrios.slice(0, soloVentana.vidrios.length)).toEqual(soloVentana.vidrios)
        expect(conPuerta.vidrios.at(-1)?.codigo).toBe("P1")
        expect(conPuerta.laminasVidrio.length).toBeLessThanOrEqual(soloVentana.laminasVidrio.length + 1)
        expect(conPuerta.optimizacion).toEqual(soloVentana.optimizacion)
    })

    it("una puerta con medidas imposibles queda con su error sin tumbar el plan", () => {
        const angosta = { ...puerta, id: "p2", nombre: "Closet", ancho: 240 }
        const plan = calcularPlanCorte({ ventanas: [], descuentos: DESCUNTOS_DEFAULT, precios, puertas: [puerta, angosta] })
        expect(plan.puertas.errores).toEqual([expect.stringMatching(/^P2 Closet: La puerta de 240 × 1984 mm da medidas no positivas/)])
        expect(plan.vidrios.map((vidrio) => vidrio.codigo)).toEqual(["P1"])
    })

    it("puertas de distinto color no comparten barras", () => {
        const negra = { ...puerta, id: "p2", colorAluminio: "negro" as const }
        const plan = calcularPlanCorte({ ventanas: [], descuentos: DESCUNTOS_DEFAULT, precios, puertas: [puerta, negra] })
        expect(plan.puertas.barras.map(({ color, referencia }) => `${color} ${referencia}`)).toEqual([
            "natural U-57",
            "natural VP-1102",
            "natural PISAVIDRIO-CUADRADO",
            "negro U-57",
            "negro VP-1102",
            "negro PISAVIDRIO-CUADRADO",
        ])
    })
})
