"use client"

import { useCallback, useEffect, useState } from "react"

import { useAutosave } from "@/hooks/useAutosave"
import { guardarFotosProductos, obtenerFotosProductos } from "@/lib/storage"
import type { FotoProducto, FotosProductos } from "@/lib/types"

export type FamiliaProducto = keyof FotosProductos

export function useFotosProductos() {
    const [fotos, setFotos] = useState<FotosProductos | null>(null)

    useEffect(() => {
        setFotos(obtenerFotosProductos())
    }, [])

    // Fotos y leyendas se guardan solas, como el resto de formularios de la app.
    const status = useAutosave({ value: fotos, onSave: (actual) => (actual ? guardarFotosProductos(actual) : undefined), enabled: fotos !== null })

    // tipo es un valor de CERRADURAS o RODACHINAS; el catálogo se trata como un mapa por tipo.
    const cambiar = useCallback(
        (familia: FamiliaProducto, tipo: string, cambio: (foto: FotoProducto | undefined) => FotoProducto | undefined) => {
            setFotos((actual) => {
                if (!actual) return actual
                const catalogo: Record<string, FotoProducto | undefined> = { ...actual[familia] }
                const nueva = cambio(catalogo[tipo])
                if (nueva) catalogo[tipo] = nueva
                else delete catalogo[tipo]
                return { ...actual, [familia]: catalogo }
            })
        },
        [],
    )

    const ponerImagen = useCallback(
        (familia: FamiliaProducto, tipo: string, imagen: string | undefined) =>
            cambiar(familia, tipo, (foto) => (imagen ? { imagen, nombre: foto?.nombre ?? "" } : undefined)),
        [cambiar],
    )

    const ponerNombre = useCallback(
        (familia: FamiliaProducto, tipo: string, nombre: string) => cambiar(familia, tipo, (foto) => foto && { ...foto, nombre }),
        [cambiar],
    )

    return { fotos, status, ponerImagen, ponerNombre }
}
