import type { Font } from "@react-pdf/renderer"

import { FUENTE_PDF } from "./estilos"

const RUTA_FUENTES = "/fonts/geist"

// Geist no tiene cursiva: la cursiva del editor usa el mismo trazo para que el PDF no falle al no encontrarla.
export function registrarFuentes(fuentes: typeof Font, origen: string): void {
    const regular = new URL(`${RUTA_FUENTES}/Geist-Regular.ttf`, origen).href
    const negrita = new URL(`${RUTA_FUENTES}/Geist-Bold.ttf`, origen).href

    fuentes.register({
        family: FUENTE_PDF,
        fonts: [
            { src: regular, fontWeight: 400 },
            { src: regular, fontWeight: 400, fontStyle: "italic" },
            { src: negrita, fontWeight: 700 },
            { src: negrita, fontWeight: 700, fontStyle: "italic" },
        ],
    })
    // Sin esto react-pdf parte las palabras con reglas del inglés ("ventan-as").
    fuentes.registerHyphenationCallback((palabra) => [palabra])
}
