import { Image, Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import type { ConfiguracionEmpresa } from "@/lib/types"
import { estilosCotizacion } from "./estilos"

interface FirmasPdfProps {
    empresa: ConfiguracionEmpresa
}

const ALTO_FIRMA = 44

export function FirmasPdf({ empresa }: FirmasPdfProps) {
    return (
        <View style={{ flexDirection: "row", marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderColor: PAPER.bordePanel, fontSize: 8.5 }} wrap={false}>
            <View style={{ flex: 1, marginRight: 24 }}>
                <View style={{ height: ALTO_FIRMA, justifyContent: "flex-end" }}>
                    {empresa.firma && <Image src={empresa.firma} style={{ width: 132, height: ALTO_FIRMA, objectFit: "contain", objectPosition: "left" }} />}
                </View>
                <View style={{ borderTopWidth: 1.5, borderColor: PAPER.banda, paddingTop: 3 }}>
                    <Text style={{ fontWeight: 700, textTransform: "uppercase" }}>{empresa.representante}</Text>
                    {empresa.cedula && <Text style={estilosCotizacion.textoApagado}>C.C. {empresa.cedula}</Text>}
                    <Text style={[estilosCotizacion.etiqueta, { color: PAPER.acento }]}>{empresa.nombre}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ height: ALTO_FIRMA, justifyContent: "flex-end", alignItems: "center", paddingBottom: 4 }}>
                    <Text style={[estilosCotizacion.textoApagado, { fontSize: 7.5, fontStyle: "italic" }]}>Firma y sello de aceptación</Text>
                </View>
                <View style={{ borderTopWidth: 1.5, borderColor: PAPER.apagado, borderStyle: "dashed", paddingTop: 3 }}>
                    <Text style={{ fontWeight: 700, textTransform: "uppercase" }}>Aceptado por el cliente</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={estilosCotizacion.textoApagado}>C.C. / NIT: ______________</Text>
                        <Text style={estilosCotizacion.textoApagado}>Fecha: ____/____/______</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
