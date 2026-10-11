import { describe, expect, it } from "vitest"

import { TIPOS_HABILITADOS, opcionesTipo, tipoDesdeFormulario, tipoParaFormulario } from "@/lib/types"

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

describe("2 hojas en el formulario: checkbox 'ambas móviles'", () => {
    it("2 hojas con ambas móviles se guarda como '2hojas'", () => {
        expect(tipoDesdeFormulario("2hojas", true)).toBe("2hojas")
    })

    it("2 hojas sin ambas móviles se guarda como 1 móvil + 1 fija", () => {
        expect(tipoDesdeFormulario("2hojas", false)).toBe("2hojas_mixto")
    })

    it("el checkbox no afecta a los demás tipos", () => {
        expect(tipoDesdeFormulario("3hojas", false)).toBe("3hojas")
    })

    it("una ventana 1 móvil + 1 fija se edita como 2 hojas sin ambas móviles", () => {
        expect(tipoParaFormulario("2hojas_mixto")).toEqual({ tipoVentana: "2hojas", ambasMoviles: false })
        expect(tipoParaFormulario("2hojas")).toEqual({ tipoVentana: "2hojas", ambasMoviles: true })
    })
})
