import { describe, expect, it } from "vitest"

import { calcularMetricasVidrio, optimizarLaminasVidrio } from "../vidrio"
import { calcularVidrios } from "../motor-8025"
import { DESCUNTOS_DEFAULT, type LaminaVidrio, type VidrioCorte } from "@/lib/types"
import { VENTANAS_CON_VIDRIO_QUE_CABE } from "@/lib/__tests__/fixtures/ventanas-8025"
import { seSolapan, type Rectangulo } from "@/lib/__tests__/helpers"

const pieza = (ancho: number, alto: number, ventana = "v", tipo = "Hoja Móvil 1"): VidrioCorte => ({
    ventana,
    tipo,
    ancho,
    alto,
    area: (ancho * alto) / 1_000_000,
})

describe.each([
    { ancho: 2500, alto: 3600 },
    { ancho: 3300, alto: 2140 },
])("optimizarLaminasVidrio · lámina $ancho x $alto (proyecto real)", ({ ancho, alto }) => {
    const ventanas = [...VENTANAS_CON_VIDRIO_QUE_CABE]
    const piezas = calcularVidrios(ventanas, DESCUNTOS_DEFAULT)
    const laminas = optimizarLaminasVidrio(piezas, { laminaAncho: ancho, laminaAlto: alto })

    it("coloca cada pieza exactamente una vez", () => {
        const colocadas = laminas.flatMap((lamina) => lamina.vidrios)
        expect(colocadas).toHaveLength(piezas.length)
    })

    it("mantiene cada pieza dentro de su lámina", () => {
        for (const lamina of laminas) {
            for (const { vidrio, x, y } of lamina.vidrios) {
                expect(x).toBeGreaterThanOrEqual(0)
                expect(y).toBeGreaterThanOrEqual(0)
                expect(x + vidrio.ancho).toBeLessThanOrEqual(lamina.anchoLamina)
                expect(y + vidrio.alto).toBeLessThanOrEqual(lamina.altoLamina)
            }
        }
    })

    it("no solapa piezas dentro de una misma lámina", () => {
        for (const lamina of laminas) {
            const rectangulos: Rectangulo[] = lamina.vidrios.map(({ vidrio, x, y }) => ({
                x,
                y,
                ancho: vidrio.ancho,
                alto: vidrio.alto,
            }))
            rectangulos.forEach((a, i) => {
                rectangulos.slice(i + 1).forEach((b) => expect(seSolapan(a, b)).toBe(false))
            })
        }
    })

    it("el área usada coincide con la suma de sus piezas", () => {
        for (const lamina of laminas) {
            const suma = lamina.vidrios.reduce((total, { vidrio }) => total + vidrio.area, 0)
            expect(lamina.areaUsada).toBeCloseTo(suma, 6)
        }
    })

    it("piezas + restos + desperdicio cubren exactamente el área de cada lámina (kerf 0)", () => {
        for (const lamina of laminas) {
            const areaLamina = (lamina.anchoLamina * lamina.altoLamina) / 1_000_000
            const areaRestos = lamina.restos.reduce((total, r) => total + (r.ancho * r.alto) / 1_000_000, 0)
            expect(lamina.areaUsada + areaRestos).toBeCloseTo(areaLamina, 6)
        }
    })

    it("baseline: número de láminas usadas", () => {
        expect(laminas.length).toMatchSnapshot()
    })
})

// La separación puede caer en el eje x o en el eje y según qué guillotine split deje menos
// desperdicio (F3.3 elige dinámicamente) — se mide por el eje que de hecho las separa.
function separacionMinima(a: Rectangulo, b: Rectangulo): number {
    const solapaX = a.x < b.x + b.ancho && b.x < a.x + a.ancho
    const solapaY = a.y < b.y + b.alto && b.y < a.y + a.alto
    if (!solapaX) return Math.max(a.x, b.x) - Math.min(a.x + a.ancho, b.x + b.ancho)
    if (!solapaY) return Math.max(a.y, b.y) - Math.min(a.y + a.alto, b.y + b.alto)
    throw new Error("las piezas se solapan")
}

