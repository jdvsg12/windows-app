import type { Descuentos, DescuentosSistema } from "./types"

export const descuentos: Descuentos = {
  "5020": {
    jamba: 15,
    enganche: 30,
    traslape: 30,
    hInfSup: 15,
    anchoVidrio: 44,
  },
  "744": {
    jamba: 12,
    enganche: 24,
    traslape: 24,
    hInfSup: 0,
    anchoVidrio: 45,
  },
  "8025": {
    jamba: 12,
    enganche: 28,
    traslape: 28,
    hInfSup: 0,
    anchoVidrio: 46,
  },
  "7038": {
    jamba: 25,
    enganche: 41,
    traslape: 41,
    hInfSup: -10,
    anchoVidrio: 39.8,
  },
}

export function getDescuentos(sistema: string): DescuentosSistema {
  return descuentos[sistema] || descuentos["5020"]
}

export function getSistemasDisponibles(): string[] {
  return Object.keys(descuentos)
}
