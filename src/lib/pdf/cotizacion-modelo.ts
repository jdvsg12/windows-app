import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"

import { textoAFecha } from "../contenido-cotizacion"
import type { ContenidoCotizacionFormValues } from "../schemas"
import {
    especificacionesVentana,
    getTipoVentanaLabel,
    type ConfiguracionEmpresa,
    type CostosCalculadosCotizador,
    type DocumentoCotizacion,
    type Proyecto,
} from "../types"

export interface EntradaDocumentoCotizacion {
    proyecto: Proyecto
    empresa: ConfiguracionEmpresa
    costos: CostosCalculadosCotizador | null
    contenido: ContenidoCotizacionFormValues
}

// Una sola fuente para la vista previa y el PDF: lo que decide qué se imprime vive aquí, no en cada renderizador.
export function armarDocumentoCotizacion({
    proyecto,
    empresa,
    costos,
    contenido,
}: EntradaDocumentoCotizacion): DocumentoCotizacion {
    const valores = new Map(costos?.valoresPorVentana.map((valor) => [valor.id, valor]))
    const fecha = textoAFecha(contenido.fecha)

    return {
        empresa,
        // "Girardot, 17 de octubre de 2026". Una fecha inválida no puede tumbar la vista previa: sale sin fecha.
        fecha: [empresa.ciudad.trim(), isValid(fecha) ? format(fecha, "PPP", { locale: es }) : ""].filter(Boolean).join(", "),
        cliente: contenido.cliente,
        direccionObra: contenido.direccion,
        proyecto: proyecto.nombre,
        descripcion: contenido.descripcion,
        tiempoEntrega: contenido.tiempoEntrega,
        validez: contenido.validez,
        mostrarMedidas: contenido.mostrarMedidas,
        // Sin costeo no hay valores que mostrar, aunque la opción esté activa.
        mostrarValores: contenido.mostrarValores && costos !== null,
        filas: proyecto.ventanas.map((ventana) => ({
            id: ventana.id,
            nombre: ventana.nombre,
            tipo: getTipoVentanaLabel(ventana.tipoVentana),
            especificaciones: especificacionesVentana(ventana),
            ancho: ventana.ancho,
            alto: ventana.alto,
            area: valores.get(ventana.id)?.area ?? null,
            valor: valores.get(ventana.id)?.valor ?? null,
        })),
        areaTotal: costos?.areaTotal ?? null,
        total: costos?.total ?? null,
    }
}
