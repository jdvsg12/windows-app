import { Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import { formatCount, formatCurrency } from "@/lib/format"
import { metrosDesdeMm, numeroItem } from "@/lib/pdf/cotizacion-formato"
import type { DocumentoCotizacion, FilaCotizacion } from "@/lib/types"

const COLUMNAS = {
    item: { width: 26, textAlign: "center" },
    ubicacion: { flex: 1 },
    medida: { width: 54, textAlign: "center" },
    area: { width: 48, textAlign: "right" },
    valor: { width: 84, textAlign: "right" },
} as const

const celda = { paddingVertical: 5, paddingHorizontal: 5 }

interface TablaVentanasPdfProps {
    documento: DocumentoCotizacion
}

interface FilaVentanaPdfProps {
    fila: FilaCotizacion
    indice: number
    mostrarMedidas: boolean
    mostrarValores: boolean
}

function FilaVentanaPdf({ fila, indice, mostrarMedidas, mostrarValores }: FilaVentanaPdfProps) {
    const especificaciones = fila.especificaciones.join(" · ")
    return (
        // wrap={false}: una ventana nunca queda partida entre dos páginas.
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: PAPER.bordePanel }} wrap={false}>
            <Text style={[celda, COLUMNAS.item, { fontWeight: 700, color: PAPER.apagado }]}>{numeroItem(indice)}</Text>
            <View style={[celda, COLUMNAS.ubicacion]}>
                <Text style={{ fontWeight: 700 }}>
                    {fila.nombre} <Text style={{ fontWeight: 400, color: PAPER.apagado }}>· {fila.tipo}</Text>
                </Text>
                {especificaciones && <Text style={{ fontSize: 7.5, color: PAPER.apagado, marginTop: 1 }}>{especificaciones}</Text>}
            </View>
            {mostrarMedidas && (
                <>
                    <Text style={[celda, COLUMNAS.medida]}>{metrosDesdeMm(fila.ancho)}</Text>
                    <Text style={[celda, COLUMNAS.medida]}>{metrosDesdeMm(fila.alto)}</Text>
                    <Text style={[celda, COLUMNAS.area]}>{formatCount(fila.area ?? undefined, 2)}</Text>
                </>
            )}
            {mostrarValores && (
                <Text style={[celda, COLUMNAS.valor, { fontWeight: 700, color: PAPER.acento, backgroundColor: PAPER.acentoSuave }]}>
                    {formatCurrency(fila.valor ?? undefined)}
                </Text>
            )}
        </View>
    )
}

export function TablaVentanasPdf({ documento }: TablaVentanasPdfProps) {
    const { mostrarMedidas, mostrarValores } = documento
    const encabezado = [{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }, celda] as const

    return (
        <View style={{ borderWidth: 1, borderColor: PAPER.banda, fontSize: 8.5 }}>
            {/* fixed: el encabezado se repite en cada página que ocupe la tabla. */}
            <View style={{ flexDirection: "row", backgroundColor: PAPER.banda, color: PAPER.tintaBanda }} fixed>
                <Text style={[...encabezado, COLUMNAS.item]}>Ítem</Text>
                <Text style={[...encabezado, COLUMNAS.ubicacion]}>Ubicación y especificaciones</Text>
                {mostrarMedidas && (
                    <>
                        <Text style={[...encabezado, COLUMNAS.medida]}>Ancho</Text>
                        <Text style={[...encabezado, COLUMNAS.medida]}>Alto</Text>
                        <Text style={[...encabezado, COLUMNAS.area]}>Área m²</Text>
                    </>
                )}
                {mostrarValores && <Text style={[...encabezado, COLUMNAS.valor]}>Valor</Text>}
            </View>
            {documento.filas.map((fila, indice) => (
                <FilaVentanaPdf key={fila.id} fila={fila} indice={indice} mostrarMedidas={mostrarMedidas} mostrarValores={mostrarValores} />
            ))}
            {mostrarValores && (
                <View style={{ flexDirection: "row", backgroundColor: PAPER.panel, borderTopWidth: 1.5, borderColor: PAPER.banda }} wrap={false}>
                    <Text style={[celda, { flex: 1, textAlign: "right", fontWeight: 700, textTransform: "uppercase" }]}>
                        Total {documento.filas.length} {documento.filas.length === 1 ? "ventana" : "ventanas"}
                        {mostrarMedidas && documento.areaTotal !== null ? ` · ${formatCount(documento.areaTotal, 2)} m²` : ""}
                    </Text>
                    <Text style={[celda, COLUMNAS.valor, { fontWeight: 700, color: PAPER.acento }]}>{formatCurrency(documento.total ?? undefined)}</Text>
                </View>
            )}
        </View>
    )
}
