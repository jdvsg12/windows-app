import { Image, Text, View } from "@react-pdf/renderer"

import { parsearTextoEnriquecido } from "@/lib/pdf/texto-enriquecido"
import type { AlineacionTexto, BloqueTexto, TramoTexto } from "@/lib/types"

const SANGRIA_NIVEL = 14
// Caja máxima de una imagen de referencia, en puntos: deja ver el detalle sin comerse la página.
const IMAGEN_MAX_ANCHO = 280
const IMAGEN_MAX_ALTO = 200

const ALINEACION_IMAGEN: Record<AlineacionTexto, "flex-start" | "center" | "flex-end"> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
}

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

// Con las medidas del <img> se escala sin deformar; sin ellas (imágenes pegadas antes de AWA-47)
// basta el alto: react-pdf calcula el ancho por la proporción de la imagen.
function tamanoImagen(bloque: Extract<BloqueTexto, { tipo: "imagen" }>) {
    if (!bloque.ancho || !bloque.alto) return { height: IMAGEN_MAX_ALTO * 0.8 }
    const escala = Math.min(1, IMAGEN_MAX_ANCHO / bloque.ancho, IMAGEN_MAX_ALTO / bloque.alto)
    return { width: bloque.ancho * escala, height: bloque.alto * escala }
}

function BloquePdf({ bloque }: BloquePdfProps) {
    if (bloque.tipo === "imagen") {
        return (
            <View style={{ alignItems: ALINEACION_IMAGEN[bloque.alineacion], marginVertical: 4 }} wrap={false}>
                <Image src={bloque.src} style={{ ...tamanoImagen(bloque), objectFit: "contain" }} />
            </View>
        )
    }
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
        <View>
            {bloques.map((bloque, indice) => (
                <BloquePdf key={indice} bloque={bloque} />
            ))}
        </View>
    )
}
