import { describe, expect, it } from "vitest"

import { PORCENTAJE_ANTICIPO, metrosDesdeMm, numeroItem, resumenPago, textoFormaPago } from "@/lib/pdf/cotizacion-formato"

describe("formato de la cotización", () => {
    it("anticipo del 60 % y saldo del 40 %", () => {
        expect(PORCENTAJE_ANTICIPO).toBe(60)
        expect(resumenPago(9_399_097)).toEqual({ anticipo: 5_639_458, saldo: 3_759_639 })
    })

    it("anticipo y saldo suman el total exacto aunque haya redondeo", () => {
        const { anticipo, saldo } = resumenPago(1_001) ?? { anticipo: 0, saldo: 0 }
        expect(anticipo + saldo).toBe(1_001)
    })

    it("sin total no hay resumen de pago", () => {
        expect(resumenPago(null)).toBeNull()
    })

    it("medidas en metros con coma decimal", () => {
        expect(metrosDesdeMm(2050)).toBe("2,05 m")
        expect(metrosDesdeMm(1000)).toBe("1,00 m")
        expect(metrosDesdeMm(985)).toBe("0,99 m")
    })

    it("ítems con dos cifras", () => {
        expect(numeroItem(0)).toBe("01")
        expect(numeroItem(11)).toBe("12")
    })

    it("forma de pago: con valores lleva los montos, sin valores solo los porcentajes", () => {
        expect(textoFormaPago({ anticipo: 600, saldo: 400 })).toBe(
            "Anticipo del 60 % ($600). Saldo del 40 % ($400): pagos parciales según avance de la obra.",
        )
        expect(textoFormaPago(null)).toBe("Anticipo del 60 %. Saldo: pagos parciales según avance de la obra.")
    })
})
