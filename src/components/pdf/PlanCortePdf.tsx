import { Document, Page, Text, View } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"
import { formatArea } from "@/lib/format"
import { estilosBase } from "@/lib/pdf/estilos"
import type { DocumentoPlanCorte, LaminaPlanCorte } from "@/lib/types"
import { COLORES_PLAN_CORTE, DibujoLaminaPdf } from "./DibujoLaminaPdf"
import { ListaMaestraPdf } from "./ListaMaestraPdf"
import { PerfilesPdf } from "./PerfilesPdf"
import { TablaPdf, type ColumnaPdf } from "./TablaPdf"

// A4 en puntos. El dibujo y la tabla de su lámina deben caber en una página: se resta el margen
// de estilosBase.pagina (40 arriba, 56 abajo, 40 a los lados), ~110 pt de encabezado y leyenda,
// y el alto de la tabla. Si la tabla es muy larga, el dibujo no baja de DIBUJO_MINIMO y la tabla
// sigue en la página siguiente.
const A4 = { corto: 595, largo: 842 }
const MARGEN_LATERAL = 80
const ALTO_RESERVADO = 40 + 56 + 110
// Letra de 8 pt + 4 pt de relleno arriba y abajo + borde (medido en el PDF generado).
const ALTO_FILA_TABLA = 19
const DIBUJO_MINIMO = 240

const LEYENDA = [
    { color: COLORES_PLAN_CORTE.fija, texto: "Hoja fija (F)" },
    { color: COLORES_PLAN_CORTE.movil, texto: "Hoja móvil (M)" },
    { color: COLORES_PLAN_CORTE.resto, texto: "Resto reutilizable (R)" },
    { color: COLORES_PLAN_CORTE.desperdicio, texto: "Desperdicio (S)" },
]

const COLUMNAS_PIEZAS: readonly ColumnaPdf[] = [
    { titulo: "#", estilo: { width: "6%", textAlign: "right" } },
    { titulo: "Código", estilo: { width: "12%" } },
    { titulo: "Ventana - hoja", estilo: { flex: 1 } },
    { titulo: "Ancho × alto (mm)", estilo: { width: "18%" } },
    { titulo: "Posición x, y (mm)", estilo: { width: "18%" } },
    { titulo: "Girada", estilo: { width: "9%" } },
]

interface PlanCortePdfProps {
    documento: DocumentoPlanCorte
}

interface EncabezadoPdfProps {
    documento: DocumentoPlanCorte
}

interface PaginaLaminaPdfProps {
    documento: DocumentoPlanCorte
    lamina: LaminaPlanCorte
}

function EncabezadoPdf({ documento }: EncabezadoPdfProps) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderColor: PAPER.tinta, paddingBottom: 6, marginBottom: 10 }} fixed>
            <Text style={estilosBase.negrita}>Plan de corte · {documento.proyecto}</Text>
            <Text>{documento.fecha}</Text>
        </View>
    )
}

function NumeroPaginaPdf() {
    return <Text style={estilosBase.numeroPagina} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
}

function PaginaLaminaPdf({ documento, lamina }: PaginaLaminaPdfProps) {
    const horizontal = lamina.ancho >= lamina.alto
    const anchoPagina = horizontal ? A4.largo : A4.corto
    const altoPagina = horizontal ? A4.corto : A4.largo
    // + el margen de la leyenda, que va entre el dibujo y la tabla.
    const altoTabla = (lamina.piezas.length + 1) * ALTO_FILA_TABLA + 30
    const altoDibujo = Math.max(DIBUJO_MINIMO, altoPagina - ALTO_RESERVADO - altoTabla)
    const detalle = [
        lamina.grupo,
        `${lamina.ancho} × ${lamina.alto} mm`,
        `${lamina.piezas.length} ${lamina.piezas.length === 1 ? "pieza" : "piezas"}`,
        `usado ${formatArea(lamina.areaUsada)}`,
        `sobrante ${formatArea(lamina.areaSobrante)}`,
    ].filter(Boolean)
    const filas = lamina.piezas.map((pieza, indice) => [
        String(indice + 1),
        pieza.etiqueta,
        pieza.descripcion,
        `${Math.round(pieza.ancho)} × ${Math.round(pieza.alto)}`,
        `${Math.round(pieza.x)}, ${Math.round(pieza.y)}`,
        pieza.rotada ? "Sí" : "",
    ])

    return (
        <Page size="A4" orientation={horizontal ? "landscape" : "portrait"} style={estilosBase.pagina}>
            <EncabezadoPdf documento={documento} />
            <Text style={estilosBase.subtitulo}>
                Lámina {lamina.numero} de {documento.laminas.length}
                {lamina.deInventario ? " · resto del inventario, no se compra" : ""}
            </Text>
            <Text style={{ marginBottom: 12 }}>{detalle.join(" · ")}</Text>

            <View style={{ alignItems: "center" }}>
                <DibujoLaminaPdf lamina={lamina} anchoMaximo={anchoPagina - MARGEN_LATERAL} altoMaximo={altoDibujo} />
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}>
                {LEYENDA.map(({ color, texto }) => (
                    <View key={texto} style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
                        <View style={{ width: 10, height: 10, backgroundColor: color.fondo, borderWidth: 1, borderColor: color.borde, marginRight: 4 }} />
                        <Text style={{ fontSize: 8 }}>{texto}</Text>
                    </View>
                ))}
            </View>

            <TablaPdf columnas={COLUMNAS_PIEZAS} filas={filas} />
            <NumeroPaginaPdf />
        </Page>
    )
}

export function PlanCortePdf({ documento }: PlanCortePdfProps) {
    return (
        <Document title={`Plan de corte ${documento.proyecto}`} language="es">
            {documento.laminas.map((lamina) => (
                <PaginaLaminaPdf key={lamina.numero} documento={documento} lamina={lamina} />
            ))}
            {documento.perfiles.length > 0 && (
                <Page size="A4" style={estilosBase.pagina}>
                    <EncabezadoPdf documento={documento} />
                    <PerfilesPdf perfiles={documento.perfiles} />
                    <NumeroPaginaPdf />
                </Page>
            )}
            <Page size="A4" style={estilosBase.pagina}>
                <EncabezadoPdf documento={documento} />
                <ListaMaestraPdf documento={documento} />
                <NumeroPaginaPdf />
            </Page>
        </Document>
    )
}

// Como elemento JSX, react-pdf lo acepta como raíz del documento en pdf().
export const crearPlanCortePdf = (documento: DocumentoPlanCorte) => <PlanCortePdf documento={documento} />
