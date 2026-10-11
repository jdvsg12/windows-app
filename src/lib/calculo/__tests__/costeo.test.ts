import { describe, expect, it } from "vitest"

import { calcularCosteo, intentarCosteo, precioPorTipo, type EntradaCosteo } from "../costeo"
import { calcularVidrios } from "../motor-8025"
import { DESCUNTOS_DEFAULT, type ConfiguracionPrecios, type ConfiguracionOverhead } from "@/lib/types"
import { VENTANAS_8025 } from "@/lib/__tests__/fixtures/ventanas-8025"

// The D8 cascade's arithmetic structure is what these tests lock down (A = 1+2+3+adicionales,
// B = A + overhead, C = B + imprevistos, D = C + utilidad). The despiece math underneath is
// already covered by the motor-8025 characterization tests — not re-verified by hand here.

const PRECIOS_BASE: ConfiguracionPrecios = {
    precioCabezal: 90000,
    precioSillar: 90000,
    precioJamba: 72000,
    precioEnganche: 72000,
    precioTraslape: 72000,
    precioHorizontalSuperior: 60000,
    precioHorizontalInferior: 60000,
    precioGuia: 2000,
    precioRodachina: 8000,
    precioCerradura: 25000,
    precioTornillo8mm: 500,
    precioTornillo10mm: 600,
    precioEmpaque: 3000,
    precioVidrioLamina: 180000,
    preciosVidrio: {},
    precioSandblasting: 0,
    recargosColorAluminio: {},
    preciosCerradura: {},
    preciosRodachina: {},
    tamanoLamina: "2500x3600",
    kerfVidrio: 0,
    minRestoVidrio: 200,
    manoDeObra: 30,
    imprevistos: 5,
    utilidad: 20,
    costosAdicionales: [],
}

const OVERHEAD_CERO: ConfiguracionOverhead = {
    servicioLuz: 0,
    servicioAgua: 0,
    servicioInternet: 0,
    servicioGas: 0,
    arriendo: 0,
    herramienta: 0,
    admin: 0,
}

const OVERHEAD_CONOCIDO: ConfiguracionOverhead = {
    servicioLuz: 300000,
    servicioAgua: 180000,
    servicioInternet: 80000,
    servicioGas: 40000,
    arriendo: 500000,
    herramienta: 100000,
    admin: 200000,
}

const ventana = VENTANAS_8025.find((v) => v.nombre === "3hojas-tipica")!

const entradaBase = (overrides: Partial<EntradaCosteo> = {}): EntradaCosteo => ({
    ventanas: [ventana],
    descuentos: DESCUNTOS_DEFAULT,
    precios: PRECIOS_BASE,
    overhead: OVERHEAD_CERO,
    transporteProyecto: 0,
    duracionMesesProyecto: 1,
    ...overrides,
})

