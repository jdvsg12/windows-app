import { describe, expect, it } from "vitest"

import { SISTEMAS_HABILITADOS, opcionesSistema, sistemaParaVentanaNueva } from "../registro"

describe("sistemas habilitados en el formulario", () => {
    it("solo 8025 está habilitado", () => {
        expect(SISTEMAS_HABILITADOS).toEqual(["8025"])
    })

    it("ventana nueva: solo se ofrece 8025", () => {
        expect(opcionesSistema()).toEqual([{ value: "8025", label: "8025", disabled: false }])
    })

    it("ventana con 8025: no aparece nada más", () => {
        expect(opcionesSistema("8025")).toHaveLength(1)
    })

    it.each(["5020", "744", "7038"] as const)("ventana guardada con %s: conserva su sistema como opción deshabilitada", (sistema) => {
        const opciones = opcionesSistema(sistema)
        expect(opciones.map((o) => o.value)).toEqual(["8025", sistema])
        expect(opciones[1]).toEqual({ value: sistema, label: `${sistema} (no validado)`, disabled: true })
    })
})

describe("sistema que recuerda el formulario para la ventana siguiente", () => {
    it("recuerda uno habilitado", () => {
        expect(sistemaParaVentanaNueva("8025")).toBe("8025")
    })

    it.each(["5020", "744", "7038"] as const)("no arrastra %s (no habilitado) a una ventana nueva", (sistema) => {
        expect(sistemaParaVentanaNueva(sistema)).toBe("8025")
    })

    it("sin valor previo usa el primero habilitado", () => {
        expect(sistemaParaVentanaNueva()).toBe("8025")
    })
})
