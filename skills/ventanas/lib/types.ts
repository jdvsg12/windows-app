export type SistemaVentana = "5020" | "744" | "8025" | "7038"

export type TipoVentana = "2hojas" | "3hojas" | "4hojas" | "5hojas" | "6hojas"

export type TipoPanel = "movil" | "fijo" | "fijo-parche"

export interface DescuentosSistema {
  jamba: number
  enganche: number
  traslape: number
  hInfSup: number
  anchoVidrio: number
}

export interface Descuentos {
  [sistema: string]: DescuentosSistema
}

export interface Panel {
  numero: number
  ancho: number
  tipo: TipoPanel
  perfilEnganche: "izq" | "der" | "ambos" | "ninguno"
  perfilTraslape: boolean
}

export interface ResultadoPaneles {
  paneles: Panel[]
  anchoPanelBase: number
  esValido: boolean
  error?: string
}

export interface ResultadoVidrio {
  anchoVidrio: number
  altoVidrio: number
  area: number
}

export interface AccesoriosVentana {
  rodachinas: number
  cerraduras: number
  rieles: string
 enganches: number
  traslapes: number
  empaque: number
}

export interface Riel {
  vias: number
  cantidad: number
}

export interface DebugDescuento {
  perfil: string
  medidaOriginal: number
  descuento: number
  medidaFinal: number
}
