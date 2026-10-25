import { beforeEach, describe, expect, it } from "vitest"

import { ContenidoCotizacionSchema } from "../../schemas"
import type { Proyecto } from "../../types"
import { DOCUMENTOS } from "../documentos"
import type { Repositorios } from "../tipos"

export function proyectoDePrueba(id: string, nombre = `Obra ${id}`): Proyecto {
    return {
        id,
        nombre,
        cliente: "",
        direccion: "",
        fechaCreacion: "2026-10-25T12:00:00.000Z",
        ventanas: [{ id: `${id}-v1`, nombre: "Sala", ancho: 1500, alto: 1200, tipoVentana: "2hojas", sistema: "8025" }],
        duracionMeses: 1,
        transporte: 0,
        contenidoCotizacion: ContenidoCotizacionSchema.parse({}),
        versionesCotizacion: [],
    }
}

// Lo que todo adaptador de Repositorios debe cumplir. Cada adaptador (localStorage hoy, IndexedDB
// después) lo corre con un almacén vacío y aislado por test.
export function describirContratoRepositorios(nombre: string, crear: () => Repositorios | Promise<Repositorios>) {
    describe(`contrato de repositorios · ${nombre}`, () => {
        let repos: Repositorios

        beforeEach(async () => {
            repos = await crear()
        })

        describe("proyectos", () => {
            it("empieza vacío", async () => {
                expect(await repos.proyectos.listar()).toEqual([])
                expect(await repos.proyectos.obtener("no-existe")).toBeNull()
            })

            it("agrega, lista en orden de creación y obtiene por id", async () => {
                expect(await repos.proyectos.agregar(proyectoDePrueba("a"))).toBe(true)
                expect(await repos.proyectos.agregar(proyectoDePrueba("b"))).toBe(true)
                expect((await repos.proyectos.listar()).map((proyecto) => proyecto.id)).toEqual(["a", "b"])
                expect(await repos.proyectos.obtener("b")).toEqual(proyectoDePrueba("b"))
            })

            it("actualiza solo el proyecto indicado", async () => {
                await repos.proyectos.agregar(proyectoDePrueba("a"))
                await repos.proyectos.agregar(proyectoDePrueba("b"))
                expect(await repos.proyectos.actualizar({ ...proyectoDePrueba("a"), cliente: "Ana" })).toBe(true)
                expect((await repos.proyectos.obtener("a"))?.cliente).toBe("Ana")
                expect(await repos.proyectos.obtener("b")).toEqual(proyectoDePrueba("b"))
            })

            it("no revive un proyecto que no existe al actualizarlo", async () => {
                expect(await repos.proyectos.actualizar(proyectoDePrueba("fantasma"))).toBe(false)
                expect(await repos.proyectos.listar()).toEqual([])
            })

            it("elimina solo el proyecto indicado", async () => {
                await repos.proyectos.agregar(proyectoDePrueba("a"))
                await repos.proyectos.agregar(proyectoDePrueba("b"))
                expect(await repos.proyectos.eliminar("a")).toBe(true)
                expect((await repos.proyectos.listar()).map((proyecto) => proyecto.id)).toEqual(["b"])
            })

            it("guardados lanzados sin esperar no se pisan entre sí", async () => {
                await repos.proyectos.agregar(proyectoDePrueba("a"))
                await repos.proyectos.agregar(proyectoDePrueba("b"))
                await Promise.all([
                    repos.proyectos.actualizar({ ...proyectoDePrueba("a"), cliente: "Ana" }),
                    repos.proyectos.actualizar({ ...proyectoDePrueba("b"), cliente: "Beto" }),
                    repos.proyectos.agregar(proyectoDePrueba("c")),
                ])
                const guardados = await repos.proyectos.listar()
                expect(guardados.map((proyecto) => [proyecto.id, proyecto.cliente])).toEqual([
                    ["a", "Ana"],
                    ["b", "Beto"],
                    ["c", ""],
                ])
            })

            it("lo que devuelve no es el objeto guardado: mutarlo no cambia lo guardado", async () => {
                await repos.proyectos.agregar(proyectoDePrueba("a"))
                const leido = await repos.proyectos.obtener("a")
                leido?.ventanas.push({ ...proyectoDePrueba("a").ventanas[0], id: "extra" })
                expect((await repos.proyectos.obtener("a"))?.ventanas).toHaveLength(1)
            })
        })

        describe("documentos", () => {
            const claves = ["configuracion", "precios", "descuentos", "overhead", "fotosProductos"] as const

            it.each(claves)("%s: sin nada guardado devuelve el predeterminado", async (clave) => {
                expect(await repos[clave].obtener()).toEqual(DOCUMENTOS[clave].predeterminado)
            })

            it("guarda y vuelve a leer cada documento", async () => {
                const precios = { ...DOCUMENTOS.precios.predeterminado, manoDeObra: 45, tamanoLamina: "2140x3300" as const }
                const fotos = { cerraduras: { impacto: { imagen: "data:image/png;base64,AA==", nombre: "Impacto" } }, rodachinas: {} }
                const descuentos = { ...DOCUMENTOS.descuentos.predeterminado }
                descuentos["8025"] = { ...descuentos["8025"], jamba: 99 }

                expect(await repos.precios.guardar(precios)).toBe(true)
                expect(await repos.fotosProductos.guardar(fotos)).toBe(true)
                expect(await repos.descuentos.guardar(descuentos)).toBe(true)
                expect(await repos.configuracion.guardar({ ...DOCUMENTOS.configuracion.predeterminado, nombre: "ALUVE" })).toBe(true)
                expect(await repos.overhead.guardar({ ...DOCUMENTOS.overhead.predeterminado, arriendo: 500000 })).toBe(true)

                expect(await repos.precios.obtener()).toEqual(precios)
                expect(await repos.fotosProductos.obtener()).toEqual(fotos)
                expect(await repos.descuentos.obtener()).toEqual(descuentos)
                expect((await repos.configuracion.obtener()).nombre).toBe("ALUVE")
                expect((await repos.overhead.obtener()).arriendo).toBe(500000)
            })
        })
    })
}
