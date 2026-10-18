import { Document, Image, Page, Text, View } from "@react-pdf/renderer"

import { formatArea, formatCurrency } from "@/lib/format"
import { PAPER } from "@/lib/design/tokens"
import { estilosBase } from "@/lib/pdf/estilos"
import type { DocumentoCotizacion } from "@/lib/types"
import { DescripcionPdf } from "./DescripcionPdf"
import { TablaVentanasPdf } from "./TablaVentanasPdf"

interface CotizacionPdfProps {
    documento: DocumentoCotizacion
}

const separacion = { marginBottom: 16 }

const encabezado = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderColor: PAPER.tinta,
    paddingBottom: 12,
    ...separacion,
} as const

export function CotizacionPdf({ documento }: CotizacionPdfProps) {
    const { empresa } = documento
    const mostrarAreaTotal = documento.mostrarMedidas && documento.areaTotal !== null

    return (
        <Document title={`Cotización ${documento.proyecto}`} author={empresa.nombre} language="es">
            <Page size="A4" style={estilosBase.pagina}>
                <View style={encabezado}>
                    {empresa.logo ? <Image src={empresa.logo} style={{ width: 90, height: 90, objectFit: "contain" }} /> : <View />}
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={estilosBase.negrita}>{empresa.nombre}</Text>
                        <Text>NIT: {empresa.nit}</Text>
                        <Text>{empresa.direccion}</Text>
                        <Text>CEL: {empresa.telefonos}</Text>
                        <Text>e-mail: {empresa.email}</Text>
                        <Text>{empresa.ciudad}</Text>
                    </View>
                </View>

                <Text style={{ textAlign: "right", ...separacion }}>{documento.fecha}</Text>

                <View style={separacion}>
                    <Text>Señor(a):</Text>
                    <Text style={estilosBase.negrita}>{documento.cliente}</Text>
                </View>

                <Text style={estilosBase.titulo}>COTIZACIÓN</Text>

                <DescripcionPdf html={documento.descripcion} />

                <Text style={estilosBase.subtitulo}>Ventanas del Proyecto: {documento.proyecto}</Text>
                <TablaVentanasPdf documento={documento} />

                <View style={{ marginTop: 8, ...separacion }} wrap={false}>
                    <Text style={estilosBase.negrita}>Total de ventanas: {documento.filas.length}</Text>
                    {mostrarAreaTotal && <Text>Área total: {formatArea(documento.areaTotal ?? undefined)}</Text>}
                    {documento.mostrarValores && (
                        <Text style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                            VALOR TOTAL: {formatCurrency(documento.total ?? undefined)}
                        </Text>
                    )}
                </View>

                <View style={separacion} wrap={false}>
                    <Text style={estilosBase.subtitulo}>FORMA DE PAGO:</Text>
                    <Text>Anticipo 60%</Text>
                    <Text>Saldo: PAGOS PARCIALES SEGÚN AVANCE DE LA OBRA</Text>
                </View>

                <View style={separacion} wrap={false}>
                    <Text style={estilosBase.subtitulo}>DATOS BANCARIOS:</Text>
                    <Text>{empresa.datosBancarios}</Text>
                </View>

                <View style={{ marginTop: 32, borderTopWidth: 1, borderColor: PAPER.tinta, paddingTop: 12 }} wrap={false}>
                    <Text>___________________________</Text>
                    <Text style={estilosBase.negrita}>{empresa.representante}</Text>
                    <Text>C.C. {empresa.cedula}</Text>
                </View>

                <Text
                    style={estilosBase.numeroPagina}
                    render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    )
}

// Como elemento JSX, react-pdf lo acepta como raíz del documento en pdf().
export const crearCotizacionPdf = (documento: DocumentoCotizacion) => <CotizacionPdf documento={documento} />
