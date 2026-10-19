import { describe, expect, it } from "vitest"

import { VersionCotizacionSchema } from "@/lib/schemas"
import type { DocumentoCotizacion, VersionCotizacion } from "@/lib/types"
import {
    MAX_VERSIONES_RECIENTES,
    documentoDeVersion,
    marcarGuardada,
    quitarGuardada,
    registrarVersion,
} from "@/lib/versiones-cotizacion"

const documento = (total: number): DocumentoCotizacion => ({
    empresa: {
        nombre: "Taller",
        nit: "1",
        direccion: "",
        ciudad: "",
        telefonos: "",
        email: "",
        representante: "",
        cedula: "",
        datosBancarios: "",
        logo: "data:image/png;base64,AAAA",
        firma: "data:image/png;base64,BBBB",
    },
    fecha: "17 de octubre de 2026",
    cliente: "Ana",
    direccionObra: "",
    tiempoEntrega: "25 días hábiles",
    validez: "15 días hábiles",
    proyecto: "Casa",
    descripcion: "",
    mostrarMedidas: true,
    mostrarValores: true,
    filas: [],
    productos: [{ clave: "cerradura:impacto", nombre: "Cerradura Impacto", imagen: "data:image/png;base64,CCCC" }],
    areaTotal: 1,
    total,
})

// Genera n versiones con totales 1..n, una por minuto.
function generar(n: number, inicial: readonly VersionCotizacion[] = []): VersionCotizacion[] {
    let versiones = [...inicial]
    for (let i = 1; i <= n; i++) {
        versiones = registrarVersion(versiones, documento(i), `v${i}`, `2026-10-17T10:0${i}:00.000Z`)
    }
    return versiones
}

describe("versiones del PDF de la cotización", () => {
    it("guarda los datos sin el logo, la más reciente primero", () => {
        const versiones = generar(2)
        expect(versiones.map((v) => v.id)).toEqual(["v2", "v1"])
        expect(versiones[0]).toMatchObject({ guardada: false, creada: "2026-10-17T10:02:00.000Z" })
        expect(versiones[0].documento.empresa.logo).toBeUndefined()
        expect(versiones[0].documento.empresa.firma).toBeUndefined()
        expect(versiones[0].documento.productos).toEqual([{ clave: "cerradura:impacto", nombre: "Cerradura Impacto" }])
        expect(versiones[0].documento.total).toBe(2)
    })

    it("conserva solo las 3 últimas", () => {
        const versiones = generar(5)
        expect(MAX_VERSIONES_RECIENTES).toBe(3)
        expect(versiones.map((v) => v.id)).toEqual(["v5", "v4", "v3"])
    })

    it("la guardada no rota: quedan las 3 últimas más ella", () => {
        const conGuardada = marcarGuardada(generar(2), "v1")
        const versiones = generar(6, conGuardada).filter((v) => v.id.startsWith("v"))
        expect(versiones.map((v) => [v.id, v.guardada])).toEqual([
            ["v6", false],
            ["v5", false],
            ["v4", false],
            ["v1", true],
        ])
    })

    it("solo hay una guardada: marcar otra suelta la anterior", () => {
        const versiones = marcarGuardada(marcarGuardada(generar(3), "v1"), "v3")
        expect(versiones.filter((v) => v.guardada).map((v) => v.id)).toEqual(["v3"])
        expect(versiones).toHaveLength(3)
    })

    it("quitar la guardada la devuelve a las recientes y, si es la más vieja, sale", () => {
        let versiones = marcarGuardada(generar(1), "v1")
        for (const [indice, id] of ["w1", "w2", "w3"].entries()) {
            versiones = registrarVersion(versiones, documento(10 + indice), id, `2026-10-17T11:0${indice}:00.000Z`)
        }
        expect(versiones.map((v) => v.id)).toEqual(["w3", "w2", "w1", "v1"])
        expect(quitarGuardada(versiones).map((v) => v.id)).toEqual(["w3", "w2", "w1"])
    })

    it("descargar el mismo documento otra vez no crea otra versión, solo actualiza la fecha", () => {
        const una = registrarVersion([], documento(7), "a", "2026-10-17T10:00:00.000Z")
        const dos = registrarVersion(una, documento(7), "b", "2026-10-17T11:00:00.000Z")
        expect(dos).toHaveLength(1)
        expect(dos[0]).toMatchObject({ id: "a", creada: "2026-10-17T11:00:00.000Z" })
    })

    it("al volver a descargar, el documento lleva el logo y la firma actuales", () => {
        const [version] = generar(1)
        const documentoNuevo = documentoDeVersion(version, { logo: "data:logo-nuevo", firma: "data:firma-nueva" })
        expect(documentoNuevo.empresa).toMatchObject({ logo: "data:logo-nuevo", firma: "data:firma-nueva" })
        expect(documentoDeVersion(version, {}).total).toBe(1)
    })

    it("al volver a descargar, cada producto lleva la foto actual del catálogo (o ninguna si se quitó)", () => {
        const [version] = generar(1)
        const conFoto = documentoDeVersion(version, {
            fotos: { cerraduras: { impacto: { imagen: "data:foto-nueva", nombre: "" } }, rodachinas: {} },
        })
        expect(conFoto.productos).toEqual([{ clave: "cerradura:impacto", nombre: "Cerradura Impacto", imagen: "data:foto-nueva" }])
        expect(documentoDeVersion(version, {}).productos[0].imagen).toBeUndefined()
    })

    it("una versión guardada antes de AWA-41 sigue cargando, con las condiciones vacías", () => {
        const [version] = generar(1)
        const documentoViejo = Object.fromEntries(
            Object.entries(version.documento).filter(([campo]) => !["direccionObra", "tiempoEntrega", "validez", "productos"].includes(campo)),
        )
        const cargada = VersionCotizacionSchema.parse({ ...version, documento: documentoViejo })
        expect(cargada.documento).toMatchObject({ direccionObra: "", tiempoEntrega: "", validez: "", productos: [] })
    })
})
