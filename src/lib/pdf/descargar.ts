import type { DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"

import { registrarFuentes } from "./fuentes"

export const nombreArchivoPdf = (prefijo: string, proyecto: string): string =>
    `${prefijo}_${proyecto.trim().replace(/\s+/g, "_")}.pdf`

// react-pdf pesa ~1 MB: se carga solo al generar un PDF, nunca en la carga de la página.
export async function generarBlobPdf(documento: ReactElement<DocumentProps>): Promise<Blob> {
    const { Font, pdf } = await import("@react-pdf/renderer")
    registrarFuentes(Font, window.location.origin)
    return pdf(documento).toBlob()
}

export function descargarBlob(blob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement("a")
    enlace.href = url
    enlace.download = nombreArchivo
    enlace.click()
    // Revocar en el mismo tick puede cancelar la descarga en Firefox.
    setTimeout(() => URL.revokeObjectURL(url), 0)
}
