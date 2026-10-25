// Motor puro de la puerta abatible Alumina, sistema europeo: marco U-57, hoja (bastidor) VP-1102
// con adaptador, pisavidrio cuadrado y un vidrio. Sin storage ni estado: los descuentos, el espesor
// de sierra y los tornillos de instalación llegan en `parametros` en cada llamada.
//
// Todas las medidas en mm. Las piezas con inglete se miden por la punta larga exterior.
import type { ParametrosPuertaAlumina } from "@/lib/types"
import { optimizarBarras, type ResultadoBarras } from "./barras"
import { LONGITUD_BARRA } from "./comun"

export const REFERENCIAS_PERFIL_PUERTA = ["U-57", "VP-1102", "PISAVIDRIO-CUADRADO"] as const
export type ReferenciaPerfilPuerta = (typeof REFERENCIAS_PERFIL_PUERTA)[number]

export type AnguloCorte = 45 | 90

export interface PiezaPuerta {
    referencia: ReferenciaPerfilPuerta
    pieza: string
    cantidad: number
    longitud: number
    // Ángulo en cada extremo: [superior o izquierdo, inferior o derecho].
    cortes: readonly [AnguloCorte, AnguloCorte]
}

export const ACCESORIOS_PUERTA = [
    "bisagraOmega",
    "tornilloBisagra",
    "cerraduraKL",
    "escuadraEnsamble",
    "anguloArme",
    "tornilloInstalacion",
] as const
export type AccesorioPuerta = (typeof ACCESORIOS_PUERTA)[number]
export type AccesoriosPuerta = Record<AccesorioPuerta, number>

export interface VanoPuerta {
    ancho: number
    alto: number
}

export interface DespiecePuerta {
    hoja: { ancho: number; alto: number }
    piezas: PiezaPuerta[]
    vidrio: { cantidad: number; ancho: number; alto: number; area: number }
    accesorios: AccesoriosPuerta
}

// Cantidades fijas por puerta; los tornillos de instalación salen de los parámetros.
const ACCESORIOS_FIJOS: Omit<AccesoriosPuerta, "tornilloInstalacion"> = {
    bisagraOmega: 4,
    tornilloBisagra: 32,
    cerraduraKL: 1,
    escuadraEnsamble: 4,
    anguloArme: 2,
}

export function calcularDespiecePuerta(vano: VanoPuerta, parametros: ParametrosPuertaAlumina): DespiecePuerta {
    const hoja = {
        ancho: vano.ancho - parametros.descuentoAnchoHoja,
        alto: vano.alto - parametros.descuentoAltoHoja,
    }
    const pisavidrio = {
        horizontal: hoja.ancho - parametros.descuentoPisavidrioHorizontal,
        vertical: hoja.alto - parametros.descuentoPisavidrioVertical,
    }
    const vidrio = {
        ancho: hoja.ancho - parametros.descuentoAnchoVidrio,
        alto: hoja.alto - parametros.descuentoAltoVidrio,
    }

    // El marco no lleva descuento: va a la medida del vano. Sus verticales llegan al piso a 90°.
    const piezas: PiezaPuerta[] = [
        { referencia: "U-57", pieza: "Marco horizontal superior", cantidad: 1, longitud: vano.ancho, cortes: [45, 45] },
        { referencia: "U-57", pieza: "Marco vertical izquierdo", cantidad: 1, longitud: vano.alto, cortes: [45, 90] },
        { referencia: "U-57", pieza: "Marco vertical derecho", cantidad: 1, longitud: vano.alto, cortes: [45, 90] },
        { referencia: "VP-1102", pieza: "Hoja horizontal superior", cantidad: 1, longitud: hoja.ancho, cortes: [45, 45] },
        { referencia: "VP-1102", pieza: "Hoja horizontal inferior", cantidad: 1, longitud: hoja.ancho, cortes: [45, 45] },
        { referencia: "VP-1102", pieza: "Hoja vertical izquierdo", cantidad: 1, longitud: hoja.alto, cortes: [45, 45] },
        { referencia: "VP-1102", pieza: "Hoja vertical derecho", cantidad: 1, longitud: hoja.alto, cortes: [45, 45] },
        { referencia: "PISAVIDRIO-CUADRADO", pieza: "Pisavidrio horizontal superior", cantidad: 1, longitud: pisavidrio.horizontal, cortes: [90, 90] },
        { referencia: "PISAVIDRIO-CUADRADO", pieza: "Pisavidrio horizontal inferior", cantidad: 1, longitud: pisavidrio.horizontal, cortes: [90, 90] },
        { referencia: "PISAVIDRIO-CUADRADO", pieza: "Pisavidrio vertical izquierdo", cantidad: 1, longitud: pisavidrio.vertical, cortes: [90, 90] },
        { referencia: "PISAVIDRIO-CUADRADO", pieza: "Pisavidrio vertical derecho", cantidad: 1, longitud: pisavidrio.vertical, cortes: [90, 90] },
    ]

    const invalidas = [
        ...piezas.map(({ pieza, longitud }) => ({ nombre: pieza, medida: longitud })),
        { nombre: "Vidrio ancho", medida: vidrio.ancho },
        { nombre: "Vidrio alto", medida: vidrio.alto },
    ].filter(({ medida }) => !(Number.isFinite(medida) && medida > 0))
    if (invalidas.length > 0) {
        const detalle = invalidas.map(({ nombre, medida }) => `${nombre} (${medida} mm)`).join(", ")
        throw new Error(`La puerta de ${vano.ancho} × ${vano.alto} mm da medidas no positivas: ${detalle}`)
    }

    return {
        hoja,
        piezas,
        vidrio: { cantidad: 1, ...vidrio, area: (vidrio.ancho * vidrio.alto) / 1_000_000 },
        accesorios: { ...ACCESORIOS_FIJOS, tornilloInstalacion: parametros.tornillosInstalacion },
    }
}

// Barras por referencia para una o varias puertas (las de un mismo color comparten barras).
export function optimizarPerfilesPuertas(
    despieces: readonly DespiecePuerta[],
    parametros: Pick<ParametrosPuertaAlumina, "espesorSierra">,
): Record<ReferenciaPerfilPuerta, ResultadoBarras> {
    const opciones = { longitudBarra: LONGITUD_BARRA * 1000, espesorSierra: parametros.espesorSierra }
    const longitudesDe = (referencia: ReferenciaPerfilPuerta) =>
        despieces.flatMap(({ piezas }) =>
            piezas.filter((pieza) => pieza.referencia === referencia).flatMap((pieza) => Array<number>(pieza.cantidad).fill(pieza.longitud)),
        )
    return Object.fromEntries(
        REFERENCIAS_PERFIL_PUERTA.map((referencia) => [referencia, optimizarBarras(longitudesDe(referencia), opciones)]),
    ) as Record<ReferenciaPerfilPuerta, ResultadoBarras>
}

export function sumarAccesoriosPuertas(despieces: readonly DespiecePuerta[]): AccesoriosPuerta {
    return Object.fromEntries(
        ACCESORIOS_PUERTA.map((clave) => [clave, despieces.reduce((suma, despiece) => suma + despiece.accesorios[clave], 0)]),
    ) as AccesoriosPuerta
}
