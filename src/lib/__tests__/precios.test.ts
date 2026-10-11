import { describe, expect, it } from "vitest"

import { conPrecioOpcional, precioDesdeTexto } from "@/lib/precios"
import type { TipoCerradura } from "@/lib/types"

describe("lib/precios", () => {
    it("conPrecioOpcional pone o quita el precio de un tipo sin tocar los demás", () => {
        const base: Partial<Record<TipoCerradura, number>> = { manija: 40000, dummy: 15000 }
        expect(conPrecioOpcional(base, "impacto", 30000)).toEqual({ manija: 40000, dummy: 15000, impacto: 30000 })
        expect(conPrecioOpcional(base, "manija", undefined)).toEqual({ dummy: 15000 })
        expect(base).toEqual({ manija: 40000, dummy: 15000 })
    })

    it("precioDesdeTexto: vacío, cero, negativo o inválido = sin precio propio", () => {
        expect(precioDesdeTexto("45000")).toBe(45000)
        expect(precioDesdeTexto("")).toBeUndefined()
        expect(precioDesdeTexto("0")).toBeUndefined()
        expect(precioDesdeTexto("-5")).toBeUndefined()
        expect(precioDesdeTexto("abc")).toBeUndefined()
    })
})
