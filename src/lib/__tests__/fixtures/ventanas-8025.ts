import type { TipoVentana, Ventana } from "@/lib/types"

export const TIPOS_8025: readonly TipoVentana[] = ["2hojas", "2hojas_mixto", "3hojas", "4hojas", "5hojas", "6hojas"]

export interface MedidaFixture {
    clave: string
    ancho: number
    alto: number
}

// `fueraDeBarra` has a head profile longer than the 6 m bar; `extrema` is just under it.
export const MEDIDAS: readonly MedidaFixture[] = [
    { clave: "pequena", ancho: 900, alto: 800 },
    { clave: "tipica", ancho: 2000, alto: 1400 },
    { clave: "grande", ancho: 3000, alto: 2100 },
    { clave: "extrema", ancho: 5900, alto: 2400 },
    { clave: "fueraDeBarra", ancho: 6300, alto: 1500 },
]

// Always explicit: without `sistema` the engine silently falls back to "5020".
const crearVentana = (tipo: TipoVentana, medida: MedidaFixture, indice: number): Ventana => ({
    id: `fixture-${indice}`,
    nombre: `${tipo}-${medida.clave}`,
    ancho: medida.ancho,
    alto: medida.alto,
    tipoVentana: tipo,
    sistema: "8025",
})

export const VENTANAS_8025: readonly Ventana[] = TIPOS_8025.flatMap((tipo, i) =>
    MEDIDAS.map((medida, j) => crearVentana(tipo, medida, i * MEDIDAS.length + j))
)

// Glass sheet checks skip the two oversized windows: a pane larger than the sheet is a known quirk (see the test).
export const VENTANAS_CON_VIDRIO_QUE_CABE: readonly Ventana[] = VENTANAS_8025.filter(
    (ventana) => ventana.ancho <= 3000
)
