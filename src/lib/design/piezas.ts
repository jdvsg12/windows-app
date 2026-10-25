import type { ReferenciaPerfilPuerta } from "@/lib/calculo/motor-puerta-alumina"
import type { VidrioCorte } from "@/lib/types"

// Visual identity of pieces. Class names are written out in full so Tailwind can see them.
// Color is never the only cue: profiles carry a monogram and glass panes carry a number and a letter.

export interface EstiloPieza {
    codigo: string
    clases: string
}

export const ESTILOS_PERFIL = {
    Cabezal: { codigo: "CB", clases: "bg-piece-cabezal border-piece-cabezal-border text-piece-cabezal-fg" },
    Sillar: { codigo: "SI", clases: "bg-piece-sillar border-piece-sillar-border text-piece-sillar-fg" },
    "Jamba Izquierda": {
        codigo: "JI",
        clases: "bg-piece-jamba-izq border-piece-jamba-izq-border text-piece-jamba-izq-fg",
    },
    "Jamba Derecha": {
        codigo: "JD",
        clases: "bg-piece-jamba-der border-piece-jamba-der-border text-piece-jamba-der-fg",
    },
    Enganche: { codigo: "EN", clases: "bg-piece-enganche border-piece-enganche-border text-piece-enganche-fg" },
    Traslape: { codigo: "TR", clases: "bg-piece-traslape border-piece-traslape-border text-piece-traslape-fg" },
    "Horizontal Superior": {
        codigo: "HS",
        clases: "bg-piece-horiz-sup border-piece-horiz-sup-border text-piece-horiz-sup-fg",
    },
    "Horizontal Inferior": {
        codigo: "HI",
        clases: "bg-piece-horiz-inf border-piece-horiz-inf-border text-piece-horiz-inf-fg",
    },
} as const satisfies Record<string, EstiloPieza>

export type PerfilTipo = keyof typeof ESTILOS_PERFIL

const ESTILO_PERFIL_DESCONOCIDO: EstiloPieza = {
    codigo: "··",
    clases: "bg-muted border-border text-muted-foreground",
}

const esPerfilTipo = (valor: string): valor is PerfilTipo => valor in ESTILOS_PERFIL

// Optimization keys look like "8025 - Cabezal" (system - profile), or just "Cabezal".
export function obtenerEstiloPerfil(clave: string): EstiloPieza {
    const tipo = clave.split(" - ").at(-1) ?? clave
    return esPerfilTipo(tipo) ? ESTILOS_PERFIL[tipo] : ESTILO_PERFIL_DESCONOCIDO
}

// Perfiles de la puerta Alumina: reutilizan los colores de pieza de las ventanas por su función
// (marco, hoja, pisavidrio); el monograma es la referencia, así el color nunca es la única pista.
export const ESTILOS_PERFIL_PUERTA = {
    "U-57": { codigo: "U57", clases: ESTILOS_PERFIL.Cabezal.clases },
    "VP-1102": { codigo: "VP", clases: ESTILOS_PERFIL["Horizontal Superior"].clases },
    "PISAVIDRIO-CUADRADO": { codigo: "PV", clases: ESTILOS_PERFIL.Traslape.clases },
} as const satisfies Record<ReferenciaPerfilPuerta, EstiloPieza>

export type HojaTipo = "fija" | "movil"

export const ESTILOS_HOJA: Record<HojaTipo, EstiloPieza & { nombre: string }> = {
    fija: { codigo: "F", nombre: "Fija", clases: "bg-hoja-fija border-hoja-fija-border text-hoja-fija-fg" },
    movil: { codigo: "M", nombre: "Móvil", clases: "bg-hoja-movil border-hoja-movil-border text-hoja-movil-fg" },
}

// Pieces from the engine carry a structured leaf; the free-text tipo ("Hoja Fija (Parche)") is
// only a fallback for pieces built elsewhere: anything not explicitly fixed is a movable leaf.
export const obtenerTipoHoja = (vidrio: Pick<VidrioCorte, "hoja" | "tipo">): HojaTipo =>
    vidrio.hoja?.tipo ?? (/fija/i.test(vidrio.tipo) ? "fija" : "movil")

// Short label for a glass piece: its code ("V3-M1") when it has one, else the window name.
export const etiquetaPieza = (vidrio: Pick<VidrioCorte, "codigo" | "ventana">): string => vidrio.codigo ?? vidrio.ventana