describe("optimizarLaminasVidrio · kerf configurable", () => {
    it("con kerf 5 hay al menos 5mm de separación entre piezas", () => {
        const [lamina] = optimizarLaminasVidrio([pieza(1000, 1000, "a"), pieza(1000, 1000, "b")], {
            laminaAncho: 3300,
            laminaAlto: 2140,
            kerf: 5,
        })
        const [a, b] = lamina.vidrios
        expect(separacionMinima(
            { x: a.x, y: a.y, ancho: a.vidrio.ancho, alto: a.vidrio.alto },
            { x: b.x, y: b.y, ancho: b.vidrio.ancho, alto: b.vidrio.alto }
        )).toBeGreaterThanOrEqual(5)
    })

    it("con kerf 0 la separación no está fija en 5mm (no hardcodeada)", () => {
        const [lamina] = optimizarLaminasVidrio([pieza(1000, 1000, "a"), pieza(1000, 1000, "b")], {
            laminaAncho: 3300,
            laminaAlto: 2140,
            kerf: 0,
        })
        const [a, b] = lamina.vidrios
        const separacion = separacionMinima(
            { x: a.x, y: a.y, ancho: a.vidrio.ancho, alto: a.vidrio.alto },
            { x: b.x, y: b.y, ancho: b.vidrio.ancho, alto: b.vidrio.alto }
        )
        expect(separacion).toBeGreaterThanOrEqual(0)
        expect(separacion).toBeLessThan(5)
    })
})

describe("optimizarLaminasVidrio · clasificación resto/desperdicio", () => {
    it("un sobrante con lado menor >= minResto se clasifica como resto", () => {
        // Lámina 2000x1000, pieza 1000x1000 en la esquina -> sobra una franja de 1000x1000 (lado menor 1000).
        const [lamina] = optimizarLaminasVidrio([pieza(1000, 1000)], {
            laminaAncho: 2000,
            laminaAlto: 1000,
            minResto: 200,
        })
        expect(lamina.restos.length).toBeGreaterThan(0)
        expect(lamina.restos.every((r) => r.tipo === "resto")).toBe(true)
    })

    it("un sobrante con lado menor < minResto se clasifica como desperdicio", () => {
        // Lámina 1100x1000, pieza 1000x1000 -> sobra una franja de 100x1000 (lado menor 100 < 200).
        const [lamina] = optimizarLaminasVidrio([pieza(1000, 1000)], {
            laminaAncho: 1100,
            laminaAlto: 1000,
            minResto: 200,
        })
        expect(lamina.restos.length).toBeGreaterThan(0)
        expect(lamina.restos.every((r) => r.tipo === "desperdicio")).toBe(true)
    })
})

describe("optimizarLaminasVidrio · pieza que no cabe en ninguna lámina", () => {
    it("lanza un error explícito en vez de colocarla fuera de límites", () => {
        // Ninguna orientación de una pieza 4000x1000 entra en una lámina 3300x2140.
        expect(() =>
            optimizarLaminasVidrio([pieza(4000, 1000, "extrema", "Hoja Fija 1")], {
                laminaAncho: 3300,
                laminaAlto: 2140,
            })
        ).toThrow(/no cabe/)
    })
})

// Lámina 2000x1000 (2 m²) con un área usada dada, para medir la merma a mano.
const lamina = (numero: number, areaUsada: number, grupo?: string): LaminaVidrio => ({
    numero,
    anchoLamina: 2000,
    altoLamina: 1000,
    vidrios: [{ vidrio: { ...pieza(1000, 1000), area: areaUsada }, x: 0, y: 0, rotado: false }],
    restos: [],
    grupo,
    areaUsada,
    areaSobrante: 2 - areaUsada,
})

