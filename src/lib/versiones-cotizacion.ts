import type { DocumentoCotizacion, FotosProductos, VersionCotizacion } from "./types"

// Versionado de los PDF de cotización (D11): las 3 últimas generadas más una "guardada",
// que no rota. Funciones puras: el id y la fecha los pone quien llama.
export const MAX_VERSIONES_RECIENTES = 3

// Logo, firma y fotos pesan cientos de KB: repetidos en cada versión llenarían el almacenamiento.
const sinImagenes = (documento: DocumentoCotizacion): DocumentoCotizacion => ({
    ...documento,
    empresa: { ...documento.empresa, logo: undefined, firma: undefined },
    productos: documento.productos.map(({ clave, nombre }) => ({ clave, nombre })),
})

const mismoDocumento = (a: DocumentoCotizacion, b: DocumentoCotizacion) => JSON.stringify(a) === JSON.stringify(b)

// La más reciente primero; la guardada siempre se queda, de las demás solo las últimas 3.
function recortar(versiones: readonly VersionCotizacion[]): VersionCotizacion[] {
    let recientes = 0
    return [...versiones]
        .sort((a, b) => b.creada.localeCompare(a.creada))
        .filter((version) => version.guardada || ++recientes <= MAX_VERSIONES_RECIENTES)
}

export function registrarVersion(
    versiones: readonly VersionCotizacion[],
    documento: DocumentoCotizacion,
    id: string,
    creada: string,
): VersionCotizacion[] {
    const nuevo = sinImagenes(documento)
    const ultima = recortar(versiones)[0]
    // Descargar dos veces el mismo PDF no gasta una versión: solo actualiza la fecha.
    if (ultima && mismoDocumento(ultima.documento, nuevo)) {
        return recortar(versiones.map((version) => (version.id === ultima.id ? { ...version, creada } : version)))
    }
    return recortar([{ id, creada, guardada: false, documento: nuevo }, ...versiones])
}

// Solo una guardada: la anterior vuelve a ser una versión normal (y puede salir por antigua).
export function marcarGuardada(versiones: readonly VersionCotizacion[], id: string): VersionCotizacion[] {
    return recortar(versiones.map((version) => ({ ...version, guardada: version.id === id })))
}

export function quitarGuardada(versiones: readonly VersionCotizacion[]): VersionCotizacion[] {
    return recortar(versiones.map((version) => ({ ...version, guardada: false })))
}

// Al volver a descargar se usan el logo, la firma y las fotos actuales: las versiones no los guardan.
// Un producto cuya foto se quitó del catálogo sale sin foto.
export const documentoDeVersion = (
    version: VersionCotizacion,
    imagenes: { logo?: string; firma?: string; fotos?: FotosProductos },
): DocumentoCotizacion => {
    const fotoActual = (clave: string): string | undefined => {
        const [familia, tipo] = clave.split(":")
        const catalogo: Record<string, { imagen: string } | undefined> =
            familia === "cerradura" ? (imagenes.fotos?.cerraduras ?? {}) : (imagenes.fotos?.rodachinas ?? {})
        return catalogo[tipo]?.imagen
    }
    return {
        ...version.documento,
        empresa: { ...version.documento.empresa, logo: imagenes.logo, firma: imagenes.firma },
        productos: version.documento.productos.map((producto) => ({ ...producto, imagen: fotoActual(producto.clave) })),
    }
}
