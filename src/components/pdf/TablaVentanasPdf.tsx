import { Text, View } from "@react-pdf/renderer"

import { formatCount, formatCurrency } from "@/lib/format"
import { estilosBase } from "@/lib/pdf/estilos"
import type { DocumentoCotizacion, FilaCotizacion } from "@/lib/types"

const COLUMNAS = {
    nombre: { width: "18%" },
    tipo: { flex: 1 },
    medida: { width: "11%" },
    area: { width: "10%", textAlign: "right" },
    valor: { width: "16%", textAlign: "right", borderRightWidth: 0 },
} as const

interface TablaVentanasPdfProps {
    documento: DocumentoCotizacion
}

interface FilaVentanaPdfProps {
    fila: FilaCotizacion
    mostrarMedidas: boolean
    mostrarValores: boolean
}

function FilaVentanaPdf({ fila, mostrarMedidas, mostrarValores }: FilaVentanaPdfProps) {
    const especificaciones = fila.especificaciones.join(" · ")
    return (
        // wrap={false}: una ventana nunca queda partida entre dos páginas.
        <View style={estilosBase.filaTabla} wrap={false}>
            <Text style={[estilosBase.celda, COLUMNAS.nombre]}>{fila.nombre}</Text>
            <View style={[estilosBase.celda, COLUMNAS.tipo]}>
                <Text>{fila.tipo}</Text>
                {especificaciones && <Text style={{ fontSize: 8, marginTop: 2 }}>{especificaciones}</Text>}
            </View>
            {mostrarMedidas && (
                <>
                    <Text style={[estilosBase.celda, COLUMNAS.medida]}>{fila.ancho}</Text>
                    <Text style={[estilosBase.celda, COLUMNAS.medida]}>{fila.alto}</Text>
                    <Text style={[estilosBase.celda, COLUMNAS.area]}>{formatCount(fila.area ?? undefined, 2)}</Text>
                </>
            )}
            {mostrarValores && (
                <Text style={[estilosBase.celda, COLUMNAS.valor]}>{formatCurrency(fila.valor ?? undefined)}</Text>
            )}
        </View>
    )
}

export function TablaVentanasPdf({ documento }: TablaVentanasPdfProps) {
    const { mostrarMedidas, mostrarValores } = documento
    return (
        <View>
            {/* fixed: el encabezado se repite en cada página que ocupe la tabla. */}
            <View style={[estilosBase.filaTabla, estilosBase.encabezadoTabla]} fixed>
                <Text style={[estilosBase.celda, COLUMNAS.nombre]}>Nombre</Text>
                <Text style={[estilosBase.celda, COLUMNAS.tipo]}>Tipo</Text>
                {mostrarMedidas && (
                    <>
                        <Text style={[estilosBase.celda, COLUMNAS.medida]}>Ancho (mm)</Text>
                        <Text style={[estilosBase.celda, COLUMNAS.medida]}>Alto (mm)</Text>
                        <Text style={[estilosBase.celda, COLUMNAS.area]}>Área (m²)</Text>
                    </>
                )}
                {mostrarValores && <Text style={[estilosBase.celda, COLUMNAS.valor]}>Valor</Text>}
            </View>
            {documento.filas.map((fila) => (
                <FilaVentanaPdf key={fila.id} fila={fila} mostrarMedidas={mostrarMedidas} mostrarValores={mostrarValores} />
            ))}
            {mostrarValores && (
                <View style={[estilosBase.filaTabla, estilosBase.encabezadoTabla]} wrap={false}>
                    <Text style={[estilosBase.celda, { flex: 1, textAlign: "right" }]}>TOTAL</Text>
                    <Text style={[estilosBase.celda, COLUMNAS.valor]}>{formatCurrency(documento.total ?? undefined)}</Text>
                </View>
            )}
        </View>
    )
}
