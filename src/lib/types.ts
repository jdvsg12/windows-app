// lib/types.ts - Tipos unificados del sistema

export type TipoVentana = "2hojas" | "2hojas_mixto" | "3hojas" | "4hojas" | "5hojas" | "6hojas"
export type SistemaVentana = "5020" | "744" | "8025" | "7038"

export const TIPOS_VENTANA: readonly { value: TipoVentana; label: string }[] = [
    { value: "2hojas", label: "2 Hojas" },
    { value: "2hojas_mixto", label: "1 Móvil + 1 Fija" },
    { value: "3hojas", label: "3 Hojas" },
    { value: "4hojas", label: "4 Hojas" },
    { value: "5hojas", label: "5 Hojas" },
    { value: "6hojas", label: "6 Hojas" },
]

// "1 movable + 1 fixed" is not offered for new windows: every window carries a single lock on its last leaf.
// The engine still supports the type so windows already saved keep calculating.
export const TIPOS_HABILITADOS: readonly TipoVentana[] = TIPOS_VENTANA.map(({ value }) => value).filter(
    (value) => value !== "2hojas_mixto"
)

export interface OpcionTipo {
    value: TipoVentana
    label: string
    disabled: boolean
}

// A saved window of a type that is no longer offered keeps it as a disabled option,
// so editing it never silently switches its type (and its cuts) to another one.
export function opcionesTipo(actual?: TipoVentana): OpcionTipo[] {
    const opciones: OpcionTipo[] = TIPOS_VENTANA.filter(({ value }) => TIPOS_HABILITADOS.includes(value)).map(
        ({ value, label }) => ({ value, label, disabled: false })
    )
    if (actual && !TIPOS_HABILITADOS.includes(actual)) {
        opciones.push({ value: actual, label: `${getTipoVentanaLabel(actual)} (no disponible)`, disabled: true })
    }
    return opciones
}

export const SISTEMAS_VENTANA: readonly SistemaVentana[] = ["5020", "744", "8025", "7038"]

// Only validated references can be chosen for new windows (D1). The engine registry replaces this in F3.
export const SISTEMAS_HABILITADOS: readonly SistemaVentana[] = ["8025"]

export interface OpcionSistema {
    value: SistemaVentana
    label: string
    disabled: boolean
}

// The form remembers the last system so several windows of one system can be entered in a row,
// but it must never carry over a system that is not enabled (e.g. after editing a legacy window).
export const sistemaParaVentanaNueva = (recordado?: SistemaVentana): SistemaVentana =>
    recordado && SISTEMAS_HABILITADOS.includes(recordado) ? recordado : SISTEMAS_HABILITADOS[0]

// A window saved with a system that is not enabled keeps it as a disabled option, so editing
// never silently switches its system (and therefore its cuts) to another one.
export function opcionesSistema(actual?: SistemaVentana): OpcionSistema[] {
    const opciones: OpcionSistema[] = SISTEMAS_HABILITADOS.map((value) => ({ value, label: value, disabled: false }))
    if (actual && !SISTEMAS_HABILITADOS.includes(actual)) {
        opciones.push({ value: actual, label: `${actual} (no validado)`, disabled: true })
    }
    return opciones
}

export const getTipoVentanaLabel = (tipo: TipoVentana): string =>
    TIPOS_VENTANA.find((item) => item.value === tipo)?.label ?? tipo

export interface DatosEmpresa {
    nombre: string
    nit: string
    direccion: string
    telefono: string
    email: string
    ciudad: string
    nombreRepresentante: string
    cedulaRepresentante: string
}

export interface DatosBancarios {
    cuentas: Array<{
        banco: string
        tipoCuenta: string
        numeroCuenta: string
        titular: string
        ciudad: string
    }>
    nequi: string
    daviplata: string
}

export interface Ventana {
    id: string
    nombre: string
    ancho: number // mm
    alto: number // mm
    tipoVentana: TipoVentana
    sistema?: SistemaVentana
}

export interface Corte {
    tipo: string
    medida: number // metros
    cantidad: number
    ventana: string
    sistema?: string
}

export interface Proyecto {
    id: string
    nombre: string
    cliente: string
    direccion?: string
    fechaCreacion: string
    ventanas: Ventana[]
}

export interface ConfiguracionEmpresa {
    nombre: string
    nit: string
    direccion: string
    ciudad: string
    telefonos: string
    email: string
    representante: string
    cedula: string
    logo?: string
    datosBancarios: string
}

