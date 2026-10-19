import { Image, Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import type { DocumentoCotizacion } from "@/lib/types"
import { estilosCotizacion } from "./estilos"

interface EncabezadoCotizacionPdfProps {
    documento: DocumentoCotizacion
}

interface DatoMetaPdfProps {
    etiqueta: string
    valor: string
    color?: string
}

function DatoMetaPdf({ etiqueta, valor, color }: DatoMetaPdfProps) {
    return (
        <Text style={{ fontSize: 8.5, marginTop: 2 }}>
            <Text style={estilosCotizacion.etiqueta}>{etiqueta}: </Text>
            <Text style={{ fontWeight: 700, color: color ?? PAPER.tinta }}>{valor}</Text>
        </Text>
    )
}

export function EncabezadoCotizacionPdf({ documento }: EncabezadoCotizacionPdfProps) {
    const { empresa } = documento
    const direccion = [empresa.direccion, empresa.ciudad].filter(Boolean).join(" • ")
    const contacto = [empresa.telefonos && `Cel: ${empresa.telefonos}`, empresa.email && `Email: ${empresa.email}`].filter(Boolean).join(" • ")

    return (
        <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderColor: PAPER.banda, paddingBottom: 10, marginBottom: 14 }}
        >
            <View style={{ flexDirection: "row", alignItems: "flex-start", flex: 1 }}>
                {empresa.logo && <Image src={empresa.logo} style={{ width: 64, height: 64, objectFit: "contain", marginRight: 10 }} />}
                <View style={{ flex: 1, fontSize: 8, color: PAPER.apagado }}>
                    <Text style={{ fontSize: 11, fontWeight: 700, color: PAPER.tinta, marginBottom: 2 }}>{empresa.nombre}</Text>
                    {empresa.nit && (
                        <Text>
                            <Text style={{ fontWeight: 700, color: PAPER.tinta }}>NIT:</Text> {empresa.nit}
                        </Text>
                    )}
                    {direccion && <Text>{direccion}</Text>}
                    {contacto && <Text>{contacto}</Text>}
                </View>
            </View>
            <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
                <Text
                    style={{ backgroundColor: PAPER.banda, color: PAPER.tintaBanda, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, paddingVertical: 3, paddingHorizontal: 9, marginBottom: 4 }}
                >
                    COTIZACIÓN
                </Text>
                {documento.fecha && <DatoMetaPdf etiqueta="Fecha" valor={documento.fecha} />}
                {documento.validez && <DatoMetaPdf etiqueta="Validez" valor={documento.validez} color={PAPER.ok} />}
            </View>
        </View>
    )
}
