import { Text, View } from "@react-pdf/renderer"

import { LONGITUD_BARRA } from "@/lib/calculo/comun"
import { hexToken, PAPER } from "@/lib/design/tokens"
import { formatCount, formatMeters } from "@/lib/format"
import { estilosBase } from "@/lib/pdf/estilos"
import type { PerfilPlanCorte } from "@/lib/types"

const ANCHO_BARRA = 400
const CORTE = { fondo: hexToken("hoja-movil-bg"), borde: hexToken("hoja-movil-border") }
const SOBRANTE = { fondo: hexToken("desperdicio-bg"), borde: hexToken("desperdicio-border") }

interface PerfilesPdfProps {
    perfiles: readonly PerfilPlanCorte[]
}

interface PerfilPdfProps {
    perfil: PerfilPlanCorte
}

// Con coma decimal, como el resto del PDF: "2.300" se leería como dos mil trescientos.
const metros = (valor: number) => formatCount(valor, 3)

function PerfilPdf({ perfil }: PerfilPdfProps) {
    const titulo = perfil.color ? `${perfil.color} · ${perfil.perfil}` : perfil.perfil
    return (
        <View style={{ marginBottom: 12 }} wrap={false}>
            <Text style={estilosBase.negrita}>
                {titulo} · {perfil.barras.length} {perfil.barras.length === 1 ? "barra" : "barras"} · {formatMeters(perfil.metrosUsados)} usados
            </Text>
            {perfil.barras.map((barra, indice) => (
                <View key={indice} style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
                    <Text style={{ width: 22, fontSize: 8 }}>#{indice + 1}</Text>
                    <View style={{ flexDirection: "row", width: ANCHO_BARRA, flexShrink: 0, height: 16, borderWidth: 1, borderColor: PAPER.tinta }}>
                        {barra.cortes.map((corte, posicion) => (
                            <View
                                key={posicion}
                                style={{
                                    width: (corte / LONGITUD_BARRA) * ANCHO_BARRA,
                                    backgroundColor: CORTE.fondo,
                                    borderRightWidth: 1,
                                    borderColor: CORTE.borde,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {(corte / LONGITUD_BARRA) * ANCHO_BARRA > 26 && <Text style={{ fontSize: 7 }}>{metros(corte)}</Text>}
                            </View>
                        ))}
                        {barra.sobrante > 0 && <View style={{ flex: 1, backgroundColor: SOBRANTE.fondo }} />}
                    </View>
                    <Text style={{ flex: 1, fontSize: 7, marginLeft: 6 }}>
                        {/* Todas las medidas: las piezas cortas no caben rotuladas dentro de la barra. */}
                        {barra.cortes.map(metros).join(" + ")} · sobra {metros(barra.sobrante)} m
                    </Text>
                </View>
            ))}
        </View>
    )
}

// Medidas en metros con 3 decimales; cada barra mide lo mismo en el papel.
export function PerfilesPdf({ perfiles }: PerfilesPdfProps) {
    return (
        <View>
            <Text style={estilosBase.subtitulo}>Cortes de perfiles (barras de {LONGITUD_BARRA} m)</Text>
            {perfiles.map((perfil) => (
                <PerfilPdf key={`${perfil.color}-${perfil.perfil}`} perfil={perfil} />
            ))}
        </View>
    )
}
