import type { Font } from "@react-pdf/renderer"

import { FUENTE_PDF } from "./estilos"

const RUTA_FUENTES = "/fonts/geist"

// Geist 1.7.2 (OFL, paquete npm "geist"): regular, negrita y sus cursivas, las que usa el editor.
export function registrarFuentes(fuentes: typeof Font, origen: string): void {
    const archivo = (nombre: string) => new URL(`${RUTA_FUENTES}/${nombre}.ttf`, origen).href

    fuentes.register({
        family: FUENTE_PDF,
        fonts: [
            { src: archivo("Geist-Regular"), fontWeight: 400 },
            { src: archivo("Geist-Italic"), fontWeight: 400, fontStyle: "italic" },
            { src: archivo("Geist-Bold"), fontWeight: 700 },
            { src: archivo("Geist-BoldItalic"), fontWeight: 700, fontStyle: "italic" },
        ],
    })
    // Sin esto react-pdf parte las palabras con reglas del inglés ("ventan-as").
    fuentes.registerHyphenationCallback((palabra) => [palabra])
}
