import { describe, expect, it } from "vitest"

import { LAMINA_HELICONIAS, PIEZAS_HELICONIAS } from "@/lib/__tests__/fixtures/heliconias"
import { optimizarLaminasVidrio } from "@/lib/calculo/vidrio"
import { armarDocumentoPlanCorte } from "@/lib/pdf/plan-corte-modelo"
import { DocumentoPlanCorteSchema } from "@/lib/schemas"
import type { LaminaVidrio, VidrioCorte } from "@/lib/types"

const HOY = new Date(2026, 9, 17)

const lamina: LaminaVidrio = {
    numero: 1,
    anchoLamina: 3300,
    altoLamina: 2140,
    vidrios: [
        {
            vidrio: { ventana: "Sala", tipo: "Hoja Fija", hoja: { tipo: "fija", numero: 1, cerradura: false }, codigo: "V1-F1", ancho: 700, alto: 1100, area: 0.77 },
            x: 0,
            y: 0,
            rotado: false,
        },
        // Sin código ni hoja estructurada: etiqueta = ventana, hoja deducida del texto.
        { vidrio: { ventana: "Cocina", tipo: "Hoja Móvil", ancho: 1100, alto: 600, area: 0.66 }, x: 700, y: 0, rotado: true },
    ],
    restos: [{ x: 1800, y: 0, ancho: 1500, alto: 2140, tipo: "resto" }],
    grupo: "Bronce 5 mm",
    areaUsada: 1.43,
    areaSobrante: 5.632,
}

describe("documento del plan de corte", () => {
    it("una lámina por entrada, con su tipo de vidrio, medidas y áreas", () => {
        const documento = armarDocumentoPlanCorte({ proyecto: "Casa López", laminas: [lamina], hoy: HOY })
        expect(documento.proyecto).toBe("Casa López")
        expect(documento.fecha).toBe("17 de octubre de 2026")
        expect(documento.laminas).toHaveLength(1)
        expect(documento.laminas[0]).toMatchObject({
            numero: 1,
            grupo: "Bronce 5 mm",
            ancho: 3300,
            alto: 2140,
            deInventario: false,
            areaUsada: 1.43,
            areaSobrante: 5.632,
            restos: [{ tipo: "resto", x: 1800, y: 0, ancho: 1500, alto: 2140 }],
        })
    })

    it("cada pieza lleva su código, tipo de hoja, posición y si va girada", () => {
        const [fija, movil] = armarDocumentoPlanCorte({ proyecto: "P", laminas: [lamina], hoy: HOY }).laminas[0].piezas
        expect(fija).toEqual({ etiqueta: "V1-F1", hoja: "fija", descripcion: "Sala - Hoja Fija", x: 0, y: 0, ancho: 700, alto: 1100, rotada: false })
        expect(movil).toMatchObject({ etiqueta: "Cocina", hoja: "movil", rotada: true, ancho: 1100, alto: 600 })
    })

    it("sin grupo de vidrio el grupo es null; una lámina sacada de un resto se marca", () => {
        const documento = armarDocumentoPlanCorte({
            proyecto: "P",
            laminas: [{ ...lamina, grupo: undefined, restoId: "r-1" }],
            hoy: HOY,
        })
        expect(documento.laminas[0].grupo).toBeNull()
        expect(documento.laminas[0].deInventario).toBe(true)
    })

    it("con el plan real de Heliconias: todas las piezas, dentro de su lámina, y cumple su esquema", () => {
        const vidrios: VidrioCorte[] = PIEZAS_HELICONIAS.map(({ n, ancho, alto }) => ({
            ventana: `Pieza ${n}`,
            tipo: "Vidrio",
            ancho,
            alto,
            area: (ancho * alto) / 1_000_000,
        }))
        const laminas = optimizarLaminasVidrio(vidrios, { laminaAncho: LAMINA_HELICONIAS.ancho, laminaAlto: LAMINA_HELICONIAS.alto, kerf: 0 })
        const documento = armarDocumentoPlanCorte({ proyecto: "Heliconias", laminas, hoy: HOY })

        expect(documento.laminas.flatMap((l) => l.piezas)).toHaveLength(PIEZAS_HELICONIAS.length)
        for (const l of documento.laminas) {
            for (const pieza of l.piezas) {
                expect(pieza.x + pieza.ancho).toBeLessThanOrEqual(l.ancho)
                expect(pieza.y + pieza.alto).toBeLessThanOrEqual(l.alto)
            }
        }
        expect(DocumentoPlanCorteSchema.parse(documento)).toEqual(documento)
    })
})
