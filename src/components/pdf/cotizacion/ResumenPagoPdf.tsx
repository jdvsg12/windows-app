import { Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import { formatCurrency } from "@/lib/format"
import { PORCENTAJE_ANTICIPO, type ResumenPago } from "@/lib/pdf/cotizacion-formato"
import { estilosCotizacion } from "./estilos"

interface ResumenPagoPdfProps {
    total: number
    pago: ResumenPago
}

interface CifraPdfProps {
    etiqueta: string
    valor: string
    resaltada?: boolean
}

function CifraPdf({ etiqueta, valor, resaltada = false }: CifraPdfProps) {
    return (
        <View
            style={[
                estilosCotizacion.tarjeta,
                { flex: 1, marginRight: 6 },
                resaltada ? { backgroundColor: PAPER.acentoSuave, borderColor: PAPER.acentoSuave } : {},
            ]}
        >
            <Text style={[estilosCotizacion.etiqueta, resaltada ? { color: PAPER.acento } : {}]}>{etiqueta}</Text>
            <Text style={{ fontWeight: 700, fontSize: 9.5, marginTop: 2, color: resaltada ? PAPER.acento : PAPER.tinta }}>{valor}</Text>
        </View>
    )
}

export function ResumenPagoPdf({ total, pago }: ResumenPagoPdfProps) {
    return (
        <View style={[estilosCotizacion.panel, estilosCotizacion.seccion, { flexDirection: "row", alignItems: "center" }]} wrap={false}>
            <View style={{ flexDirection: "row", flex: 7 }}>
                <CifraPdf etiqueta={`Anticipo (${PORCENTAJE_ANTICIPO} %)`} valor={formatCurrency(pago.anticipo)} resaltada />
                <CifraPdf etiqueta={`Saldo (${100 - PORCENTAJE_ANTICIPO} %)`} valor={formatCurrency(pago.saldo)} />
            </View>
            <View style={{ flex: 5, borderLeftWidth: 2, borderColor: PAPER.banda, paddingLeft: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Total proyecto</Text>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 15, fontWeight: 700 }}>{formatCurrency(total)}</Text>
                    <Text style={[estilosCotizacion.etiqueta, { marginTop: 1 }]}>COP</Text>
                </View>
            </View>
        </View>
    )
}
