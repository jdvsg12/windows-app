import { describe, expect, it } from "vitest"

import { optimizarBarras } from "../barras"

const BARRA = { longitudBarra: 6000, espesorSierra: 4 }

describe("optimizarBarras (mm, con espesor de sierra)", () => {
    it("n piezas en una barra gastan n cortes: n − 1 entre piezas y uno para separar el sobrante", () => {
        expect(optimizarBarras([654, 1984, 1984], BARRA)).toEqual({
            barras: [{ piezas: [1984, 1984, 654], sobrante: 6000 - 4622 - 3 * 4 }],
            consumoNeto: 4622,
            sobranteTotal: 1366,
        })
    })

    it("piezas que llenan la barra exacta no necesitan el último corte", () => {
        expect(optimizarBarras([2998, 2998], BARRA).barras).toEqual([{ piezas: [2998, 2998], sobrante: 0 }])
    })

    it("el espesor de sierra puede obligar a abrir otra barra", () => {
        const { barras } = optimizarBarras([3000, 3000], BARRA)
        expect(barras.map((barra) => barra.piezas)).toEqual([[3000], [3000]])
        expect(optimizarBarras([3000, 3000], { ...BARRA, espesorSierra: 0 }).barras).toHaveLength(1)
    })

    it("acomoda de mayor a menor en la primera barra donde cabe (First Fit Decreasing)", () => {
        const { barras } = optimizarBarras([1000, 4000, 2500, 1900], BARRA)
        expect(barras.map((barra) => barra.piezas)).toEqual([[4000, 1900], [2500, 1000]])
    })

    it("sin piezas no hay barras; una pieza más larga que la barra es un error", () => {
        expect(optimizarBarras([], BARRA)).toEqual({ barras: [], consumoNeto: 0, sobranteTotal: 0 })
        expect(() => optimizarBarras([6001], BARRA)).toThrow("6001 mm no cabe en una barra de 6000 mm")
    })
})
