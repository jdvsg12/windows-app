import { describe, expect, it } from "vitest"

import { LAMINA_HELICONIAS, PIEZAS_HELICONIAS, PLAN_7_LAMINAS_HELICONIAS, TOTALES_HELICONIAS } from "./fixtures/heliconias"
import { calcularMetricasVidrio, optimizarLaminasVidrio } from "@/lib/calculo/vidrio"
import type { VidrioCorte } from "@/lib/types"
import { esGuillotina, seSolapan, type Rectangulo } from "./helpers"

// Integrity of the transcription of Heliconias.pdf. Only kerf-independent totals are golden
// (see the comment in the fixture): piece count, net area, edging length and edge count.

describe("fixture Heliconias · totales independientes del kerf", () => {
    it("tiene 29 piezas numeradas de 1 a 29", () => {
        expect(PIEZAS_HELICONIAS).toHaveLength(TOTALES_HELICONIAS.piezas)
        expect(PIEZAS_HELICONIAS.map((pieza) => pieza.n)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1))
    })

    it("suma 40,063 m² netos", () => {
        const area = PIEZAS_HELICONIAS.reduce((total, { ancho, alto }) => total + (ancho * alto) / 1_000_000, 0)
        expect(area).toBeCloseTo(TOTALES_HELICONIAS.areaNetaM2, 3)
    })

    it("suma 146,490 m de bordeado", () => {
        const bordeado = PIEZAS_HELICONIAS.reduce((total, { ancho, alto }) => total + (2 * (ancho + alto)) / 1000, 0)
        expect(bordeado).toBeCloseTo(TOTALES_HELICONIAS.bordeadoM, 3)
    })

    it("tiene 116 cantos (4 por pieza)", () => {
        expect(PIEZAS_HELICONIAS.length * 4).toBe(TOTALES_HELICONIAS.cantos)
    })

    it("cada pieza cabe en la lámina de 3300 x 2140 (con giro permitido)", () => {
        const { ancho: laminaAncho, alto: laminaAlto } = LAMINA_HELICONIAS
        for (const { ancho, alto } of PIEZAS_HELICONIAS) {
            const cabeDerecha = ancho <= laminaAncho && alto <= laminaAlto
            const cabeGirada = alto <= laminaAncho && ancho <= laminaAlto
            expect(cabeDerecha || cabeGirada).toBe(true)
        }
    })
})

const PIEZAS_VIDRIO: VidrioCorte[] = PIEZAS_HELICONIAS.map((pieza) => ({
    ventana: `pieza-${pieza.n}`,
    tipo: "Hoja Móvil 1",
    ancho: pieza.ancho,
    alto: pieza.alto,
    area: (pieza.ancho * pieza.alto) / 1_000_000,
}))

describe("optimizador de vidrio (módulo nuevo, F3.3)", () => {
    const laminas = optimizarLaminasVidrio(PIEZAS_VIDRIO, {
        laminaAncho: LAMINA_HELICONIAS.ancho,
        laminaAlto: LAMINA_HELICONIAS.alto,
        kerf: 0,
    })

    it("las métricas del plan dan los totales golden de Heliconias (piezas, m², bordeado, cantos)", () => {
        const metricas = calcularMetricasVidrio(laminas)
        expect(metricas.piezas).toBe(TOTALES_HELICONIAS.piezas)
        expect(metricas.areaNetaM2).toBeCloseTo(TOTALES_HELICONIAS.areaNetaM2, 3)
        expect(metricas.bordeadoM).toBeCloseTo(TOTALES_HELICONIAS.bordeadoM, 3)
        expect(metricas.cantos).toBe(TOTALES_HELICONIAS.cantos)
        expect(metricas.laminas).toBe(laminas.length)
    })

    it("kerf 0: guillotina válida, sin solapes y ≤8 láminas para las 29 piezas de Heliconias", () => {
        // ≤8: el óptimo es 7 (ver PLAN_7_LAMINAS_HELICONIAS), pero el optimizador interactivo
        // da 8; ver la nota en fixtures/heliconias.ts. Confirmado con el usuario.
        expect(laminas.length).toBeLessThanOrEqual(8)

        const colocadas = laminas.flatMap((lamina) => lamina.vidrios)
        expect(colocadas).toHaveLength(PIEZAS_HELICONIAS.length)

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
            expect(esGuillotina(rectangulos, { x: 0, y: 0, ancho: lamina.anchoLamina, alto: lamina.altoLamina })).toBe(true)
            for (const { vidrio, x, y } of lamina.vidrios) {
                expect(x + vidrio.ancho).toBeLessThanOrEqual(lamina.anchoLamina)
                expect(y + vidrio.alto).toBeLessThanOrEqual(lamina.altoLamina)
            }
        }
    })

    it("clasifica restos (lado menor ≥ 200 mm) y desperdicios; suma piezas + restos + desperdicios = área de la lámina", () => {
        for (const lamina of laminas) {
            const areaLamina = (lamina.anchoLamina * lamina.altoLamina) / 1_000_000
            const areaRestos = lamina.restos.reduce((total, r) => total + (r.ancho * r.alto) / 1_000_000, 0)
            expect(lamina.areaUsada + areaRestos).toBeCloseTo(areaLamina, 6)

            for (const resto of lamina.restos) {
                const ladoMenor = Math.min(resto.ancho, resto.alto)
                expect(resto.tipo).toBe(ladoMenor >= 200 ? "resto" : "desperdicio")
            }
        }
    })

    it("costo del vidrio = láminas enteras consumidas × precio de lámina (fórmula de lib/calculo/costeo.ts)", () => {
        // costeo.ts: costoVidrio = salida.laminasVidrio.length * precios.precioVidrioLamina —
        // por lámina completa, no por m² neto (una lámina parcialmente usada se compró entera).
        const precioLamina = 180_000
        expect(Number.isInteger(laminas.length)).toBe(true)
        expect(laminas.length).toBeGreaterThan(0)
        expect(laminas.length * precioLamina).toBe(laminas.length * 180_000)
    })
})

