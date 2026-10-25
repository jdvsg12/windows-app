import { ContenidoCotizacionSchema } from "./schemas"
import type { Proyecto } from "./types"
import { crearRepositoriosLocalStorage } from "./repositorios/local-storage"
import type { Repositorios } from "./repositorios/tipos"

// Punto único de persistencia de la app. Los datos van por los repositorios (asíncronos, hoy sobre
// localStorage, después IndexedDB). Lo que queda síncrono aquí es del dispositivo y no se migra:
// el último proyecto abierto y la sesión de admin (que reemplaza la autenticación de F4).

export const repositorios: Repositorios = crearRepositoriosLocalStorage(() =>
    typeof window === "undefined" ? null : window.localStorage,
)

const CLAVE_PROYECTO_ACTUAL = "ventanas_proyecto_actual"
const CLAVE_ADMIN_AUTH = "admin_auth"

export const guardarProyectoActual = (proyectoId: string | null) => {
    if (typeof window === "undefined") return
    if (proyectoId) {
        localStorage.setItem(CLAVE_PROYECTO_ACTUAL, proyectoId)
    } else {
        localStorage.removeItem(CLAVE_PROYECTO_ACTUAL)
    }
}

export const obtenerProyectoActual = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(CLAVE_PROYECTO_ACTUAL)
}

export const isAdminAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(CLAVE_ADMIN_AUTH) === "true"
}

export const setAdminAuthenticated = (authenticated: boolean) => {
    if (typeof window === "undefined") return
    if (authenticated) {
        localStorage.setItem(CLAVE_ADMIN_AUTH, "true")
    } else {
        localStorage.removeItem(CLAVE_ADMIN_AUTH)
    }
}

export const crearProyecto = async (nombre: string, cliente?: string, direccion?: string): Promise<Proyecto> => {
    const nuevoProyecto: Proyecto = {
        id: crypto.randomUUID(),
        nombre,
        cliente: cliente || "",
        direccion: direccion || "",
        fechaCreacion: new Date().toISOString(),
        ventanas: [],
        duracionMeses: 1,
        transporte: 0,
        contenidoCotizacion: ContenidoCotizacionSchema.parse({}),
        versionesCotizacion: [],
        puertas: [],
    }
    await repositorios.proyectos.agregar(nuevoProyecto)
    guardarProyectoActual(nuevoProyecto.id)
    return nuevoProyecto
}

export const eliminarProyecto = async (id: string): Promise<void> => {
    await repositorios.proyectos.eliminar(id)
    if (obtenerProyectoActual() === id) {
        guardarProyectoActual(null)
    }
}
