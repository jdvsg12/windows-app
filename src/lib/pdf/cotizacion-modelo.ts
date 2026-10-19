import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"

import { textoAFecha } from "../contenido-cotizacion"
import type { ContenidoCotizacionFormValues } from "../schemas"
import {
    especificacionesVentana,
    getCerraduraLabel,
    getRodachinaLabel,
    getTipoVentanaLabel,
    type ConfiguracionEmpresa,
    type CostosCalculadosCotizador,
    type DocumentoCotizacion,
    type FotosProductos,
    type ProductoCotizacion,
    type Proyecto,
} from "../types"

export interface EntradaDocumentoCotizacion {
    proyecto: Proyecto
    empresa: ConfiguracionEmpresa
    costos: CostosCalculadosCotizador | null
    contenido: ContenidoCotizacionFormValues
    // Catálogo de Admin → Fotos. Sin catálogo la cotización sale sin fotos.
    fotos?: FotosProductos
}

export const claveProducto = (familia: "cerradura" | "rodachina", tipo: string): string => `${familia}:${tipo}`

// Una foto por tipo usado, en el orden en que aparecen las ventanas; solo los que tienen foto.
export function productosConFoto(proyecto: Proyecto, fotos: FotosProductos | undefined): ProductoCotizacion[] {
    if (!fotos) return []
    const productos = new Map<string, ProductoCotizacion>()
    for (const ventana of proyecto.ventanas) {
        const cerradura = ventana.cerradura && fotos.cerraduras[ventana.cerradura]
        if (ventana.cerradura && cerradura) {
            productos.set(claveProducto("cerradura", ventana.cerradura), {
                clave: claveProducto("cerradura", ventana.cerradura),
                nombre: cerradura.nombre || `Cerradura ${getCerraduraLabel(ventana.cerradura)}`,
                imagen: cerradura.imagen,
            })
        }
        const rodachina = ventana.rodachina && fotos.rodachinas[ventana.rodachina]
        if (ventana.rodachina && rodachina) {
            productos.set(claveProducto("rodachina", ventana.rodachina), {
                clave: claveProducto("rodachina", ventana.rodachina),
                nombre: rodachina.nombre || `Rodachina ${getRodachinaLabel(ventana.rodachina)}`,
                imagen: rodachina.imagen,
            })
        }
    }
    return [...productos.values()]
}

// Una sola fuente para la vista previa y el PDF: lo que decide qué se imprime vive aquí, no en cada renderizador.
export function armarDocumentoCotizacion({
    proyecto,
    empresa,
    costos,
    contenido,
    fotos,
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
        productos: productosConFoto(proyecto, fotos),
        areaTotal: costos?.areaTotal ?? null,
        total: costos?.total ?? null,
    }
}
