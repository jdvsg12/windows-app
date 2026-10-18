"use client"

import type { DocumentProps } from "@react-pdf/renderer"
import { useCallback, useState, type ReactElement } from "react"

import { descargarBlob, generarBlobPdf } from "@/lib/pdf/descargar"

// crearDocumento importa el componente del PDF con import(): react-pdf se carga solo al descargar.
export function useDescargaPdf() {
    const [generando, setGenerando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const descargar = useCallback(
        async (crearDocumento: () => Promise<ReactElement<DocumentProps>>, nombreArchivo: string): Promise<boolean> => {
            setGenerando(true)
            setError(null)
            try {
                const blob = await generarBlobPdf(await crearDocumento())
                descargarBlob(blob, nombreArchivo)
                return true
            } catch (causa) {
                console.error("Error generando el PDF:", causa)
                setError("No se pudo generar el PDF. Intenta de nuevo.")
                return false
            } finally {
                setGenerando(false)
            }
        },
        [],
    )

    return { descargar, generando, error }
}
