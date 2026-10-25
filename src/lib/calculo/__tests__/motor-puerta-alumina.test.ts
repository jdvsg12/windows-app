import { describe, expect, it } from "vitest"

import { ParametrosPuertaAluminaSchema } from "@/lib/schemas"
import { calcularDespiecePuerta, optimizarPerfilesPuertas, sumarAccesoriosPuertas } from "../motor-puerta-alumina"

const PARAMETROS = ParametrosPuertaAluminaSchema.parse({})
const VANO = { ancho: 654, alto: 1984 }

describe("puerta abatible Alumina · vano 654 × 1984 mm", () => {
    const despiece = calcularDespiecePuerta(VANO, PARAMETROS)

    it("usa los descuentos del taller por defecto", () => {
        expect(PARAMETROS).toEqual({
            descuentoAnchoHoja: 58,
            descuentoAltoHoja: 40,
            descuentoPisavidrioHorizontal: 198,
            descuentoPisavidrioVertical: 216,
            descuentoAnchoVidrio: 190,
            descuentoAltoVidrio: 190,
            tornillosInstalacion: 8,
            espesorSierra: 4,
        })
    })

    it("hoja de 596 × 1944 mm", () => {
        expect(despiece.hoja).toEqual({ ancho: 596, alto: 1944 })
    })

    it("despiece de perfiles con sus cortes", () => {
        expect(despiece.piezas.map(({ referencia, pieza, cantidad, longitud, cortes }) => [referencia, pieza, cantidad, longitud, cortes])).toEqual([
            ["U-57", "Marco horizontal superior", 1, 654, [45, 45]],
            ["U-57", "Marco vertical izquierdo", 1, 1984, [45, 90]],
            ["U-57", "Marco vertical derecho", 1, 1984, [45, 90]],
            ["VP-1102", "Hoja horizontal superior", 1, 596, [45, 45]],
            ["VP-1102", "Hoja horizontal inferior", 1, 596, [45, 45]],
            ["VP-1102", "Hoja vertical izquierdo", 1, 1944, [45, 45]],
            ["VP-1102", "Hoja vertical derecho", 1, 1944, [45, 45]],
            ["PISAVIDRIO-CUADRADO", "Pisavidrio horizontal superior", 1, 398, [90, 90]],
            ["PISAVIDRIO-CUADRADO", "Pisavidrio horizontal inferior", 1, 398, [90, 90]],
            ["PISAVIDRIO-CUADRADO", "Pisavidrio vertical izquierdo", 1, 1728, [90, 90]],
            ["PISAVIDRIO-CUADRADO", "Pisavidrio vertical derecho", 1, 1728, [90, 90]],
        ])
    })

    it("un vidrio de 406 × 1754 mm = 0,712124 m²", () => {
        expect(despiece.vidrio).toEqual({ cantidad: 1, ancho: 406, alto: 1754, area: 0.712124 })
    })

    it("accesorios y herrajes por puerta", () => {
        expect(despiece.accesorios).toEqual({
            bisagraOmega: 4,
            tornilloBisagra: 32,
            cerraduraKL: 1,
            escuadraEnsamble: 4,
            anguloArme: 2,
            tornilloInstalacion: 8,
        })
    })

    it("consumo neto 4622 / 5080 / 4252 mm: una barra de 6 m por referencia, con sus sobrantes", () => {
        const barras = optimizarPerfilesPuertas([despiece], PARAMETROS)
        expect(barras["U-57"]).toEqual({ barras: [{ piezas: [1984, 1984, 654], sobrante: 1366 }], consumoNeto: 4622, sobranteTotal: 1366 })
        expect(barras["VP-1102"]).toEqual({ barras: [{ piezas: [1944, 1944, 596, 596], sobrante: 904 }], consumoNeto: 5080, sobranteTotal: 904 })
        expect(barras["PISAVIDRIO-CUADRADO"]).toEqual({
            barras: [{ piezas: [1728, 1728, 398, 398], sobrante: 1732 }],
            consumoNeto: 4252,
            sobranteTotal: 1732,
        })
    })
})

describe("puerta abatible Alumina · parámetros y validación", () => {
    it("los descuentos provisionales y los tornillos de instalación se pueden cambiar", () => {
        const despiece = calcularDespiecePuerta(VANO, {
            ...PARAMETROS,
            descuentoPisavidrioHorizontal: 200,
            descuentoPisavidrioVertical: 210,
            descuentoAnchoVidrio: 186,
            descuentoAltoVidrio: 188,
            tornillosInstalacion: 6,
        })
        const pisavidrio = despiece.piezas.filter((pieza) => pieza.referencia === "PISAVIDRIO-CUADRADO").map((pieza) => pieza.longitud)
        expect(pisavidrio).toEqual([396, 396, 1734, 1734])
        expect([despiece.vidrio.ancho, despiece.vidrio.alto]).toEqual([410, 1756])
        expect(despiece.accesorios.tornilloInstalacion).toBe(6)
        // Los perfiles de marco y hoja no dependen de esos descuentos.
        expect(despiece.hoja).toEqual({ ancho: 596, alto: 1944 })
    })

    it("un vano que deja piezas en cero o negativas es un error que las nombra", () => {
        expect(() => calcularDespiecePuerta({ ancho: 240, alto: 1984 }, PARAMETROS)).toThrow(
            "La puerta de 240 × 1984 mm da medidas no positivas: Pisavidrio horizontal superior (-16 mm), Pisavidrio horizontal inferior (-16 mm), Vidrio ancho (-8 mm)",
        )
        expect(() => calcularDespiecePuerta({ ancho: 0, alto: 0 }, PARAMETROS)).toThrow("Marco horizontal superior (0 mm)")
        expect(() => calcularDespiecePuerta({ ancho: Number.NaN, alto: 1984 }, PARAMETROS)).toThrow("medidas no positivas")
    })

    it("varias puertas comparten barras por referencia y suman accesorios", () => {
        const despieces = [calcularDespiecePuerta(VANO, PARAMETROS), calcularDespiecePuerta(VANO, PARAMETROS)]
        const barras = optimizarPerfilesPuertas(despieces, PARAMETROS)
        expect(barras["U-57"].consumoNeto).toBe(2 * 4622)
        expect(barras["U-57"].barras).toHaveLength(2)
        expect(sumarAccesoriosPuertas(despieces)).toEqual({
            bisagraOmega: 8,
            tornilloBisagra: 64,
            cerraduraKL: 2,
            escuadraEnsamble: 8,
            anguloArme: 4,
            tornilloInstalacion: 16,
        })
    })

    it("un parámetro guardado antes de agregar otros toma el valor por defecto de los que faltan", () => {
        expect(ParametrosPuertaAluminaSchema.parse({ descuentoAnchoHoja: 60 })).toEqual({ ...PARAMETROS, descuentoAnchoHoja: 60 })
        expect(ParametrosPuertaAluminaSchema.safeParse({ espesorSierra: -1 }).success).toBe(false)
    })
})
