import { describe, expect, it } from "vitest"

import { calcularPlanCorte } from "@/lib/calculo/plan"
import { armarListaCompra, textoListaCompra } from "@/lib/lista-compra"
import { DESCUNTOS_DEFAULT, type Puerta, type Ventana } from "@/lib/types"

const precios = { tamanoLamina: "2500x3600" as const, kerfVidrio: 0, minRestoVidrio: 200 }

const ventana = (id: string, cambios: Partial<Ventana> = {}): Ventana => ({
    id,
    nombre: `Ventana ${id}`,
    ancho: 1500,
    alto: 1200,
    tipoVentana: "2hojas_mixto",
    sistema: "8025",
    colorAluminio: "natural",
    cerradura: "impacto",
    rodachina: "plastica",
    calibreVidrio: 4,
    colorVidrio: "incoloro",
    sandblasting: false,
    ...cambios,
})

const puerta: Puerta = {
    id: "p1",
    nombre: "Entrada",
    producto: "alumina_europeo",
    ancho: 654,
    alto: 1984,
    colorAluminio: "natural",
    calibreVidrio: 4,
    colorVidrio: "incoloro",
    sandblasting: false,
}

function lista(ventanas: Ventana[], puertas: Puerta[] = []) {
    const plan = calcularPlanCorte({ ventanas, descuentos: DESCUNTOS_DEFAULT, precios, puertas })
    return armarListaCompra({ ventanas, puertas, descuentos: DESCUNTOS_DEFAULT, plan })
}

describe("lista de compra", () => {
    it("una ventana 80-25 y una puerta: perfiles por referencia, con las jambas juntas", () => {
        const { grupos, totalBarras } = lista([ventana("a")], [puerta])
        expect(grupos.map(({ producto, color, productos }) => [producto, color, productos])).toEqual([
            ["Ventana corrediza 80-25", "Natural (anodizado mate)", ["V1"]],
            ["Puerta abatible Alumina", "Natural (anodizado mate)", ["P1"]],
        ])
        expect(grupos[0].perfiles.map(({ referencia, nombre, barras }) => [referencia, nombre, barras])).toEqual([
            ["VP151", "Cabezal 8025", 1],
            ["VP150", "Sillar 8025", 1],
            ["VP152", "Jamba 8025", 2],
            ["VP191", "Enganche 8025", 1],
            ["VP190", "Traslape 8025", 1],
            ["VP156", "Horizontal superior 8025", 1],
            ["VP157", "Horizontal inferior 8025", 1],
        ])
        expect(grupos[0].perfiles[0].imagen).toBe("/productos/8025/vp151.jpg")
        expect(grupos[1].perfiles.map(({ referencia, barras, metrosUsados }) => [referencia, barras, metrosUsados])).toEqual([
            ["U-57", 1, 4.622],
            ["VP-1102", 1, 5.08],
            ["Pisavidrio", 1, 4.252],
        ])
        expect(totalBarras).toBe(8 + 3)
    })

    it("accesorios por tipo, con la cantidad total y los productos en que van", () => {
        const { accesorios } = lista(
            [ventana("a"), ventana("b", { tipoVentana: "3hojas", rodachina: "metalica", cerradura: "dummy" }), ventana("c", { rodachina: "pabose" })],
            [puerta],
        )
        const fila = (clave: string) => accesorios.find((accesorio) => accesorio.clave === clave)
        expect(fila("rodachina-plastica")).toMatchObject({ nombre: "Rodachina plástica", cantidad: 2, en: ["V1"], imagen: "/productos/accesorios/rodachina-plastica.png" })
        expect(fila("rodachina-metalica")).toMatchObject({ cantidad: 4, en: ["V2"] })
        expect(fila("rodachina-pabose")).toMatchObject({ cantidad: 2, en: ["V3"] })
        expect(fila("cerradura-impacto")).toMatchObject({ cantidad: 2, en: ["V1", "V3"] })
        expect(fila("cerradura-dummy")).toMatchObject({ cantidad: 1, en: ["V2"] })
        expect(fila("guia")).toMatchObject({ cantidad: 4 + 8 + 4, en: ["V1", "V2", "V3"] })
        expect(fila("empaque")?.unidad).toBe("metros")
        expect(fila("puerta-bisagraOmega")).toMatchObject({ nombre: "Bisagra Omega", cantidad: 4, en: ["P1"] })
        expect(fila("puerta-tornilloInstalacion")).toMatchObject({ cantidad: 8, detalle: '#10 × 3"' })
    })

    it("con varios colores, cada color es un grupo aparte", () => {
        const { grupos } = lista([ventana("a"), ventana("b", { colorAluminio: "negro" })])
        expect(grupos.map(({ color, productos }) => [color, productos])).toEqual([
            ["Natural (anodizado mate)", ["V1"]],
            ["Negro", ["V2"]],
        ])
    })

    it("un proyecto vacío no tiene nada que comprar", () => {
        expect(lista([])).toEqual({ grupos: [], accesorios: [], laminas: [], totalBarras: 0 })
    })

    it("texto para el proveedor", () => {
        const texto = textoListaCompra(lista([ventana("a")], [puerta]), "Casa López", "2500 x 3600")
        expect(texto).toContain("Lista de compra: Casa López")
        expect(texto).toContain("- Jamba 8025 (VP152): 2 barras de 6 m")
        expect(texto).toContain("- U-57 · Marco (U-57): 1 barra de 6 m")
        expect(texto).toContain("- Bisagra Omega (Para puerta de aluminio): 4")
        expect(texto).toMatch(/- Empaque \(Para el vidrio de las hojas\): \d+(,\d)? m/)
        expect(texto).toContain("- Incoloro 4 mm: 1 lámina")
    })
})

describe("lista de compra · orden", () => {
    it("accesorios agrupados por familia y los de puerta al final", () => {
        const { accesorios } = lista([ventana("a"), ventana("b", { rodachina: "metalica", cerradura: "dummy" })], [puerta])
        expect(accesorios.map((accesorio) => accesorio.clave)).toEqual([
            "rodachina-plastica",
            "rodachina-metalica",
            "guia",
            "cerradura-impacto",
            "cerradura-dummy",
            "empaque",
            "tornillo-marco-hojas",
            "tornillo-instalacion",
            "puerta-bisagraOmega",
            "puerta-tornilloBisagra",
            "puerta-cerraduraKL",
            "puerta-escuadraEnsamble",
            "puerta-anguloArme",
            "puerta-tornilloInstalacion",
        ])
    })
})
