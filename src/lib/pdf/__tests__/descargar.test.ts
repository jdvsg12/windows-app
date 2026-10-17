import { describe, expect, it } from "vitest"

import { nombreArchivoPdf } from "@/lib/pdf/descargar"

describe("nombre del archivo PDF", () => {
    it("une el prefijo y el proyecto, con guiones bajos en vez de espacios", () => {
        expect(nombreArchivoPdf("Cotizacion", "Casa  López ")).toBe("Cotizacion_Casa_López.pdf")
    })
})
