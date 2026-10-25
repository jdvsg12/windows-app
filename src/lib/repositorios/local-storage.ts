import type { Proyecto } from "../types"
import { CLAVE_PROYECTOS, DOCUMENTOS, validarProyectos, type DefinicionDocumento } from "./documentos"
import type { RepositorioDocumento, RepositorioProyectos, Repositorios } from "./tipos"

// null: sin almacenamiento (render en el servidor). Se pide en cada operación, no al crear los
// repositorios, porque el módulo también se evalúa en el servidor.
export type ObtenerAlmacen = () => Storage | null

// Cada operación lee y escribe de forma síncrona dentro de la promesa: entre la lectura de la lista
// de proyectos y su escritura no hay un await, así dos guardados seguidos no se pisan.
export function crearRepositoriosLocalStorage(obtenerAlmacen: ObtenerAlmacen): Repositorios {
    const leer = <T>(clave: string, predeterminado: T, validar: (dato: unknown) => T): T => {
        try {
            const crudo = obtenerAlmacen()?.getItem(clave)
            return crudo ? validar(JSON.parse(crudo)) : predeterminado
        } catch {
            return predeterminado
        }
    }

    const escribir = (clave: string, valor: unknown): boolean => {
        try {
            const almacen = obtenerAlmacen()
            if (!almacen) return false
            almacen.setItem(clave, JSON.stringify(valor))
            return true
        } catch (error) {
            console.error("Error saving to localStorage:", error)
            return false
        }
    }

    const documento = <T>({ clave, predeterminado, validar }: DefinicionDocumento<T>): RepositorioDocumento<T> => ({
        obtener: async () => leer(clave, predeterminado, validar),
        guardar: async (valor) => escribir(clave, valor),
    })

    const leerProyectos = (): Proyecto[] => leer(CLAVE_PROYECTOS, [], validarProyectos)

    const proyectos: RepositorioProyectos = {
        listar: async () => leerProyectos(),
        obtener: async (id) => leerProyectos().find((proyecto) => proyecto.id === id) ?? null,
        agregar: async (proyecto) => escribir(CLAVE_PROYECTOS, [...leerProyectos(), proyecto]),
        actualizar: async (proyecto) => {
            const lista = leerProyectos()
            if (!lista.some((guardado) => guardado.id === proyecto.id)) return false
            return escribir(CLAVE_PROYECTOS, lista.map((guardado) => (guardado.id === proyecto.id ? proyecto : guardado)))
        },
        eliminar: async (id) => escribir(CLAVE_PROYECTOS, leerProyectos().filter((proyecto) => proyecto.id !== id)),
    }

    return {
        proyectos,
        configuracion: documento(DOCUMENTOS.configuracion),
        precios: documento(DOCUMENTOS.precios),
        descuentos: documento(DOCUMENTOS.descuentos),
        overhead: documento(DOCUMENTOS.overhead),
        fotosProductos: documento(DOCUMENTOS.fotosProductos),
    }
}
