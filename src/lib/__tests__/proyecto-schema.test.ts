import { describe, expect, it } from "vitest"
import { z } from "zod"

import { ProyectoSchema } from "@/lib/schemas"

const proyecto = (cambios: Record<string, unknown> = {}) => ({
    id: "p1",
    nombre: "Obra",
    cliente: "",
    fechaCreacion: "2026-10-01T12:00:00.000Z",
    ventanas: [],
    duracionMeses: 2,
    transporte: 50000,
    ...cambios,
})

describe("ProyectoSchema · datos dañados por el formulario", () => {
    // Un campo numérico vacío daba NaN, que JSON guarda como null.
    it("transporte null se repara a 0 en vez de invalidar el proyecto", () => {
        expect(ProyectoSchema.parse(proyecto({ transporte: null })).transporte).toBe(0)
    })

    it("duración null o 0 se repara a 1 mes", () => {
        expect(ProyectoSchema.parse(proyecto({ duracionMeses: null })).duracionMeses).toBe(1)
        expect(ProyectoSchema.parse(proyecto({ duracionMeses: 0 })).duracionMeses).toBe(1)
    })

    it("un proyecto con transporte null ya no hace desaparecer a los demás", () => {
        const guardados = [proyecto({ id: "a" }), proyecto({ id: "b", transporte: null })]
        const resultado = z.array(ProyectoSchema).safeParse(guardados)
        expect(resultado.success).toBe(true)
        expect(resultado.data?.map((p) => p.id)).toEqual(["a", "b"])
    })

    it("los valores válidos no cambian", () => {
        const { duracionMeses, transporte } = ProyectoSchema.parse(proyecto())
        expect({ duracionMeses, transporte }).toEqual({ duracionMeses: 2, transporte: 50000 })
    })
})
