import { describe, expect, it } from "vitest"

import {
    calcularAccesorios,
    calcularCortesVentana,
    calcularVidrios,
    optimizarCortes,
} from "../motor-8025"
import { DESCUNTOS_DEFAULT } from "@/lib/types"
import { TIPOS_8025, VENTANAS_8025 } from "@/lib/__tests__/fixtures/ventanas-8025"
import { redondear } from "@/lib/__tests__/helpers"

// Characterization (golden master) of the engine as it works today for reference 80-25.
// The snapshots record CURRENT behavior, not a specification: review any snapshot diff by hand.
// Run in Node (no `window`); DESCUNTOS_DEFAULT is passed explicitly now that the engine no
// longer reads storage itself (F3.1) — it is exactly what storage.ts used to resolve to here.

describe("entorno", () => {
    it("corre en Node sin window", () => {
        expect(typeof window).toBe("undefined")
    })
})

describe("motor 80-25 · por ventana", () => {
    describe.each(VENTANAS_8025.map((ventana) => [ventana.nombre, ventana] as const))("%s", (_nombre, ventana) => {
        it("cortes de perfiles", () => {
            expect(redondear(calcularCortesVentana(ventana, DESCUNTOS_DEFAULT))).toMatchSnapshot()
        })

        it("vidrios", () => {
            expect(redondear(calcularVidrios([ventana], DESCUNTOS_DEFAULT))).toMatchSnapshot()
        })

        it("accesorios", () => {
            expect(redondear(calcularAccesorios([ventana], DESCUNTOS_DEFAULT))).toMatchSnapshot()
        })
    })
})

// Business rule (confirmed): every window carries exactly ONE lock, on the last movable leaf.
describe("regla de negocio · una cerradura por ventana", () => {
    it.each(TIPOS_8025)("%s lleva 1 cerradura", (tipo) => {
        const ventana = VENTANAS_8025.find((v) => v.tipoVentana === tipo && v.nombre.endsWith("tipica"))!
        expect(calcularAccesorios([ventana], DESCUNTOS_DEFAULT).cerraduras).toBe(1)
    })
})

describe("motor 80-25 · proyecto completo", () => {
    it("optimizacion de barras de 6 m (incluye un perfil de 6,3 m que excede la barra)", () => {
        expect(redondear(optimizarCortes([...VENTANAS_8025], DESCUNTOS_DEFAULT))).toMatchSnapshot()
    })

    it("accesorios totales", () => {
        expect(redondear(calcularAccesorios([...VENTANAS_8025], DESCUNTOS_DEFAULT))).toMatchSnapshot()
    })

    it("vidrios totales", () => {
        expect(redondear(calcularVidrios([...VENTANAS_8025], DESCUNTOS_DEFAULT))).toMatchSnapshot()
    })
})

// El empaquetado de láminas (kerf configurable, clasificación resto/desperdicio, guillotina)
// vive ahora en lib/calculo/vidrio.ts (F3.3) — ver vidrio.test.ts para sus invariantes.