describe("calcularCosteo · cascada D8", () => {
    it("A = materiales + mano de obra + transporte (sin overhead, sin adicionales)", () => {
        const salida = calcularCosteo(entradaBase({ transporteProyecto: 150_000 }))

        expect(salida.costoTransporte).toBe(150_000)
        expect(salida.costoDirecto).toBeCloseTo(
            salida.costoMateriales + salida.costoManoObra + salida.costoTransporte,
            6
        )
    })

    it("materiales = perfiles (por barra completa) + accesorios + vidrio (por lámina) + empaque", () => {
        const salida = calcularCosteo(entradaBase())

        expect(salida.costoMateriales).toBeCloseTo(
            salida.costoPerfiles + salida.costoAccesorios + salida.costoVidrio + salida.costoEmpaque,
            6
        )
        expect(salida.costoPerfiles).toBeGreaterThan(0)
        expect(salida.costoVidrio).toBeGreaterThan(0)
    })

    it("costo adicional fijo se suma completo a A", () => {
        const precios: ConfiguracionPrecios = {
            ...PRECIOS_BASE,
            costosAdicionales: [{ id: "1", nombre: "Flete especial", valor: 80_000, tipo: "fijo" }],
        }
        const conAdicional = calcularCosteo(entradaBase({ precios }))
        const sinAdicional = calcularCosteo(entradaBase())

        expect(conAdicional.costosAdicionalesTotal).toBe(80_000)
        expect(conAdicional.costoDirecto - sinAdicional.costoDirecto).toBeCloseTo(80_000, 6)
    })

    it("costo adicional porcentaje se calcula sobre el costo de materiales", () => {
        const precios: ConfiguracionPrecios = {
            ...PRECIOS_BASE,
            costosAdicionales: [{ id: "1", nombre: "Recargo", valor: 10, tipo: "porcentaje" }],
        }
        const salida = calcularCosteo(entradaBase({ precios }))

        expect(salida.costosAdicionalesTotal).toBeCloseTo(salida.costoMateriales * 0.1, 6)
    })

    it("4. overhead absorbido = suma del overhead mensual × meses de la obra", () => {
        const unMes = calcularCosteo(entradaBase({ overhead: OVERHEAD_CONOCIDO, duracionMesesProyecto: 1 }))
        const tresMeses = calcularCosteo(entradaBase({ overhead: OVERHEAD_CONOCIDO, duracionMesesProyecto: 3 }))
        const sumaOverhead = 300000 + 180000 + 80000 + 40000 + 500000 + 100000 + 200000

        expect(unMes.overheadAbsorbido).toBeCloseTo(sumaOverhead, 6)
        expect(tresMeses.overheadAbsorbido).toBeCloseTo(sumaOverhead * 3, 6)
    })

    it("B = A + overhead absorbido", () => {
        const salida = calcularCosteo(entradaBase({ overhead: OVERHEAD_CONOCIDO, duracionMesesProyecto: 2 }))
        expect(salida.costoProduccion).toBeCloseTo(salida.costoDirecto + salida.overheadAbsorbido, 6)
    })

    it("5. imprevistos = % sobre B, y C = B + imprevistos", () => {
        const salida = calcularCosteo(entradaBase({ precios: { ...PRECIOS_BASE, imprevistos: 8 } }))
        expect(salida.imprevistosMonto).toBeCloseTo(salida.costoProduccion * 0.08, 6)
        expect(salida.costoTotal).toBeCloseTo(salida.costoProduccion + salida.imprevistosMonto, 6)
    })

    it("6. utilidad = % sobre C, y D (total) = C + utilidad", () => {
        const salida = calcularCosteo(entradaBase({ precios: { ...PRECIOS_BASE, utilidad: 25 } }))
        expect(salida.utilidadMonto).toBeCloseTo(salida.costoTotal * 0.25, 6)
        expect(salida.total).toBeCloseTo(salida.costoTotal + salida.utilidadMonto, 6)
    })

    it("con overhead e imprevistos en cero, el total coincide con el modelo simple (costo directo + utilidad)", () => {
        const salida = calcularCosteo(entradaBase({ precios: { ...PRECIOS_BASE, imprevistos: 0 } }))
        expect(salida.total).toBeCloseTo(salida.costoDirecto * 1.2, 6)
    })

    it("precioPorM2 y valoresPorVentana sumados dan el total", () => {
        const salida = calcularCosteo(entradaBase())
        const sumaValores = salida.valoresPorVentana.reduce((sum, v) => sum + v.valor, 0)
        expect(sumaValores).toBeCloseTo(salida.total, 4)
    })

    it("sin ventanas, todo queda en cero salvo el overhead absorbido", () => {
        const salida = calcularCosteo(entradaBase({ ventanas: [], overhead: OVERHEAD_CONOCIDO }))
        expect(salida.costoMateriales).toBe(0)
        expect(salida.costoManoObra).toBe(0)
        expect(salida.areaTotal).toBe(0)
        expect(salida.precioPorM2).toBe(0)
        expect(salida.overheadAbsorbido).toBeGreaterThan(0)
    })
})

describe("calcularCosteo · precio del vidrio por color y calibre", () => {
    const ventanaIncolora = { ...ventana, id: "a", nombre: "A" }
    const ventanaBronce = { ...ventana, id: "b", nombre: "B", colorVidrio: "bronce" as const, calibreVidrio: 5 as const }
    const laminasDe = (ventanas: (typeof ventana)[]) =>
        calcularCosteo(entradaBase({ ventanas, precios: { ...PRECIOS_BASE, precioVidrioLamina: 1 } })).costoVidrio

    it("sin precio propio usa el precio general por lámina", () => {
        const salida = calcularCosteo(entradaBase({ ventanas: [ventanaIncolora] }))
        expect(salida.costoVidrio).toBe(laminasDe([ventanaIncolora]) * 180000)
    })

    it("una ventana sin especificaciones se cobra como incoloro de 4 mm", () => {
        const precios = { ...PRECIOS_BASE, preciosVidrio: { "incoloro-4": 200000 } }
        const salida = calcularCosteo(entradaBase({ ventanas: [ventana], precios }))
        expect(salida.costoVidrio).toBe(laminasDe([ventana]) * 200000)
    })

    it("cada tipo de vidrio va en sus propias láminas y con su propio precio", () => {
        const precios = { ...PRECIOS_BASE, preciosVidrio: { "incoloro-4": 200000, "bronce-5": 300000 } }
        const salida = calcularCosteo(entradaBase({ ventanas: [ventanaIncolora, ventanaBronce], precios }))
        expect(salida.costoVidrio).toBe(laminasDe([ventanaIncolora]) * 200000 + laminasDe([ventanaBronce]) * 300000)
    })

    it("el sandblasting se suma por m² de vidrio de las ventanas que lo llevan", () => {
        const conSandblasting = { ...ventanaIncolora, sandblasting: true }
        const sinPrecio = calcularCosteo(entradaBase({ ventanas: [conSandblasting] })).costoVidrio
        const conPrecio = calcularCosteo(
            entradaBase({ ventanas: [conSandblasting], precios: { ...PRECIOS_BASE, precioSandblasting: 50000 } })
        ).costoVidrio
        const areaVidrio = calcularVidrios([conSandblasting], DESCUNTOS_DEFAULT).reduce((total, v) => total + v.area, 0)
        expect(areaVidrio).toBeGreaterThan(0)
        expect(conPrecio - sinPrecio).toBeCloseTo(areaVidrio * 50000, 6)
    })
})

