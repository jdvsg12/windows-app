import { describe, expect, it } from "vitest"

import { DOCUMENTOS } from "../documentos"
import { crearRepositoriosLocalStorage } from "../local-storage"
import { describirContratoRepositorios, proyectoDePrueba } from "./contrato"

// Storage en memoria: los tests nunca tocan el almacenamiento de un navegador.
class AlmacenEnMemoria implements Storage {
    private datos = new Map<string, string>()
    // > 0: setItem falla como un localStorage lleno.
    limite = Number.POSITIVE_INFINITY

    get length() {
        return this.datos.size
    }
    clear() {
        this.datos.clear()
    }
    getItem(clave: string) {
        return this.datos.get(clave) ?? null
    }
    key(indice: number) {
        return [...this.datos.keys()][indice] ?? null
    }
    removeItem(clave: string) {
        this.datos.delete(clave)
    }
    setItem(clave: string, valor: string) {
        if (valor.length > this.limite) throw new DOMException("QuotaExceededError", "QuotaExceededError")
        this.datos.set(clave, valor)
    }
}

describirContratoRepositorios("localStorage", () => {
    const almacen = new AlmacenEnMemoria()
    return crearRepositoriosLocalStorage(() => almacen)
})

describe("repositorios sobre localStorage", () => {
    it("lee los datos guardados antes de los repositorios, con las mismas claves", async () => {
        const almacen = new AlmacenEnMemoria()
        almacen.setItem("ventanas_proyectos", JSON.stringify([proyectoDePrueba("viejo")]))
        almacen.setItem("ventanas_precios", JSON.stringify({ ...DOCUMENTOS.precios.predeterminado, utilidad: 35 }))
        const repos = crearRepositoriosLocalStorage(() => almacen)

        expect((await repos.proyectos.listar()).map((proyecto) => proyecto.id)).toEqual(["viejo"])
        expect((await repos.precios.obtener()).utilidad).toBe(35)
    })

    it("repara con el esquema un proyecto guardado sin los campos nuevos", async () => {
        const almacen = new AlmacenEnMemoria()
        const viejo: Record<string, unknown> = { ...proyectoDePrueba("viejo"), transporte: null }
        delete viejo.contenidoCotizacion
        delete viejo.versionesCotizacion
        almacen.setItem("ventanas_proyectos", JSON.stringify([viejo]))
        const leido = await crearRepositoriosLocalStorage(() => almacen).proyectos.obtener("viejo")

        expect(leido?.transporte).toBe(0)
        expect(leido?.versionesCotizacion).toEqual([])
        expect(leido?.contenidoCotizacion.tiempoEntrega).toBe("25 días hábiles")
    })

    it("un JSON dañado o un documento inválido devuelven el predeterminado", async () => {
        const almacen = new AlmacenEnMemoria()
        almacen.setItem("ventanas_proyectos", "{no es json")
        almacen.setItem("ventanas_overhead", JSON.stringify({ servicioLuz: "mucho" }))
        const repos = crearRepositoriosLocalStorage(() => almacen)

        expect(await repos.proyectos.listar()).toEqual([])
        expect(await repos.overhead.obtener()).toEqual(DOCUMENTOS.overhead.predeterminado)
    })

    it("con el almacenamiento lleno, guardar devuelve false y no cambia lo guardado", async () => {
        const almacen = new AlmacenEnMemoria()
        const repos = crearRepositoriosLocalStorage(() => almacen)
        await repos.proyectos.agregar(proyectoDePrueba("a"))
        almacen.limite = 10

        expect(await repos.proyectos.actualizar({ ...proyectoDePrueba("a"), cliente: "Ana" })).toBe(false)
        expect(await repos.precios.guardar(DOCUMENTOS.precios.predeterminado)).toBe(false)
        expect((await repos.proyectos.obtener("a"))?.cliente).toBe("")
    })

    it("sin almacenamiento (render en el servidor) lee predeterminados y no guarda", async () => {
        const repos = crearRepositoriosLocalStorage(() => null)

        expect(await repos.proyectos.listar()).toEqual([])
        expect(await repos.configuracion.obtener()).toEqual(DOCUMENTOS.configuracion.predeterminado)
        expect(await repos.proyectos.agregar(proyectoDePrueba("a"))).toBe(false)
    })
})
