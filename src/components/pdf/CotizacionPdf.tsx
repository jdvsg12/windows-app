import { Document, Page, Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import { resumenPago } from "@/lib/pdf/cotizacion-formato"
import { estilosBase } from "@/lib/pdf/estilos"
import { parsearTextoEnriquecido } from "@/lib/pdf/texto-enriquecido"
import type { DocumentoCotizacion } from "@/lib/types"
import { ClienteCotizacionPdf } from "./cotizacion/ClienteCotizacionPdf"
import { CondicionesPdf } from "./cotizacion/CondicionesPdf"
import { EncabezadoCotizacionPdf } from "./cotizacion/EncabezadoCotizacionPdf"
import { estilosCotizacion } from "./cotizacion/estilos"
import { FirmasPdf } from "./cotizacion/FirmasPdf"
import { FotosProductosPdf } from "./cotizacion/FotosProductosPdf"
import { ResumenPagoPdf } from "./cotizacion/ResumenPagoPdf"
import { DescripcionPdf } from "./DescripcionPdf"
import { TablaVentanasPdf } from "./TablaVentanasPdf"

interface CotizacionPdfProps {
    documento: DocumentoCotizacion
}

interface PieCotizacionPdfProps {
    empresa: string
}

function PieCotizacionPdf({ empresa }: PieCotizacionPdfProps) {
    return (
        <View
            style={{ position: "absolute", bottom: 22, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderColor: PAPER.bordePanel, paddingTop: 4, fontSize: 7, color: PAPER.apagado }}
            fixed
        >
            <Text>Documento generado digitalmente • {empresa}</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
    )
}

// Diseño de referencia: docs/diseno-cotizacion.html (aprobado por el usuario, 2026-10-19).
export function CotizacionPdf({ documento }: CotizacionPdfProps) {
    const { empresa } = documento
    const pago = documento.mostrarValores ? resumenPago(documento.total) : null
    const tieneDescripcion = parsearTextoEnriquecido(documento.descripcion).length > 0
    const tieneFotos = documento.productos.some((producto) => producto.imagen)

    return (
        <Document title={`Cotización ${documento.proyecto}`} author={empresa.nombre} language="es">
            <Page size="A4" style={[estilosBase.pagina, { fontSize: 9 }]}>
                <EncabezadoCotizacionPdf documento={documento} />
                <ClienteCotizacionPdf documento={documento} />

                {(tieneDescripcion || tieneFotos) && (
                    <View style={estilosCotizacion.seccion}>
                        <Text style={estilosCotizacion.tituloSeccion}>Criterios técnicos y especificaciones</Text>
                        <DescripcionPdf html={documento.descripcion} />
                        <FotosProductosPdf productos={documento.productos} />
                    </View>
                )}

                <View style={estilosCotizacion.seccion}>
                    <Text style={[estilosCotizacion.tituloSeccion, { borderBottomWidth: 0 }]}>Ventanas del proyecto</Text>
                    <TablaVentanasPdf documento={documento} />
                </View>

                {pago && documento.total !== null && <ResumenPagoPdf total={documento.total} pago={pago} />}
                <CondicionesPdf documento={documento} pago={pago} />
                <FirmasPdf empresa={empresa} />
                <PieCotizacionPdf empresa={empresa.nombre} />
            </Page>
        </Document>
    )
}

// Como elemento JSX, react-pdf lo acepta como raíz del documento en pdf().
export const crearCotizacionPdf = (documento: DocumentoCotizacion) => <CotizacionPdf documento={documento} />
