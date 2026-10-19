"use client"

import type React from "react"
import { useCallback, useState } from "react"

import { processLogoFile } from "@/lib/logo"

// Carga de una imagen de la empresa (logo, firma): la valida, la reduce y entrega el data URL.
export function useCargaImagen(nombre: string, onCargada: (dataUrl: string) => void, maxDimension?: number) {
    const [error, setError] = useState<string | null>(null)

    const handleArchivo = useCallback(
        async (evento: React.ChangeEvent<HTMLInputElement>) => {
            const archivo = evento.target.files?.[0]
            evento.target.value = ""
            if (!archivo) return

            const resultado = await processLogoFile(archivo, nombre, maxDimension)
            if ("error" in resultado) {
                setError(resultado.error)
                return
            }
            setError(null)
            onCargada(resultado.dataUrl)
        },
        [nombre, onCargada, maxDimension],
    )

    return { handleArchivo, error }
}
