import { Document, Page, Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import { formatArea } from "@/lib/format"
import { estilosBase } from "@/lib/pdf/estilos"
import type { DocumentoPlanCorte, LaminaPlanCorte } from "@/lib/types"
import { COLORES_PLAN_CORTE, DibujoLaminaPdf } from "./DibujoLaminaPdf"

// A4 en puntos. El dibujo tiene que caber en una sola página: si se pasa, la leyenda cae a
// otra. Se resta el margen de estilosBase.pagina (40 a los lados, 40 arriba y 56 abajo) y
// ~110 pt de encabezado y leyenda.
const A4 = { corto: 595, largo: 842 }
const MARGEN_LATERAL = 80
const ALTO_RESERVADO = 40 + 56 + 110

const LEYENDA = [
    { color: COLORES_PLAN_CORTE.fija, texto: "Hoja fija (F)" },
    { color: COLORES_PLAN_CORTE.movil, texto: "Hoja móvil (M)" },
    { color: COLORES_PLAN_CORTE.resto, texto: "Resto reutilizable (R)" },
    { color: COLORES_PLAN_CORTE.desperdicio, texto: "Desperdicio (S)" },
]

interface PlanCortePdfProps {
    documento: DocumentoPlanCorte
}

interface PaginaLaminaPdfProps {
    documento: DocumentoPlanCorte
    lamina: LaminaPlanCorte
}

function PaginaLaminaPdf({ documento, lamina }: PaginaLaminaPdfProps) {
    const horizontal = lamina.ancho >= lamina.alto
    const anchoPagina = horizontal ? A4.largo : A4.corto
    const altoPagina = horizontal ? A4.corto : A4.largo
    const detalle = [
        lamina.grupo,
        `${lamina.ancho} × ${lamina.alto} mm`,
        `${lamina.piezas.length} ${lamina.piezas.length === 1 ? "pieza" : "piezas"}`,
        `usado ${formatArea(lamina.areaUsada)}`,
        `sobrante ${formatArea(lamina.areaSobrante)}`,
    ].filter(Boolean)

    return (
        <Page size="A4" orientation={horizontal ? "landscape" : "portrait"} style={estilosBase.pagina}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderColor: PAPER.tinta, paddingBottom: 6, marginBottom: 10 }}>
                <Text style={estilosBase.negrita}>Plan de corte de vidrio · {documento.proyecto}</Text>
                <Text>{documento.fecha}</Text>
            </View>
            <Text style={estilosBase.subtitulo}>
                Lámina {lamina.numero} de {documento.laminas.length}
                {lamina.deInventario ? " · resto del inventario, no se compra" : ""}
            </Text>
            <Text style={{ marginBottom: 12 }}>{detalle.join(" · ")}</Text>

            <View style={{ alignItems: "center" }}>
                <DibujoLaminaPdf lamina={lamina} anchoMaximo={anchoPagina - MARGEN_LATERAL} altoMaximo={altoPagina - ALTO_RESERVADO} />
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
                {LEYENDA.map(({ color, texto }) => (
                    <View key={texto} style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
                        <View style={{ width: 10, height: 10, backgroundColor: color.fondo, borderWidth: 1, borderColor: color.borde, marginRight: 4 }} />
                        <Text style={{ fontSize: 8 }}>{texto}</Text>
                    </View>
                ))}
            </View>

            <Text style={estilosBase.numeroPagina} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
        </Page>
    )
}

export function PlanCortePdf({ documento }: PlanCortePdfProps) {
    return (
        <Document title={`Plan de corte ${documento.proyecto}`} language="es">
            {documento.laminas.map((lamina) => (
                <PaginaLaminaPdf key={lamina.numero} documento={documento} lamina={lamina} />
            ))}
        </Document>
    )
}

// Como elemento JSX, react-pdf lo acepta como raíz del documento en pdf().
export const crearPlanCortePdf = (documento: DocumentoPlanCorte) => <PlanCortePdf documento={documento} />
