import { describe, expect, it } from "vitest"

import { formatArea, formatCount, formatCurrency, formatDate, formatMeters, formatMm } from "@/lib/format"

describe("lib/format", () => {
    it("formatCurrency: sin decimales, con separador de miles es-CO", () => {
        expect(formatCurrency(1026768)).toBe("$1.026.768")
        expect(formatCurrency(0)).toBe("$0")
        expect(formatCurrency(undefined)).toBe("$0")
    })

    it("formatArea: 2 decimales por defecto, con m²", () => {
        expect(formatArea(10.6)).toBe("10,60 m²")
        expect(formatArea(4.2, 3)).toBe("4,200 m²")
        expect(formatArea(undefined)).toBe("0,00 m²")
    })

    it("formatMm: sin decimales, con mm", () => {
        expect(formatMm(954.4)).toBe("954 mm")
        expect(formatMm(undefined)).toBe("0 mm")
    })

    it("formatMeters: 2 decimales por defecto, con m", () => {
        expect(formatMeters(69.36)).toBe("69,36 m")
        expect(formatMeters(undefined)).toBe("0,00 m")
    })

    it("formatCount: 1 decimal por defecto, sin unidad", () => {
        expect(formatCount(10.55)).toBe("10,6")
        expect(formatCount(2)).toBe("2,0")
    })

    it("formatDate: dd/mm/aaaa es-CO", () => {
        expect(formatDate("2026-09-24T00:00:00")).toBe("24/9/2026")
        expect(formatDate(new Date(2026, 8, 24))).toBe("24/9/2026")
    })
})