describe("calcularCosteo · color del aluminio", () => {
    const natural = { ...ventana, id: "a", nombre: "A" }
    const negra = { ...ventana, id: "b", nombre: "B", colorAluminio: "negro" as const }
    const perfilesDe = (ventanas: (typeof ventana)[], precios = PRECIOS_BASE) =>
        calcularCosteo(entradaBase({ ventanas, precios })).costoPerfiles

    it("sin recargo, una ventana sin color cuesta igual que natural", () => {
        expect(perfilesDe([ventana])).toBe(perfilesDe([natural]))
    })

    it("el recargo del color se aplica sobre el precio base de los perfiles", () => {
        const precios = { ...PRECIOS_BASE, recargosColorAluminio: { negro: 15 } }
        expect(perfilesDe([negra], precios)).toBeCloseTo(perfilesDe([negra]) * 1.15, 6)
    })

    it("cada color se optimiza en sus propias barras", () => {
        const precios = { ...PRECIOS_BASE, recargosColorAluminio: { negro: 10 } }
        expect(perfilesDe([natural, negra], precios)).toBeCloseTo(
            perfilesDe([natural], precios) + perfilesDe([negra], precios),
            6
        )
    })
})

describe("intentarCosteo", () => {
    it("devuelve el mismo costo que calcularCosteo cuando todo cabe", () => {
        expect(intentarCosteo(entradaBase())).toEqual({ costos: calcularCosteo(entradaBase()), error: null })
    })

    it("un vidrio que no cabe en la lámina devuelve el error en vez de lanzar", () => {
        const enorme = { ...ventana, id: "x", ancho: 9000, alto: 9000 }
        expect(intentarCosteo(entradaBase({ ventanas: [enorme] }))).toEqual({
            costos: null,
            error: expect.any(String),
        })
    })
})

describe("calcularCosteo · precio por tipo de cerradura y rodachina", () => {
    const materiales = (entrada: EntradaCosteo) => calcularCosteo(entrada).costoMateriales
    const conManija = { ...ventana, id: "m", cerradura: "manija" as const, rodachina: "metalica" as const }
    const conImpacto = { ...ventana, id: "i", cerradura: "impacto" as const, rodachina: "plastica" as const }

    it("precioPorTipo: precio propio si el tipo lo tiene, si no el general", () => {
        const precios: ConfiguracionPrecios["preciosCerradura"] = { manija: 40000 }
        expect(precioPorTipo(precios, "manija", 25000)).toBe(40000)
        expect(precioPorTipo(precios, "impacto", 25000)).toBe(25000)
        expect(precioPorTipo(precios, undefined, 25000)).toBe(25000)
    })

    it("sin precios por tipo, el costo es el mismo de siempre", () => {
        const sinTipos = entradaBase({ ventanas: [conManija, conImpacto] })
        const conMapasVacios = entradaBase({
            ventanas: [conManija, conImpacto],
            precios: { ...PRECIOS_BASE, preciosCerradura: {}, preciosRodachina: {} },
        })
        expect(materiales(conMapasVacios)).toBe(materiales(sinTipos))
    })

    it("solo encarece las ventanas cuya cerradura tiene precio propio", () => {
        const base = entradaBase({ ventanas: [conManija, conImpacto] })
        const manijaMasCara = entradaBase({
            ventanas: [conManija, conImpacto],
            precios: { ...PRECIOS_BASE, preciosCerradura: { manija: PRECIOS_BASE.precioCerradura + 15000 } },
        })
        // Una ventana con manija lleva exactamente 1 cerradura.
        expect(materiales(manijaMasCara) - materiales(base)).toBeCloseTo(15000, 6)
    })

    it("cobra cada rodachina al precio de su tipo", () => {
        const base = materiales(entradaBase({ ventanas: [conManija] }))
        const metalicaMasCara = materiales(
            entradaBase({
                ventanas: [conManija],
                precios: { ...PRECIOS_BASE, preciosRodachina: { metalica: PRECIOS_BASE.precioRodachina + 1000 } },
            })
        )
        // 3 hojas: 2 móviles × 2 rodachinas = 4 rodachinas, 1000 más cada una.
        expect(metalicaMasCara - base).toBeCloseTo(4000, 6)
    })
})
