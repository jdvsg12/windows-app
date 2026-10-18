"use client"

import { useCallback, useState } from "react"

import { descargarBlob, generarBlobPdf, nombreArchivoPdf } from "@/lib/pdf/descargar"
import type { DocumentoCotizacion } from "@/lib/types"

export function useDescargaCotizacion() {
    const [generando, setGenerando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const descargar = useCallback(async (documento: DocumentoCotizacion) => {
        setGenerando(true)
        setError(null)
        try {
            // El componente importa react-pdf: se carga junto con él, solo al descargar.
            const { crearCotizacionPdf } = await import("@/components/pdf/CotizacionPdf")
            const blob = await generarBlobPdf(crearCotizacionPdf(documento))
            descargarBlob(blob, nombreArchivoPdf("Cotizacion", documento.proyecto))
        } catch (causa) {
            console.error("Error generando el PDF:", causa)
            setError("No se pudo generar el PDF. Intenta de nuevo.")
        } finally {
            setGenerando(false)
        }
    }, [])

    return { descargar, generando, error }
}
