import { describe, expect, it } from "vitest"

import { asignarCodigos, codigoPieza } from "../codigos"
import { calcularVidrios } from "../motor-8025"
import { calcularPlanCorte } from "../plan"
import { DESCUNTOS_DEFAULT, type TipoVentana, type Ventana } from "@/lib/types"

const ventana = (id: string, tipoVentana: TipoVentana, extra: Partial<Ventana> = {}): Ventana => ({
    id,
    nombre: id,
    ancho: 2400,
    alto: 1500,
    tipoVentana,
    sistema: "8025",
    ...extra,
})

const codigosDe = (v: Ventana, numero = 1) =>
    asignarCodigos(calcularVidrios([v], DESCUNTOS_DEFAULT), [v])
        .map((pieza) => `${pieza.codigo}${pieza.hoja?.cerradura ? "*" : ""}`)
        .map((codigo) => codigo.replace("V1-", `V${numero}-`))
        .sort()

describe("códigos de pieza V#-F#/M# (cerradura marcada con *)", () => {
    it("formato de dos niveles: ventana y hoja", () => {
        expect(codigoPieza(3, { tipo: "movil", numero: 1, cerradura: false })).toBe("V3-M1")
        expect(codigoPieza(12, { tipo: "fija", numero: 1, cerradura: false })).toBe("V12-F1")
    })

    it("2 hojas móviles: M1 y M2, cerradura en M2", () => {
        expect(codigosDe(ventana("a", "2hojas"))).toEqual(["V1-M1", "V1-M2*"])
    })

    it("1 fija + 1 móvil: F1 y M1, cerradura en la móvil", () => {
        expect(codigosDe(ventana("a", "2hojas_mixto"))).toEqual(["V1-F1", "V1-M1*"])
    })

    it("3 hojas: F1, M1 y M2, cerradura en la última móvil", () => {
        expect(codigosDe(ventana("a", "3hojas"))).toEqual(["V1-F1", "V1-M1", "V1-M2*"])
    })

    it("4 hojas: F1, M1, M2 y M3, cerradura en la última móvil", () => {
        expect(codigosDe(ventana("a", "4hojas"))).toEqual(["V1-F1", "V1-M1", "V1-M2", "V1-M3*"])
    })

    it("6 hojas: F1 y M1…M5, cerradura en M5", () => {
        expect(codigosDe(ventana("a", "6hojas"))).toEqual(["V1-F1", "V1-M1", "V1-M2", "V1-M3", "V1-M4", "V1-M5*"])
    })

    it("cada ventana lleva exactamente una cerradura", () => {
        const tipos: TipoVentana[] = ["2hojas", "2hojas_mixto", "3hojas", "4hojas", "5hojas", "6hojas"]
        for (const tipo of tipos) {
            const piezas = calcularVidrios([ventana("a", tipo)], DESCUNTOS_DEFAULT)
            expect(piezas.filter((pieza) => pieza.hoja?.cerradura)).toHaveLength(1)
        }
    })

    it("el número de ventana sale del orden del proyecto, aunque la pieza quede en otro grupo de vidrio", () => {
        const ventanas = [
            ventana("sala", "2hojas"),
            ventana("cocina", "2hojas"),
            ventana("bano", "2hojas", { colorVidrio: "bronce", calibreVidrio: 5 }),
        ]
        const plan = calcularPlanCorte({
            ventanas,
            descuentos: DESCUNTOS_DEFAULT,
            precios: { tamanoLamina: "2440x3660", kerfVidrio: 0, minRestoVidrio: 200 },
        })
        const bronce = plan.vidrios.filter((pieza) => pieza.grupo === "Bronce 5 mm").map((pieza) => pieza.codigo)
        expect(bronce.sort()).toEqual(["V3-M1", "V3-M2"])
        expect(plan.vidrios.every((pieza) => pieza.codigo)).toBe(true)
    })
})
