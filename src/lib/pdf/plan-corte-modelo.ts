import { format } from "date-fns"
import { es } from "date-fns/locale"

import { LONGITUD_BARRA } from "../calculo/comun"
import { calcularMetricasVidrio } from "../calculo/vidrio"
import { etiquetaPieza, obtenerTipoHoja } from "../design/piezas"
import type {
    DocumentoPlanCorte,
    LaminaPlanCorte,
    LaminaVidrio,
    OptimizacionPerfil,
    PerfilPlanCorte,
    PiezaListaMaestra,
    TotalesPlanCorte,
} from "../types"

export interface EntradaDocumentoPlanCorte {
    proyecto: string
    laminas: readonly LaminaVidrio[]
    perfiles: Readonly<Record<string, OptimizacionPerfil>>
    hoy: Date
}

// Con varios colores las claves llegan como "Negro · 8025 - Cabezal" (fusionarPerfilesPorColor).
const SEPARADOR_COLOR = " · "

function armarLamina(lamina: LaminaVidrio): LaminaPlanCorte {
    return {
        numero: lamina.numero,
        grupo: lamina.grupo ?? null,
        ancho: lamina.anchoLamina,
        alto: lamina.altoLamina,
        deInventario: lamina.restoId !== undefined,
        // El empaquetador ya trae ancho y alto girados cuando rotado es true.
        piezas: lamina.vidrios.map(({ vidrio, x, y, rotado }) => ({
            etiqueta: etiquetaPieza(vidrio),
            hoja: obtenerTipoHoja(vidrio),
            descripcion: `${vidrio.ventana} - ${vidrio.tipo}`,
            x,
            y,
            ancho: vidrio.ancho,
            alto: vidrio.alto,
            rotada: rotado,
        })),
        restos: lamina.restos.map(({ tipo, x, y, ancho, alto }) => ({ tipo, x, y, ancho, alto })),
        areaUsada: lamina.areaUsada,
        areaSobrante: lamina.areaSobrante,
    }
}

function armarPerfiles(perfiles: Readonly<Record<string, OptimizacionPerfil>>): PerfilPlanCorte[] {
    return Object.entries(perfiles).map(([clave, { barras, metrosUsados }]) => {
        const separador = clave.indexOf(SEPARADOR_COLOR)
        return {
            color: separador === -1 ? null : clave.slice(0, separador),
            perfil: separador === -1 ? clave : clave.slice(separador + SEPARADOR_COLOR.length),
            barras: barras.map((cortes) => ({
                cortes,
                sobrante: Math.max(0, LONGITUD_BARRA - cortes.reduce((total, corte) => total + corte, 0)),
            })),
            metrosUsados,
        }
    })
}

// Ordenadas por ventana y hoja: "V2-F1" antes de "V2-M1" y "V10" después de "V9".
function armarListaMaestra(laminas: readonly LaminaPlanCorte[]): PiezaListaMaestra[] {
    return laminas
        .flatMap((lamina) =>
            lamina.piezas.map(({ etiqueta, descripcion, ancho, alto }) => ({
                etiqueta,
                descripcion,
                ancho,
                alto,
                grupo: lamina.grupo,
                lamina: lamina.numero,
            })),
        )
        .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es", { numeric: true }))
}

function armarTotales(
    laminasVidrio: readonly LaminaVidrio[],
    laminas: readonly LaminaPlanCorte[],
    perfiles: readonly PerfilPlanCorte[],
): TotalesPlanCorte {
    const metricas = calcularMetricasVidrio(laminasVidrio)

    const laminasPorGrupo = new Map<string | null, { laminas: number; deInventario: number }>()
    for (const lamina of laminas) {
        const actual = laminasPorGrupo.get(lamina.grupo) ?? { laminas: 0, deInventario: 0 }
        laminasPorGrupo.set(lamina.grupo, {
            laminas: actual.laminas + 1,
            deInventario: actual.deInventario + (lamina.deInventario ? 1 : 0),
        })
    }

    const barrasPorColor = new Map<string | null, { barras: number; metros: number }>()
    for (const perfil of perfiles) {
        const actual = barrasPorColor.get(perfil.color) ?? { barras: 0, metros: 0 }
        barrasPorColor.set(perfil.color, {
            barras: actual.barras + perfil.barras.length,
            metros: actual.metros + perfil.metrosUsados,
        })
    }

    return {
        laminasPorGrupo: [...laminasPorGrupo].map(([grupo, valores]) => ({ grupo, ...valores })),
        piezas: metricas.piezas,
        areaNetaM2: metricas.areaNetaM2,
        bordeadoM: metricas.bordeadoM,
        cantos: metricas.cantos,
        mermaPct: metricas.mermaPct,
        barrasPorColor: [...barrasPorColor].map(([color, valores]) => ({ color, ...valores })),
    }
}

export function armarDocumentoPlanCorte({ proyecto, laminas, perfiles, hoy }: EntradaDocumentoPlanCorte): DocumentoPlanCorte {
    const laminasPlan = laminas.map(armarLamina)
    const perfilesPlan = armarPerfiles(perfiles)
    return {
        proyecto,
        fecha: format(hoy, "PPP", { locale: es }),
        laminas: laminasPlan,
        perfiles: perfilesPlan,
        listaMaestra: armarListaMaestra(laminasPlan),
        totales: armarTotales(laminas, laminasPlan, perfilesPlan),
    }
}
