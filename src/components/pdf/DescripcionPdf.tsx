import { Text, View } from "@react-pdf/renderer"

import { parsearTextoEnriquecido } from "@/lib/pdf/texto-enriquecido"
import type { BloqueTexto, TramoTexto } from "@/lib/types"

const SANGRIA_NIVEL = 14

interface DescripcionPdfProps {
    html: string
}

interface BloquePdfProps {
    bloque: BloqueTexto
}

interface TramosPdfProps {
    tramos: TramoTexto[]
}

function TramosPdf({ tramos }: TramosPdfProps) {
    return tramos.map((tramo, indice) => (
        <Text key={indice} style={{ fontWeight: tramo.negrita ? 700 : 400, fontStyle: tramo.cursiva ? "italic" : "normal" }}>
            {tramo.texto}
        </Text>
    ))
}

function marcadorDe(bloque: Extract<BloqueTexto, { tipo: "lista" }>, indice: number, nivel: number): string {
    if (nivel > 0) return "–"
    if (!bloque.ordenada) return "•"
    const posicion = bloque.items.slice(0, indice + 1).filter((item) => item.nivel === 0).length
    return `${posicion}.`
}

function BloquePdf({ bloque }: BloquePdfProps) {
    if (bloque.tipo === "parrafo") {
        // Una línea vacía del editor: un espacio para que ocupe su alto.
        return (
            <Text style={{ textAlign: bloque.alineacion }}>
                {bloque.tramos.length > 0 ? <TramosPdf tramos={bloque.tramos} /> : " "}
            </Text>
        )
    }
    return (
        <View style={{ marginVertical: 2 }}>
            {bloque.items.map((item, indice) => (
                <View key={indice} style={{ flexDirection: "row", marginLeft: item.nivel * SANGRIA_NIVEL }} wrap={false}>
                    <Text style={{ width: SANGRIA_NIVEL }}>{marcadorDe(bloque, indice, item.nivel)}</Text>
                    <Text style={{ flex: 1 }}>
                        <TramosPdf tramos={item.tramos} />
                    </Text>
                </View>
            ))}
        </View>
    )
}

export function DescripcionPdf({ html }: DescripcionPdfProps) {
    const bloques = parsearTextoEnriquecido(html)
    if (bloques.length === 0) return null

    return (
        <View style={{ marginBottom: 16 }}>
            {bloques.map((bloque, indice) => (
                <BloquePdf key={indice} bloque={bloque} />
            ))}
        </View>
    )
}
