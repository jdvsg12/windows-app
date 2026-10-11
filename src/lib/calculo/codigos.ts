// Códigos de pieza de vidrio de dos niveles: "V3-M1" = ventana 3 del proyecto, hoja móvil 1.
// Puro: el número de ventana sale del orden de la lista del proyecto, no del grupo de vidrio
// en el que termine la pieza, así una ventana conserva su número aunque mezcle tipos.
import type { HojaVidrio, Ventana, VidrioCorte } from "@/lib/types"

export const codigoPieza = (numeroVentana: number, hoja: HojaVidrio): string =>
    `V${numeroVentana}-${hoja.tipo === "fija" ? "F" : "M"}${hoja.numero}`

export function asignarCodigos(vidrios: readonly VidrioCorte[], ventanas: readonly Ventana[]): VidrioCorte[] {
    const numeroPorId = new Map(ventanas.map((ventana, i) => [ventana.id, i + 1]))
    return vidrios.map((vidrio) => {
        const numero = vidrio.ventanaId ? numeroPorId.get(vidrio.ventanaId) : undefined
        return numero && vidrio.hoja ? { ...vidrio, codigo: codigoPieza(numero, vidrio.hoja) } : vidrio
    })
}