export interface ConfiguracionPrecios {
    precioCabezal: number
    precioSillar: number
    precioJamba: number
    precioEnganche: number
    precioTraslape: number
    precioHorizontalSuperior: number
    precioHorizontalInferior: number
    precioGuia: number
    precioRodachina: number
    precioCerradura: number
    precioTornillo8mm: number
    precioTornillo10mm: number
    precioEmpaque: number
    precioVidrioLamina: number
    tamanoLamina: TamanoLamina
    manoDeObra: number
    transporte: number
    utilidad: number
    otros: number
    costosIndirectos: number
    costosAdicionales: CostoAdicional[]
}

export interface CostoAdicional {
    id: string
    nombre: string
    valor: number
    tipo: "fijo" | "porcentaje"
}

export interface VidrioCorte {
    ventana: string
    tipo: string
    ancho: number // mm
    alto: number // mm
    area: number // m²
}

export interface LaminaVidrio {
    numero: number
    anchoLamina: number
    altoLamina: number
    vidrios: Array<{
        vidrio: VidrioCorte
        x: number
        y: number
        rotado: boolean
    }>
    areaUsada: number
    areaSobrante: number
}

export interface Accesorios {
    rodachinas: number
    guiasSuperior: number
    guiasInferior: number
    tornillosHojas: number
    tornillosMarco: number
    tornillosInstalacion: number
    cerraduras: number
    empaqueTotal: number
}

export interface OptimizacionPerfil {
    barras: number[][]
    metrosUsados: number
}

export interface CostosCalculados {
    costoPerfiles: number
    costoAccesorios: number
    costoEmpaque: number
    subtotal: number
    costoManoObra: number
    costoTransporte: number
    costoOtros: number
    costosAdicionalesDetalle: Array<CostoAdicional & { valorCalculado: number }>
    costosAdicionalesTotal: number
    utilidadMonto: number
    total: number
    areaTotal: number
    precioPorM2: number
    valoresPorVentana: Array<{
        id: string
        area: number
        valor: number
    }>
}

export interface CostosCalculadosCotizador {
    costoPerfiles: number
    costoAccesorios: number
    costoVidrio: number
    costoEmpaque: number
    costoMateriales: number
    costoManoObra: number
    costoIndirectos: number
    costosAdicionalesDetalle: Array<CostoAdicional & { valorCalculado: number }>
    costosAdicionalesTotal: number
    costoDirecto: number
    utilidadMonto: number
    total: number
    areaTotal: number
    precioPorM2: number
    valoresPorVentana: Array<{
        id: string
        area: number
        valor: number
    }>
}

export const TAMANOS_LAMINA = {
    "2440x3660": { label: "2440 x 3660 mm", ancho: 2440, alto: 3660 },
    "2500x3600": { label: "2500 x 3600 mm", ancho: 2500, alto: 3600 },
    "2440x3050": { label: "2440 x 3050 mm", ancho: 2440, alto: 3050 },
    "2140x3300": { label: "2140 x 3300 mm", ancho: 2140, alto: 3300 },
} as const

export type TamanoLamina = keyof typeof TAMANOS_LAMINA

export interface DescuentosSistema {
    jamba: number
    engancheNormal: number
    engancheParche: number
    traslapeNormal: number
    traslapeParche: number
    anchoVidrio: number
}

export type DescuentosPorSistema = Record<SistemaVentana, DescuentosSistema>

export const DESCUNTOS_DEFAULT: DescuentosPorSistema = {
    "5020": {
        jamba: 15,
        engancheNormal: 30,
        engancheParche: 5,
        traslapeNormal: 30,
        traslapeParche: 5,
        anchoVidrio: 44,
    },
    "744": {
        jamba: 12,
        engancheNormal: 24,
        engancheParche: 5,
        traslapeNormal: 24,
        traslapeParche: 5,
        anchoVidrio: 45,
    },
    "8025": {
        jamba: 12,
        engancheNormal: 28,
        engancheParche: 5,
        traslapeNormal: 28,
        traslapeParche: 5,
        anchoVidrio: 46,
    },
    "7038": {
        jamba: 25,
        engancheNormal: 41,
        engancheParche: 5,
        traslapeNormal: 41,
        traslapeParche: 5,
        anchoVidrio: 39.8,
    },
}
