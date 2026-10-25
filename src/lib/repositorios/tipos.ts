import type {
    ConfiguracionEmpresa,
    ConfiguracionOverhead,
    ConfiguracionPrecios,
    DescuentosPorSistema,
    FotosProductos,
    Proyecto,
} from "../types"

// Contrato de persistencia de la app. Asíncrono aunque hoy debajo esté localStorage (síncrono):
// así IndexedDB entra detrás sin tocar los hooks. Los guardados devuelven false si no se pudo
// escribir (almacenamiento lleno o bloqueado); nunca lanzan.

// Un documento único por dispositivo (configuración, precios…): leerlo nunca falla, devuelve
// el valor guardado si es válido o el predeterminado.
export interface RepositorioDocumento<T> {
    obtener(): Promise<T>
    guardar(valor: T): Promise<boolean>
}

export interface RepositorioProyectos {
    listar(): Promise<Proyecto[]>
    obtener(id: string): Promise<Proyecto | null>
    agregar(proyecto: Proyecto): Promise<boolean>
    // false también si el proyecto ya no existe: no se crea de nuevo uno borrado.
    actualizar(proyecto: Proyecto): Promise<boolean>
    eliminar(id: string): Promise<boolean>
}

export interface Repositorios {
    proyectos: RepositorioProyectos
    configuracion: RepositorioDocumento<ConfiguracionEmpresa>
    precios: RepositorioDocumento<ConfiguracionPrecios>
    descuentos: RepositorioDocumento<DescuentosPorSistema>
    overhead: RepositorioDocumento<ConfiguracionOverhead>
    fotosProductos: RepositorioDocumento<FotosProductos>
}
