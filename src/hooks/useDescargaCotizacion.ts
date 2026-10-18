"use client"

import { useCallback, useState } from "react"

import { armarDocumentoCotizacion, type EntradaDocumentoCotizacion } from "@/lib/pdf/cotizacion-modelo"
import { descargarBlob, generarBlobPdf, nombreArchivoPdf } from "@/lib/pdf/descargar"

export function useDescargaCotizacion() {
    const [generando, setGenerando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const descargar = useCallback(async (entrada: EntradaDocumentoCotizacion) => {
        setGenerando(true)
        setError(null)
        try {
            const documento = armarDocumentoCotizacion(entrada)
            // El componente importa react-pdf: se carga junto con él, solo al descargar.
            const { crearCotizacionPdf } = await import("@/components/pdf/CotizacionPdf")
            const blob = await generarBlobPdf(crearCotizacionPdf(documento))
            descargarBlob(blob, nombreArchivoPdf("Cotizacion", entrada.proyecto.nombre))
        } catch (causa) {
            console.error("Error generando el PDF:", causa)
            setError("No se pudo generar el PDF. Intenta de nuevo.")
        } finally {
            setGenerando(false)
        }
    }, [])

    return { descargar, generando, error }
}
