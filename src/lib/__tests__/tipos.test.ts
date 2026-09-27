import { describe, expect, it } from "vitest"

import { TIPOS_HABILITADOS, opcionesTipo } from "@/lib/types"

describe("tipos de ventana habilitados en el formulario", () => {
    it("ofrece de 2 a 6 hojas y no '1 móvil + 1 fija'", () => {
        expect(TIPOS_HABILITADOS).toEqual(["2hojas", "3hojas", "4hojas", "5hojas", "6hojas"])
    })

    it("ventana nueva: solo opciones habilitadas, ninguna deshabilitada", () => {
        const opciones = opcionesTipo()
        expect(opciones.map((o) => o.value)).toEqual(TIPOS_HABILITADOS)
        expect(opciones.every((o) => !o.disabled)).toBe(true)
    })

    it("ventana guardada como 1 móvil + 1 fija: conserva su tipo como opción deshabilitada", () => {
        const opciones = opcionesTipo("2hojas_mixto")
        expect(opciones).toHaveLength(TIPOS_HABILITADOS.length + 1)
        expect(opciones.at(-1)).toEqual({
            value: "2hojas_mixto",
            label: "1 Móvil + 1 Fija (no disponible)",
            disabled: true,
        })
    })

    it("ventana de un tipo habilitado: no agrega nada", () => {
        expect(opcionesTipo("3hojas")).toHaveLength(TIPOS_HABILITADOS.length)
    })
})
