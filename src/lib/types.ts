// lib/types.ts - Tipos unificados del sistema

export type TipoVentana = "2hojas" | "3hojas" | "4hojas" | "5hojas" | "6hojas"
export type SistemaVentana = "5020" | "744" | "8025" | "7038"

export type WindowType = "corrediza" | "batiente" | "fija" | "oscilobatiente"
export type ProjectStatus = "draft" | "active" | "completed"
export type MaterialType = "perfil" | "vidrio" | "herraje" | "sellante" | "accesorio"

export interface Material {
    id: string
    name: string
    type: MaterialType
    unit: string
    pricePerUnit: number
    quantity: number
    totalPrice: number
}

export interface Window {
    id: string
    windowType: WindowType
    width: number
    height: number
    materials: Material[]
}

export interface Project {
    id: string
    projectName: string
    client: string
    description?: string
    createAt: string
    updatedAt?: string
    status: ProjectStatus
    totalMaterialCost: number
    notes?: string
    numberOfWindows: number
    windows: Window[]
}

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
    sistema?: SistemaVentana // Sistema de ventana (5020, 744, 8025, 7038)
}

export interface Corte {
    tipo: string
    medida: number // metros
    cantidad: number
    ventana: string
    sistema?: string // Sistema de ventana (5020, 744, 8025, 7038)
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
    // Precios de perfiles (por metro)
    precioCabezal: number
    precioSillar: number
    precioJamba: number
    precioEnganche: number
    precioTraslape: number
    precioHorizontalSuperior: number
    precioHorizontalInferior: number

    // Precios de accesorios (por unidad)
    precioGuia: number
    precioRodachina: number
    precioCerradura: number
    precioTornillo8mm: number
    precioTornillo10mm: number
    precioEmpaque: number // por metro

    // Precios de vidrio
    precioVidrioLamina: number // por lámina
    tamanoLamina: TamanoLamina

    // Costos adicionales
    manoDeObra: number // porcentaje
    transporte: number // valor fijo
    utilidad: number // porcentaje
    otros: number // valor fijo
    costosIndirectos: number // valor fijo
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

export const TAMANOS_LAMINA = {
    "2440x3660": { label: "2440 x 3660 mm", ancho: 2440, alto: 3660 },
    "2500x3600": { label: "2500 x 3600 mm", ancho: 2500, alto: 3600 },
    "2440x3050": { label: "2440 x 3050 mm", ancho: 2440, alto: 3050 },
    "2140x3300": { label: "2140 x 3300 mm", ancho: 2140, alto: 3300 },
} as const

export type TamanoLamina = keyof typeof TAMANOS_LAMINA
