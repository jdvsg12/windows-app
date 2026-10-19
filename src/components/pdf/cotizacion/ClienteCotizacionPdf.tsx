import { Text, View } from "@react-pdf/renderer"

import type { DocumentoCotizacion } from "@/lib/types"
import { estilosCotizacion } from "./estilos"

interface ClienteCotizacionPdfProps {
    documento: DocumentoCotizacion
}

interface FilaClientePdfProps {
    etiqueta: string
    valor: string
    destacado?: boolean
}

function FilaClientePdf({ etiqueta, valor, destacado = false }: FilaClientePdfProps) {
    return (
        <View style={{ flexDirection: "row", marginBottom: 2 }}>
            <Text style={[estilosCotizacion.textoApagado, { width: 70 }]}>{etiqueta}</Text>
            <Text style={{ flex: 1, fontWeight: destacado ? 700 : 400 }}>{valor}</Text>
        </View>
    )
}

export function ClienteCotizacionPdf({ documento }: ClienteCotizacionPdfProps) {
    return (
        <View style={[estilosCotizacion.panel, estilosCotizacion.seccion, { fontSize: 9 }]} wrap={false}>
            <FilaClientePdf etiqueta="Atención:" valor={documento.cliente || "—"} destacado />
            <FilaClientePdf etiqueta="Proyecto:" valor={documento.proyecto} />
            {documento.direccionObra && <FilaClientePdf etiqueta="Obra:" valor={documento.direccionObra} />}
        </View>
    )
}
