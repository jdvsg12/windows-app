// Material that cannot be mixed: profiles of different aluminum colors never share a 6 m bar, and
// glass of different color or thickness never shares a sheet. These helpers split a project into
// those groups and merge per-group results back for display. Shared by costeo and the UI, so the
// bars and sheets the workshop sees are exactly the ones the quote charges for.
//
// Pure: no storage, no module state.
import {
    COLOR_ALUMINIO_POR_DEFECTO,
    VIDRIO_POR_DEFECTO,
    claveVidrio,
    getCalibreVidrioLabel,
    getColorAluminioLabel,
    getColorVidrioLabel,
    type CalibreVidrio,
    type ClaveVidrio,
    type ColorAluminio,
    type ColorVidrio,
    type LaminaVidrio,
    type OptimizacionPerfil,
    type Ventana,
    type VidrioCorte,
} from "@/lib/types"

export interface GrupoColorAluminio {
    color: ColorAluminio
    ventanas: Ventana[]
}

export interface GrupoTipoVidrio {
    clave: ClaveVidrio
    color: ColorVidrio
    calibre: CalibreVidrio
    etiqueta: string
    ventanas: Ventana[]
}

function agrupar<K, G>(ventanas: readonly Ventana[], clave: (v: Ventana) => K, crear: (k: K, v: Ventana) => G & { ventanas: Ventana[] }) {
    const grupos = new Map<K, G & { ventanas: Ventana[] }>()
    for (const ventana of ventanas) {
        const k = clave(ventana)
        const grupo = grupos.get(k)
        if (grupo) grupo.ventanas.push(ventana)
        else grupos.set(k, crear(k, ventana))
    }
    return [...grupos.values()]
}

export function agruparPorColorAluminio(ventanas: readonly Ventana[]): GrupoColorAluminio[] {
    return agrupar(
        ventanas,
        (v) => v.colorAluminio ?? COLOR_ALUMINIO_POR_DEFECTO,
        (color, v) => ({ color, ventanas: [v] })
    )
}

export function agruparPorTipoVidrio(ventanas: readonly Ventana[]): GrupoTipoVidrio[] {
    return agrupar(
        ventanas,
        (v) =>
            claveVidrio(v.colorVidrio ?? VIDRIO_POR_DEFECTO.colorVidrio, v.calibreVidrio ?? VIDRIO_POR_DEFECTO.calibreVidrio),
        (clave, v) => {
            const color = v.colorVidrio ?? VIDRIO_POR_DEFECTO.colorVidrio
            const calibre = v.calibreVidrio ?? VIDRIO_POR_DEFECTO.calibreVidrio
            return {
                clave,
                color,
                calibre,
                etiqueta: `${getColorVidrioLabel(color)} ${getCalibreVidrioLabel(calibre)}`,
                ventanas: [v],
            }
        }
    )
}

// With a single color the keys stay as the engine produces them ("8025 - Cabezal"); with several,
// they are prefixed with the color. The profile type stays the last " - " segment either way.
export function fusionarPerfilesPorColor(
    resultados: ReadonlyArray<{ color: ColorAluminio; optimizacion: Record<string, OptimizacionPerfil> }>
): Record<string, OptimizacionPerfil> {
    if (resultados.length === 1) return resultados[0].optimizacion
    return Object.fromEntries(
        resultados.flatMap(({ color, optimizacion }) =>
            Object.entries(optimizacion).map(([clave, valor]) => [`${getColorAluminioLabel(color)} · ${clave}`, valor])
        )
    )
}

// Sheets are renumbered across groups so "Lámina N" stays unique, and every sheet and piece
// carries its glass type label.
export function fusionarLaminasPorTipo(
    resultados: ReadonlyArray<{ etiqueta: string; laminas: LaminaVidrio[] }>
): LaminaVidrio[] {
    let numero = 0
    return resultados.flatMap(({ etiqueta, laminas }) =>
        laminas.map((lamina) => ({
            ...lamina,
            numero: ++numero,
            grupo: etiqueta,
            vidrios: lamina.vidrios.map((item) => ({ ...item, vidrio: { ...item.vidrio, grupo: etiqueta } })),
        }))
    )
}

export const etiquetarVidrios = (vidrios: readonly VidrioCorte[], etiqueta: string): VidrioCorte[] =>
    vidrios.map((vidrio) => ({ ...vidrio, grupo: etiqueta }))
