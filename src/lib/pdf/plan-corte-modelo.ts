import { format } from "date-fns"
import { es } from "date-fns/locale"

import { etiquetaPieza, obtenerTipoHoja } from "../design/piezas"
import type { DocumentoPlanCorte, LaminaVidrio } from "../types"

export interface EntradaDocumentoPlanCorte {
    proyecto: string
    laminas: readonly LaminaVidrio[]
    hoy: Date
}

export function armarDocumentoPlanCorte({ proyecto, laminas, hoy }: EntradaDocumentoPlanCorte): DocumentoPlanCorte {
    return {
        proyecto,
        fecha: format(hoy, "PPP", { locale: es }),
        laminas: laminas.map((lamina) => ({
            numero: lamina.numero,
            grupo: lamina.grupo ?? null,
            ancho: lamina.anchoLamina,
            alto: lamina.altoLamina,
            deInventario: lamina.restoId !== undefined,
            // El empaquetador ya trae ancho y alto girados cuando rotado es true.
            piezas: lamina.vidrios.map(({ vidrio, x, y, rotado }) => ({
                etiqueta: etiquetaPieza(vidrio),
                hoja: obtenerTipoHoja(vidrio),
                descripcion: `${vidrio.ventana} - ${vidrio.tipo}`,
                x,
                y,
                ancho: vidrio.ancho,
                alto: vidrio.alto,
                rotada: rotado,
            })),
            restos: lamina.restos.map(({ tipo, x, y, ancho, alto }) => ({ tipo, x, y, ancho, alto })),
            areaUsada: lamina.areaUsada,
            areaSobrante: lamina.areaSobrante,
        })),
    }
}
