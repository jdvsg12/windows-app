import { describe, expect, it } from "vitest"

import {
    calcularAccesorios,
    calcularCortesVentana,
    calcularVidrios,
    optimizarCortes,
    optimizarLaminasVidrio,
} from "@/lib/calculos"
import { TIPOS_8025, VENTANAS_8025, VENTANAS_CON_VIDRIO_QUE_CABE } from "./fixtures/ventanas-8025"
import { redondear, seSolapan, type Rectangulo } from "./helpers"

// Characterization (golden master) of the engine as it works today for reference 80-25.
// The snapshots record CURRENT behavior, not a specification: review any snapshot diff by hand.
// Run in Node (no `window`), so lib/storage returns the default discounts and no browser storage is touched.

describe("entorno", () => {
    it("corre en Node sin window", () => {
        expect(typeof window).toBe("undefined")
    })
})

describe("motor 80-25 · por ventana", () => {
    describe.each(VENTANAS_8025.map((ventana) => [ventana.nombre, ventana] as const))("%s", (_nombre, ventana) => {
        it("cortes de perfiles", () => {
            expect(redondear(calcularCortesVentana(ventana))).toMatchSnapshot()
        })

        it("vidrios", () => {
            expect(redondear(calcularVidrios([ventana]))).toMatchSnapshot()
        })

        it("accesorios", () => {
            expect(redondear(calcularAccesorios([ventana]))).toMatchSnapshot()
        })
    })
})

// Business rule (confirmed): every window carries exactly ONE lock, on the last movable leaf.
describe("regla de negocio · una cerradura por ventana", () => {
    it.each(TIPOS_8025)("%s lleva 1 cerradura", (tipo) => {
        const ventana = VENTANAS_8025.find((v) => v.tipoVentana === tipo && v.nombre.endsWith("tipica"))!
        expect(calcularAccesorios([ventana]).cerraduras).toBe(1)
    })
})

describe("motor 80-25 · proyecto completo", () => {
    it("optimizacion de barras de 6 m (incluye un perfil de 6,3 m que excede la barra)", () => {
        expect(redondear(optimizarCortes([...VENTANAS_8025]))).toMatchSnapshot()
    })

    it("accesorios totales", () => {
        expect(redondear(calcularAccesorios([...VENTANAS_8025]))).toMatchSnapshot()
    })

    it("vidrios totales", () => {
        expect(redondear(calcularVidrios([...VENTANAS_8025]))).toMatchSnapshot()
    })
})

// The glass optimizer will be replaced (kerf 0, R/S classification, guillotine), so its layout is NOT
// locked: only invariants that any correct optimizer must keep.
describe.each([
    { ancho: 2500, alto: 3600 },
    { ancho: 3300, alto: 2140 },
])("optimizarLaminasVidrio · lámina $ancho x $alto", ({ ancho, alto }) => {
    const ventanas = [...VENTANAS_CON_VIDRIO_QUE_CABE]
    const piezas = calcularVidrios(ventanas)
    const laminas = optimizarLaminasVidrio(ventanas, ancho, alto)

    it("coloca cada pieza exactamente una vez", () => {
        const colocadas = laminas.flatMap((lamina) => lamina.vidrios)
        expect(colocadas).toHaveLength(piezas.length)
    })

    it("mantiene cada pieza dentro de su lámina", () => {
        for (const lamina of laminas) {
            for (const { vidrio, x, y } of lamina.vidrios) {
                expect(x).toBeGreaterThanOrEqual(0)
                expect(y).toBeGreaterThanOrEqual(0)
                expect(x + vidrio.ancho).toBeLessThanOrEqual(lamina.anchoLamina)
                expect(y + vidrio.alto).toBeLessThanOrEqual(lamina.altoLamina)
            }
        }
    })

    it("no solapa piezas dentro de una misma lámina", () => {
        for (const lamina of laminas) {
            const rectangulos: Rectangulo[] = lamina.vidrios.map(({ vidrio, x, y }) => ({
                x,
                y,
                ancho: vidrio.ancho,
                alto: vidrio.alto,
            }))
            rectangulos.forEach((a, i) => {
                rectangulos.slice(i + 1).forEach((b) => expect(seSolapan(a, b)).toBe(false))
            })
        }
    })

    it("el area usada coincide con la suma de sus piezas", () => {
        for (const lamina of laminas) {
            const suma = lamina.vidrios.reduce((total, { vidrio }) => total + vidrio.area, 0)
            expect(lamina.areaUsada).toBeCloseTo(suma, 6)
        }
    })

    it("baseline: numero de láminas usadas", () => {
        expect(laminas.length).toMatchSnapshot()
    })
})

describe("optimizarLaminasVidrio · comportamientos a corregir en el motor nuevo", () => {
    it("coloca una pieza mayor que la lámina, sin girar y fuera de sus límites", () => {
        const ventanaExtrema = VENTANAS_8025.find((ventana) => ventana.nombre === "2hojas-extrema")!
        const [lamina] = optimizarLaminasVidrio([ventanaExtrema], 2500, 3600)
        const { vidrio, x } = lamina.vidrios[0]

        expect(vidrio.ancho).toBeGreaterThan(2500)
        expect(x + vidrio.ancho).toBeGreaterThan(lamina.anchoLamina)
    })

    it("usa un margen de corte fijo de 5 mm entre piezas (no configurable)", () => {
        const [lamina] = optimizarLaminasVidrio(
            [
                { id: "a", nombre: "a", ancho: 1000, alto: 1000, tipoVentana: "2hojas", sistema: "8025" },
                { id: "b", nombre: "b", ancho: 1000, alto: 1000, tipoVentana: "2hojas", sistema: "8025" },
            ],
            3300,
            2140
        )
        const [primera, segunda] = [...lamina.vidrios].sort((p, q) => p.x - q.x)
        const separacion = segunda.x - (primera.x + primera.vidrio.ancho)

        expect(separacion).toBeGreaterThanOrEqual(5)
    })
})
