import type { AccesoriosVentana, Riel } from "./types"

interface ConfiguracionAccesorios {
  hojas: number
  fijas: number
  moviles: number
  rodachinas: number
  cerraduras: number
  rieles: Riel[]
  enganches: number
  traslapes: number
  tieneFijaParche: boolean
  alturaEnganche: number
  alturaTraslape: number
}

const CONFIGURACIONES: Record<number, ConfiguracionAccesorios> = {
  2: {
    hojas: 2,
    fijas: 0,
    moviles: 2,
    rodachinas: 4,
    cerraduras: 1,
    rieles: [{ vias: 2, cantidad: 1 }],
    enganches: 2,
    traslapes: 2,
    tieneFijaParche: false,
    alturaEnganche: 25,
    alturaTraslape: 25,
  },
  3: {
    hojas: 3,
    fijas: 1,
    moviles: 2,
    rodachinas: 4,
    cerraduras: 2,
    rieles: [{ vias: 2, cantidad: 1 }],
    enganches: 2,
    traslapes: 2,
    tieneFijaParche: true,
    alturaEnganche: 5,
    alturaTraslape: 5,
  },
  4: {
    hojas: 4,
    fijas: 1,
    moviles: 3,
    rodachinas: 6,
    cerraduras: 1,
    rieles: [{ vias: 3, cantidad: 1 }],
    enganches: 3,
    traslapes: 3,
    tieneFijaParche: true,
    alturaEnganche: 5,
    alturaTraslape: 5,
  },
  5: {
    hojas: 5,
    fijas: 1,
    moviles: 4,
    rodachinas: 8,
    cerraduras: 1,
    rieles: [
      { vias: 2, cantidad: 1 },
      { vias: 2, cantidad: 1 },
    ],
    enganches: 4,
    traslapes: 4,
    tieneFijaParche: true,
    alturaEnganche: 5,
    alturaTraslape: 5,
  },
  6: {
    hojas: 6,
    fijas: 1,
    moviles: 5,
    rodachinas: 10,
    cerraduras: 2,
    rieles: [
      { vias: 3, cantidad: 1 },
      { vias: 3, cantidad: 1 },
    ],
    enganches: 5,
    traslapes: 5,
    tieneFijaParche: true,
    alturaEnganche: 5,
    alturaTraslape: 5,
  },
}

export function calcularAccesorios(hojas: number): AccesoriosVentana {
  const config = CONFIGURACIONES[hojas] || CONFIGURACIONES[2]

  const rielesStr = config.rieles
    .map((r) => `${r.cantidad}×${r.vias}v`)
    .join(" + ")

  return {
    rodachinas: config.rodachinas,
    cerraduras: config.cerraduras,
    rieles: rielesStr,
    enganches: config.enganches,
    traslapes: config.traslapes,
    empaque: 0,
  }
}

export function calcularEmpaque(
  ancho: number,
  alto: number,
  hojas: number,
  anchoVidrio: number
): number {
  const config = CONFIGURACIONES[hojas] || CONFIGURACIONES[2]
  const altoVidrio = alto - 15

  const perimetroHoja = (anchoVidrio * 2 + altoVidrio * 2) / 1000

  const perimetroTotal = perimetroHoja * config.moviles

  return Math.round(perimetroTotal * 100) / 100
}

export function getConfiguracion(hojas: number): ConfiguracionAccesorios {
  return CONFIGURACIONES[hojas] || CONFIGURACIONES[2]
}

export function listarTipos(): string[] {
  return Object.keys(CONFIGURACIONES).map((k) => `${k}hojas`)
}
