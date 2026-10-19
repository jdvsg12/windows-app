import { Rect, Svg, Text, View } from "@react-pdf/renderer"

import { hexToken, PAPER } from "@/lib/design/tokens"
import type { LaminaPlanCorte } from "@/lib/types"

const COLORES = {
    fija: { fondo: hexToken("hoja-fija-bg"), borde: hexToken("hoja-fija-border"), texto: hexToken("hoja-fija-fg") },
    movil: { fondo: hexToken("hoja-movil-bg"), borde: hexToken("hoja-movil-border"), texto: hexToken("hoja-movil-fg") },
    resto: { fondo: hexToken("resto-bg"), borde: hexToken("resto-border"), texto: hexToken("resto-fg") },
    desperdicio: { fondo: hexToken("desperdicio-bg"), borde: hexToken("desperdicio-border"), texto: hexToken("desperdicio-fg") },
} as const

export const COLORES_PLAN_CORTE = COLORES

interface DibujoLaminaPdfProps {
    lamina: LaminaPlanCorte
    // Espacio disponible en la página, en puntos.
    anchoMaximo: number
    altoMaximo: number
}

interface RotuloPdfProps {
    x: number
    y: number
    ancho: number
    alto: number
    lineas: string[]
    color: string
    escala: number
}

const medidas = (ancho: number, alto: number) => `${Math.round(ancho)}×${Math.round(alto)}`

// Encima del dibujo y en puntos: la letra se achica para caber en la pieza y se omite si queda ilegible.
function RotuloPdf({ x, y, ancho, alto, lineas, color, escala }: RotuloPdfProps) {
    const caracteres = Math.max(...lineas.map((linea) => linea.length))
    const tamano = Math.min(9, (alto * escala) / (lineas.length * 1.4), (ancho * escala * 0.9) / (caracteres * 0.58))
    if (tamano < 4.5) return null

    return (
        <View
            style={{
                position: "absolute",
                left: x * escala,
                top: y * escala,
                width: ancho * escala,
                height: alto * escala,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {lineas.map((linea, indice) => (
                <Text key={indice} style={{ color, fontSize: tamano, fontWeight: indice === 0 ? 700 : 400 }}>
                    {linea}
                </Text>
            ))}
        </View>
    )
}

export function DibujoLaminaPdf({ lamina, anchoMaximo, altoMaximo }: DibujoLaminaPdfProps) {
    const escala = Math.min(anchoMaximo / lamina.ancho, altoMaximo / lamina.alto)
    const trazo = Math.max(lamina.ancho, lamina.alto) / 600

    return (
        <View style={{ width: lamina.ancho * escala, height: lamina.alto * escala }}>
            <Svg width={lamina.ancho * escala} height={lamina.alto * escala} viewBox={`0 0 ${lamina.ancho} ${lamina.alto}`}>
                <Rect x={0} y={0} width={lamina.ancho} height={lamina.alto} fill={PAPER.fondo} stroke={PAPER.tinta} strokeWidth={trazo * 2} />
                {lamina.restos.map((resto, indice) => {
                    const color = COLORES[resto.tipo]
                    return (
                        <Rect key={indice} x={resto.x} y={resto.y} width={resto.ancho} height={resto.alto} fill={color.fondo} stroke={color.borde} strokeWidth={trazo} strokeDasharray={`${trazo * 4} ${trazo * 3}`} />
                    )
                })}
                {lamina.piezas.map((pieza, indice) => {
                    const color = COLORES[pieza.hoja]
                    return <Rect key={indice} x={pieza.x} y={pieza.y} width={pieza.ancho} height={pieza.alto} fill={color.fondo} stroke={color.borde} strokeWidth={trazo} />
                })}
            </Svg>
            {lamina.restos.map((resto, indice) => (
                <RotuloPdf
                    key={`r${indice}`}
                    {...resto}
                    escala={escala}
                    lineas={resto.tipo === "resto" ? ["R", medidas(resto.ancho, resto.alto)] : ["S"]}
                    color={COLORES[resto.tipo].texto}
                />
            ))}
            {lamina.piezas.map((pieza, indice) => (
                <RotuloPdf
                    key={`p${indice}`}
                    {...pieza}
                    escala={escala}
                    lineas={[pieza.etiqueta, `${medidas(pieza.ancho, pieza.alto)}${pieza.rotada ? " (girada)" : ""}`]}
                    color={COLORES[pieza.hoja].texto}
                />
            ))}
        </View>
    )
}