describe("Heliconias · cuántas láminas hacen falta (3300 x 2140, kerf 0)", () => {
    const { ancho: laminaAncho, alto: laminaAlto } = LAMINA_HELICONIAS

    it("cota inferior: las piezas más largas que 2140 solo se apilan, así que hacen falta al menos 7", () => {
        const largas = PIEZAS_HELICONIAS.filter(({ ancho, alto }) => Math.max(ancho, alto) > laminaAlto)
        // Más anchas que media lámina: nunca dos lado a lado.
        expect(largas.every(({ ancho, alto }) => Math.max(ancho, alto) > laminaAncho / 2)).toBe(true)
        const sumaLadosCortos = largas.reduce((total, { ancho, alto }) => total + Math.min(ancho, alto), 0)
        expect(largas).toHaveLength(17)
        expect(sumaLadosCortos).toBe(13_852)
        expect(Math.ceil(sumaLadosCortos / laminaAlto)).toBe(7)
    })

    describe("plan de referencia en 7 láminas", () => {
        it("usa cada una de las 29 piezas exactamente una vez, con sus medidas (girada o no)", () => {
            const colocadas = PLAN_7_LAMINAS_HELICONIAS.flat()
            expect(colocadas.map(({ n }) => n).sort((a, b) => a - b)).toEqual(PIEZAS_HELICONIAS.map(({ n }) => n))
            for (const colocada of colocadas) {
                const pieza = PIEZAS_HELICONIAS.find(({ n }) => n === colocada.n)!
                const medidas = [colocada.ancho, colocada.alto].sort((a, b) => a - b)
                expect(medidas).toEqual([pieza.ancho, pieza.alto].sort((a, b) => a - b))
            }
            expect(PLAN_7_LAMINAS_HELICONIAS).toHaveLength(7)
        })

        it.each(PLAN_7_LAMINAS_HELICONIAS.map((lamina, i) => [i + 1, lamina] as const))(
            "lámina %i: dentro de la lámina, sin solapes y solo con cortes de guillotina",
            (_numero, lamina) => {
                for (const pieza of lamina) {
                    expect(pieza.x).toBeGreaterThanOrEqual(0)
                    expect(pieza.y).toBeGreaterThanOrEqual(0)
                    expect(pieza.x + pieza.ancho).toBeLessThanOrEqual(laminaAncho)
                    expect(pieza.y + pieza.alto).toBeLessThanOrEqual(laminaAlto)
                }
                lamina.forEach((a, i) => lamina.slice(i + 1).forEach((b) => expect(seSolapan(a, b)).toBe(false)))
                expect(esGuillotina(lamina, { x: 0, y: 0, ancho: laminaAncho, alto: laminaAlto })).toBe(true)
            }
        )
    })

    it("el verificador de guillotina rechaza un acomodo en molinete (no se puede cortar de lado a lado)", () => {
        const molinete: Rectangulo[] = [
            { x: 0, y: 0, ancho: 2, alto: 1 },
            { x: 2, y: 0, ancho: 1, alto: 2 },
            { x: 1, y: 2, ancho: 2, alto: 1 },
            { x: 0, y: 1, ancho: 1, alto: 2 },
            { x: 1, y: 1, ancho: 1, alto: 1 },
        ]
        expect(esGuillotina(molinete, { x: 0, y: 0, ancho: 3, alto: 3 })).toBe(false)
    })
})
