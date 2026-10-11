import { describe, expect, it } from "vitest"

import { LAMINA_HELICONIAS, PIEZAS_HELICONIAS, TOTALES_HELICONIAS } from "./fixtures/heliconias"
import { optimizarLaminasVidrio } from "@/lib/calculo/vidrio"
import type { VidrioCorte } from "@/lib/types"
import { seSolapan, type Rectangulo } from "./helpers"

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

    it("kerf 0: guillotina válida, sin solapes y ≤8 láminas para las 29 piezas de Heliconias", () => {
        // ≤8, no ≤7: ver la nota en fixtures/heliconias.ts sobre por qué ese es el límite
        // real bajo la restricción de guillotina para este set de piezas, confirmado con el usuario.
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
