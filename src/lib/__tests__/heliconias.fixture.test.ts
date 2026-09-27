import { describe, expect, it } from "vitest"

import { LAMINA_HELICONIAS, PIEZAS_HELICONIAS, TOTALES_HELICONIAS } from "./fixtures/heliconias"

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

describe("optimizador de vidrio (módulo nuevo, F3)", () => {
    it.todo("kerf 0: guillotina válida, sin solapes y ≤7 láminas para las 29 piezas de Heliconias")
    it.todo("clasifica restos (lado menor ≥ 200 mm) y desperdicios; suma piezas + restos + desperdicios = área de la lámina")
    it.todo("costo del vidrio = láminas enteras consumidas × precio de lámina")
})