describe("calcularMetricasVidrio · merma sin la última lámina", () => {
    it("no cuenta la última lámina: 2 completas al 75 % y la última casi vacía dan 25 %", () => {
        expect(calcularMetricasVidrio([lamina(1, 1.5), lamina(2, 1.5), lamina(3, 0.1)]).mermaPct).toBeCloseTo(25, 6)
    })

    it("con una sola lámina no hay merma medible", () => {
        expect(calcularMetricasVidrio([lamina(1, 0.5)]).mermaPct).toBeNull()
    })

    it("cada tipo de vidrio excluye su propia última lámina", () => {
        const laminas = [
            lamina(1, 1.8, "Incoloro 4 mm"),
            lamina(2, 0.2, "Incoloro 4 mm"),
            lamina(3, 1.0, "Bronce 5 mm"),
            lamina(4, 0.3, "Bronce 5 mm"),
        ]
        // Solo cuentan la 1 (sobran 0,2) y la 3 (sobra 1,0): 1,2 de 4 m².
        expect(calcularMetricasVidrio(laminas).mermaPct).toBeCloseTo(30, 6)
    })

    it("un tipo con una sola lámina no aporta merma aunque otro tipo sí", () => {
        const laminas = [lamina(1, 1.5, "Incoloro 4 mm"), lamina(2, 0.4, "Incoloro 4 mm"), lamina(3, 0.2, "Gris 6 mm")]
        expect(calcularMetricasVidrio(laminas).mermaPct).toBeCloseTo(25, 6)
    })

    it("sin láminas todo da cero y la merma es null", () => {
        expect(calcularMetricasVidrio([])).toEqual({
            piezas: 0,
            areaNetaM2: 0,
            bordeadoM: 0,
            cantos: 0,
            laminas: 0,
            mermaPct: null,
        })
    })
})

describe("optimizarLaminasVidrio · gancho de veta (piezas que no se pueden girar)", () => {
    const opciones = { laminaAncho: 2000, laminaAlto: 1000 }

    // Tras una pieza de 1100x1000 queda un hueco de 900x1000: una pieza de 1000x900 solo entra girada.
    it("sin veta, la pieza se gira para aprovechar el hueco y todo cabe en una lámina", () => {
        const laminas = optimizarLaminasVidrio([pieza(1100, 1000), pieza(1000, 900)], opciones)
        expect(laminas).toHaveLength(1)
        expect(laminas[0].vidrios.find((v) => v.vidrio.area === 0.9)?.rotado).toBe(true)
    })

    it("con veta no se gira: va derecha a otra lámina aunque cueste una más", () => {
        const conVeta = { ...pieza(1000, 900), permitirGiro: false }
        const laminas = optimizarLaminasVidrio([pieza(1100, 1000), conVeta], opciones)
        expect(laminas).toHaveLength(2)
        const colocada = laminas.flatMap((l) => l.vidrios).find((v) => v.vidrio.area === 0.9)!
        expect(colocada.rotado).toBe(false)
        expect([colocada.vidrio.ancho, colocada.vidrio.alto]).toEqual([1000, 900])
    })

    it("una pieza con veta que solo cabe girada es un error, no un corte en contra de la veta", () => {
        expect(() => optimizarLaminasVidrio([{ ...pieza(1000, 1500), permitirGiro: false }], opciones)).toThrow(/no cabe/)
    })
})

describe("optimizarLaminasVidrio · gancho de inventario de restos", () => {
    const opciones = { laminaAncho: 2000, laminaAlto: 1000 }

    it("sin restos el resultado no cambia", () => {
        const piezas = [pieza(800, 600), pieza(500, 400)]
        expect(optimizarLaminasVidrio(piezas, { ...opciones, restosInventario: [] })).toEqual(
            optimizarLaminasVidrio(piezas, opciones)
        )
    })

    it("usa un resto del inventario antes de abrir una lámina nueva", () => {
        const laminas = optimizarLaminasVidrio([pieza(500, 400)], {
            ...opciones,
            restosInventario: [{ id: "r1", ancho: 600, alto: 450 }],
        })
        expect(laminas).toHaveLength(1)
        expect(laminas[0]).toMatchObject({ restoId: "r1", anchoLamina: 600, altoLamina: 450 })
    })

    it("usa el resto más chico donde cabe y descarta los que no se usaron", () => {
        const laminas = optimizarLaminasVidrio([pieza(500, 400)], {
            ...opciones,
            restosInventario: [
                { id: "grande", ancho: 1500, alto: 900 },
                { id: "chico", ancho: 520, alto: 420 },
            ],
        })
        expect(laminas.map((l) => l.restoId)).toEqual(["chico"])
    })

    it("lo que no cabe en los restos va a láminas nuevas, numeradas después", () => {
        const laminas = optimizarLaminasVidrio([pieza(1800, 900), pieza(500, 400)], {
            ...opciones,
            restosInventario: [{ id: "r1", ancho: 600, alto: 450 }],
        })
        expect(laminas.map((l) => [l.numero, l.restoId])).toEqual([
            [1, "r1"],
            [2, undefined],
        ])
    })
})
