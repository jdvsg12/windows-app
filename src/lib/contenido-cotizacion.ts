import { format, parseISO } from "date-fns"

import type { ContenidoCotizacionFormValues } from "./schemas"
import type { Proyecto } from "./types"

const FORMATO_FECHA = "yyyy-MM-dd"

export const fechaATexto = (fecha: Date): string => format(fecha, FORMATO_FECHA)

// parseISO lee "yyyy-MM-dd" como medianoche local, así que la fecha no se corre un día por la zona horaria.
export const textoAFecha = (texto: string): Date => parseISO(texto)

export function valoresContenido(proyecto: Proyecto, hoy: Date): ContenidoCotizacionFormValues {
    const { fecha, descripcion, mostrarMedidas, mostrarValores, tiempoEntrega, validez } = proyecto.contenidoCotizacion
    return {
        cliente: proyecto.cliente,
        direccion: proyecto.direccion ?? "",
        fecha: fecha ?? fechaATexto(hoy),
        descripcion,
        mostrarMedidas,
        mostrarValores,
        tiempoEntrega,
        validez,
    }
}

export function cambiosContenido({
    cliente,
    direccion,
    ...contenidoCotizacion
}: ContenidoCotizacionFormValues): Pick<Proyecto, "cliente" | "direccion" | "contenidoCotizacion"> {
    return { cliente, direccion, contenidoCotizacion }
}
