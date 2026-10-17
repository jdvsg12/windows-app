import { describe, expect, it } from "vitest"

import {
    agruparPorColorAluminio,
    agruparPorTipoVidrio,
    fusionarLaminasPorTipo,
    fusionarPerfilesPorColor,
} from "../grupos"
import { calcularCosteo } from "../costeo"
import { calcularVidrios, optimizarCortes } from "../motor-8025"
import { optimizarLaminasVidrio } from "../vidrio"
import { DESCUNTOS_DEFAULT, TAMANOS_LAMINA, type ConfiguracionPrecios } from "@/lib/types"
import { VENTANAS_8025 } from "@/lib/__tests__/fixtures/ventanas-8025"

const base = VENTANAS_8025.find((v) => v.nombre === "3hojas-tipica")!
const natural = { ...base, id: "a", nombre: "A" }
const negra = { ...base, id: "b", nombre: "B", colorAluminio: "negro" as const }
const bronce5 = { ...base, id: "c", nombre: "C", colorVidrio: "bronce" as const, calibreVidrio: 5 as const }

describe("agrupación por material que no se mezcla", () => {
    it("ventanas sin color van al grupo natural / incoloro 4 mm", () => {
        expect(agruparPorColorAluminio([base]).map((g) => g.color)).toEqual(["natural"])
        expect(agruparPorTipoVidrio([base]).map((g) => g.etiqueta)).toEqual(["Incoloro 4 mm"])
    })

    it("separa por color de aluminio y por tipo de vidrio", () => {
        expect(agruparPorColorAluminio([natural, negra, bronce5]).map((g) => [g.color, g.ventanas.length])).toEqual([
            ["natural", 2],
            ["negro", 1],
        ])
        expect(agruparPorTipoVidrio([natural, negra, bronce5]).map((g) => [g.clave, g.ventanas.length])).toEqual([
            ["incoloro-4", 2],
            ["bronce-5", 1],
        ])
    })

    it("con un solo color las claves de perfiles no cambian", () => {
        const optimizacion = optimizarCortes([natural], DESCUNTOS_DEFAULT)
        expect(fusionarPerfilesPorColor([{ color: "natural", optimizacion }])).toBe(optimizacion)
    })

    it("con varios colores las claves llevan el color y conservan el tipo de perfil al final", () => {
        const fusion = fusionarPerfilesPorColor([
            { color: "natural", optimizacion: optimizarCortes([natural], DESCUNTOS_DEFAULT) },
            { color: "negro", optimizacion: optimizarCortes([negra], DESCUNTOS_DEFAULT) },
        ])
        const claves = Object.keys(fusion)
        expect(claves.some((c) => c.startsWith("Negro · "))).toBe(true)
        expect(claves.every((c) => c.split(" - ").at(-1))).toBe(true)
    })

    it("renumera las láminas entre grupos y las etiqueta con su tipo de vidrio", () => {
        const opciones = { laminaAncho: 2500, laminaAlto: 3600 }
        const laminas = fusionarLaminasPorTipo(
            agruparPorTipoVidrio([natural, bronce5]).map(({ etiqueta, ventanas }) => ({
                etiqueta,
                laminas: optimizarLaminasVidrio(calcularVidrios(ventanas, DESCUNTOS_DEFAULT), opciones),
            }))
        )
        expect(laminas.map((l) => l.numero)).toEqual(laminas.map((_, i) => i + 1))
        expect(new Set(laminas.map((l) => l.grupo))).toEqual(new Set(["Incoloro 4 mm", "Bronce 5 mm"]))
        expect(laminas.every((l) => l.vidrios.every((item) => item.vidrio.grupo === l.grupo))).toBe(true)
    })
})

describe("la pestaña y la cotización cuentan el mismo material", () => {
    const precios = {
        precioCabezal: 1, precioSillar: 1, precioJamba: 1, precioEnganche: 1, precioTraslape: 1,
        precioHorizontalSuperior: 1, precioHorizontalInferior: 1, precioGuia: 0, precioRodachina: 0,
        precioCerradura: 0, precioTornillo8mm: 0, precioTornillo10mm: 0, precioEmpaque: 0,
        precioVidrioLamina: 1, preciosVidrio: {}, precioSandblasting: 0, recargosColorAluminio: {}, preciosCerradura: {}, preciosRodachina: {},
        tamanoLamina: "2500x3600", kerfVidrio: 0, minRestoVidrio: 200, manoDeObra: 0, imprevistos: 0,
        utilidad: 0, costosAdicionales: [],
    } satisfies ConfiguracionPrecios
    const overhead = { servicioLuz: 0, servicioAgua: 0, servicioInternet: 0, servicioGas: 0, arriendo: 0, herramienta: 0, admin: 0 }
    const ventanas = [natural, negra, bronce5]

    it("barras y láminas de la vista = las que cobra la cotización (precio 1 por unidad)", () => {
        const costeo = calcularCosteo({ ventanas, descuentos: DESCUNTOS_DEFAULT, precios, overhead, transporteProyecto: 0, duracionMesesProyecto: 1 })
        const barras = Object.values(
            fusionarPerfilesPorColor(
                agruparPorColorAluminio(ventanas).map(({ color, ventanas: g }) => ({ color, optimizacion: optimizarCortes(g, DESCUNTOS_DEFAULT) }))
            )
        ).reduce((total, o) => total + o.barras.length, 0)
        const { ancho, alto } = TAMANOS_LAMINA["2500x3600"]
        const laminas = agruparPorTipoVidrio(ventanas).reduce(
            (total, { ventanas: g }) =>
                total + optimizarLaminasVidrio(calcularVidrios(g, DESCUNTOS_DEFAULT), { laminaAncho: ancho, laminaAlto: alto }).length,
            0
        )
        expect(costeo.costoPerfiles).toBe(barras)
        expect(costeo.costoVidrio).toBe(laminas)
    })
})
