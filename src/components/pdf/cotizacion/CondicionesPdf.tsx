import { Text, View } from "@react-pdf/renderer"

import { textoFormaPago, type ResumenPago } from "@/lib/pdf/cotizacion-formato"
import type { DocumentoCotizacion } from "@/lib/types"
import { estilosCotizacion } from "./estilos"

interface CondicionesPdfProps {
    documento: DocumentoCotizacion
    pago: ResumenPago | null
}

interface CondicionPdfProps {
    titulo: string
    texto: string
}

function CondicionPdf({ titulo, texto }: CondicionPdfProps) {
    return (
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <Text style={{ fontWeight: 700, marginRight: 4 }}>•</Text>
            <Text style={{ flex: 1 }}>
                <Text style={{ fontWeight: 700 }}>{titulo}: </Text>
                <Text style={estilosCotizacion.textoApagado}>{texto}</Text>
            </Text>
        </View>
    )
}


export function CondicionesPdf({ documento, pago }: CondicionesPdfProps) {
    const { datosBancarios } = documento.empresa
    return (
        <View style={[estilosCotizacion.seccion, { flexDirection: "row", fontSize: 8.5 }]} wrap={false}>
            <View style={{ flex: 5, marginRight: 12 }}>
                <Text style={estilosCotizacion.tituloSeccion}>Condiciones comerciales</Text>
                <CondicionPdf titulo="Forma de pago" texto={textoFormaPago(pago)} />
                {documento.tiempoEntrega && <CondicionPdf titulo="Tiempo de entrega" texto={documento.tiempoEntrega} />}
                {documento.validez && <CondicionPdf titulo="Validez de la oferta" texto={documento.validez} />}
            </View>
            {datosBancarios && (
                <View style={[estilosCotizacion.panel, { flex: 7 }]}>
                    <Text style={estilosCotizacion.tituloSeccion}>Información bancaria</Text>
                    <Text>{datosBancarios}</Text>
                </View>
            )}
        </View>
    )
}
