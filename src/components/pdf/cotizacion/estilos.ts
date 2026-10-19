import type { Styles } from "@react-pdf/renderer"

import { PAPER } from "@/lib/design/tokens"

// Estilos de la cotización (diseño de referencia: docs/diseno-cotizacion.html). Ancho útil: 515 pt.
export const estilosCotizacion = {
    etiqueta: {
        fontSize: 7,
        fontWeight: 700,
        color: PAPER.apagado,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    tituloSeccion: {
        fontSize: 8.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingBottom: 3,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderColor: PAPER.bordePanel,
    },
    panel: {
        backgroundColor: PAPER.panel,
        borderWidth: 1,
        borderColor: PAPER.bordePanel,
        padding: 8,
    },
    tarjeta: {
        backgroundColor: PAPER.fondo,
        borderWidth: 1,
        borderColor: PAPER.bordePanel,
        padding: 6,
    },
    textoApagado: {
        color: PAPER.apagado,
    },
    seccion: {
        marginBottom: 14,
    },
    numero: {
        fontWeight: 700,
    },
} satisfies Styles
