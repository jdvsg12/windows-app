import { Text, View } from "@react-pdf/renderer"

import { formatArea, formatCount, formatMeters, formatPercent } from "@/lib/format"
import { estilosBase } from "@/lib/pdf/estilos"
import type { DocumentoPlanCorte } from "@/lib/types"
import { TablaPdf, type ColumnaPdf } from "./TablaPdf"

const COLUMNAS: readonly ColumnaPdf[] = [
    { titulo: "Código", estilo: { width: "12%" } },
    { titulo: "Ventana - hoja", estilo: { flex: 1 } },
    { titulo: "Ancho × alto (mm)", estilo: { width: "18%" } },
    { titulo: "Vidrio", estilo: { width: "20%" } },
    { titulo: "Lámina", estilo: { width: "10%", textAlign: "right" } },
]

interface ListaMaestraPdfProps {
    documento: DocumentoPlanCorte
}

interface FilaTotalProps {
    etiqueta: string
    valor: string
}

function FilaTotal({ etiqueta, valor }: FilaTotalProps) {
    return (
        <View style={{ flexDirection: "row", marginBottom: 2 }}>
            <Text style={{ width: 180 }}>{etiqueta}</Text>
            <Text style={estilosBase.negrita}>{valor}</Text>
        </View>
    )
}

export function ListaMaestraPdf({ documento }: ListaMaestraPdfProps) {
    const { totales } = documento
    const filas = documento.listaMaestra.map((pieza) => [
        pieza.etiqueta,
        pieza.descripcion,
        `${Math.round(pieza.ancho)} × ${Math.round(pieza.alto)}`,
        pieza.grupo ?? "—",
        String(pieza.lamina),
    ])

    return (
        <View>
            <Text style={estilosBase.subtitulo}>Lista maestra de piezas de vidrio</Text>
            <TablaPdf columnas={COLUMNAS} filas={filas} />

            <View style={{ marginTop: 16 }} wrap={false}>
                <Text style={estilosBase.subtitulo}>Totales</Text>
                {totales.laminasPorGrupo.map(({ grupo, laminas, deInventario }) => (
                    <FilaTotal
                        key={grupo ?? "vidrio"}
                        etiqueta={`Láminas${grupo ? ` ${grupo}` : ""}`}
                        valor={`${laminas}${deInventario > 0 ? ` (${deInventario} del inventario de restos)` : ""}`}
                    />
                ))}
                <FilaTotal etiqueta="Piezas de vidrio" valor={String(totales.piezas)} />
                <FilaTotal etiqueta="Área neta" valor={formatArea(totales.areaNetaM2, 3)} />
                <FilaTotal etiqueta="Bordeado" valor={formatMeters(totales.bordeadoM, 3)} />
                <FilaTotal etiqueta="Cantos" valor={formatCount(totales.cantos, 0)} />
                <FilaTotal
                    etiqueta="Merma (sin la última lámina de cada tipo)"
                    valor={totales.mermaPct === null ? "—" : formatPercent(totales.mermaPct)}
                />
                {totales.barrasPorColor.map(({ color, barras, metros }) => (
                    <FilaTotal
                        key={color ?? "perfiles"}
                        etiqueta={`Barras de perfil${color ? ` ${color}` : ""}`}
                        valor={`${barras} · ${formatMeters(metros)} usados`}
                    />
                ))}
            </View>
        </View>
    )
}
