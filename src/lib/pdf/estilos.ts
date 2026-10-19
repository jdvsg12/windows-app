import type { Styles } from "@react-pdf/renderer"

import { PAPER } from "../design/tokens"

export const FUENTE_PDF = "Geist"

// Medidas en puntos (1 pt = 1/72 in): A4 mide 595 × 842 pt.
// Sin lineHeight: en la página, react-pdf 4.9 deja de dibujar los textos con render (el número de
// página), y en un contenedor lo aplica doble. El interlineado por defecto se lee bien.
export const estilosBase = {
    pagina: {
        backgroundColor: PAPER.fondo,
        color: PAPER.tinta,
        fontFamily: FUENTE_PDF,
        fontSize: 10,
        paddingTop: 40,
        paddingBottom: 56,
        paddingHorizontal: 40,
    },
    titulo: {
        fontSize: 16,
        fontWeight: 700,
        textAlign: "center",
        textDecoration: "underline",
        marginBottom: 16,
    },
    subtitulo: {
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 6,
    },
    negrita: {
        fontWeight: 700,
    },
    // Cada fila lleva sus propios bordes: un borde en la tabla entera se estira hasta el pie de cada página.
    filaTabla: {
        flexDirection: "row",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: PAPER.regla,
    },
    encabezadoTabla: {
        backgroundColor: PAPER.sombreado,
        fontWeight: 700,
        borderTopWidth: 1,
    },
    celda: {
        padding: 4,
        borderRightWidth: 1,
        borderColor: PAPER.regla,
    },
    numeroPagina: {
        position: "absolute",
        bottom: 24,
        right: 40,
        fontSize: 8,
    },
} satisfies Styles
