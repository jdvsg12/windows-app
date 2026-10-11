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

// "2 Hojas" in the form covers two engine types: both leaves movable ("2hojas") or one movable + one
// fixed ("2hojas_mixto"). The form shows a single option plus an "ambas móviles" checkbox.
export function tipoDesdeFormulario(tipo: TipoVentana, ambasMoviles: boolean): TipoVentana {
    return tipo === "2hojas" && !ambasMoviles ? "2hojas_mixto" : tipo
}

export function tipoParaFormulario(tipo: TipoVentana): { tipoVentana: TipoVentana; ambasMoviles: boolean } {
    return tipo === "2hojas_mixto" ? { tipoVentana: "2hojas", ambasMoviles: false } : { tipoVentana: tipo, ambasMoviles: true }
}

export type TipoCerradura = "impacto" | "dummy" | "manija"
export type TipoRodachina = "plastica" | "metalica" | "pabose"
export type CalibreVidrio = 4 | 5 | 6
export type ColorVidrio =
    | "incoloro"
    | "bronce"
    | "gris"
    | "azul"
    | "verde"
    | "reflectivo_plata"
    | "reflectivo_bronce"
    | "reflectivo_azul"
    | "reflectivo_verde"

export type ColorAluminio = "natural" | "blanco" | "negro" | "bronce" | "champana" | "madera"

// Common aluminum finishes in Colombia: anodized (natural, bronze, champagne) and powder coat / wood-grain.
export const COLORES_ALUMINIO: readonly { value: ColorAluminio; label: string }[] = [
    { value: "natural", label: "Natural (anodizado mate)" },
    { value: "blanco", label: "Blanco" },
    { value: "negro", label: "Negro" },
    { value: "bronce", label: "Bronce" },
    { value: "champana", label: "Champaña" },
    { value: "madera", label: "Madera" },
]

export const COLOR_ALUMINIO_POR_DEFECTO: ColorAluminio = "natural"

export const CERRADURAS: readonly { value: TipoCerradura; label: string }[] = [
    { value: "impacto", label: "Impacto" },
    { value: "dummy", label: "Dummy" },
    { value: "manija", label: "Manija" },
]

export const RODACHINAS: readonly { value: TipoRodachina; label: string }[] = [
    { value: "plastica", label: "Plástica" },
    { value: "metalica", label: "Metálica" },
    { value: "pabose", label: "Pabose" },
]

export const CALIBRES_VIDRIO: readonly { value: CalibreVidrio; label: string }[] = [
    { value: 4, label: "4 mm" },
    { value: 5, label: "5 mm" },
    { value: 6, label: "6 mm" },
]

// Float glass colors commonly stocked by Colombian glass distributors for residential windows.
export const COLORES_VIDRIO: readonly { value: ColorVidrio; label: string }[] = [
    { value: "incoloro", label: "Incoloro" },
    { value: "bronce", label: "Bronce" },
    { value: "gris", label: "Gris (humo)" },
    { value: "azul", label: "Azul" },
    { value: "verde", label: "Verde" },
    { value: "reflectivo_plata", label: "Reflectivo plata" },
    { value: "reflectivo_bronce", label: "Reflectivo bronce" },
    { value: "reflectivo_azul", label: "Reflectivo azul" },
    { value: "reflectivo_verde", label: "Reflectivo verde" },
]

// Windows saved before glass specs existed are costed as the most common glass.
export const VIDRIO_POR_DEFECTO: { colorVidrio: ColorVidrio; calibreVidrio: CalibreVidrio } = {
    colorVidrio: "incoloro",
    calibreVidrio: 4,
}

export type ClaveVidrio = `${ColorVidrio}-${CalibreVidrio}`

export const claveVidrio = (color: ColorVidrio, calibre: CalibreVidrio): ClaveVidrio => `${color}-${calibre}`

const labelDe = <T,>(opciones: readonly { value: T; label: string }[], value: T): string =>
    opciones.find((item) => item.value === value)?.label ?? String(value)

export const getColorAluminioLabel = (value: ColorAluminio): string => labelDe(COLORES_ALUMINIO, value)
export const getCerraduraLabel = (value: TipoCerradura): string => labelDe(CERRADURAS, value)
export const getRodachinaLabel = (value: TipoRodachina): string => labelDe(RODACHINAS, value)
export const getCalibreVidrioLabel = (value: CalibreVidrio): string => labelDe(CALIBRES_VIDRIO, value)
export const getColorVidrioLabel = (value: ColorVidrio): string => labelDe(COLORES_VIDRIO, value)

export const SISTEMAS_VENTANA: readonly SistemaVentana[] = ["5020", "744", "8025", "7038"]

// Which systems are offered to new windows now lives in lib/calculo/registro.ts (SISTEMAS_HABILITADOS,
// opcionesSistema, sistemaParaVentanaNueva) — it is derived from the engine registry, so lib/types.ts
// (pure type definitions) does not need to import from lib/calculo/ and risk a circular dependency.

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
    // Optional: windows saved before these fields existed must keep loading.
    colorAluminio?: ColorAluminio
    cerradura?: TipoCerradura
    rodachina?: TipoRodachina
    calibreVidrio?: CalibreVidrio
    colorVidrio?: ColorVidrio
    sandblasting?: boolean
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
    duracionMeses: number // usado para absorber el overhead mensual (modelo D8)
    transporte: number // costo directo de transporte de esta obra (modelo D8)
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
    precioVidrioLamina: number // respaldo cuando un color/calibre no tiene precio propio en preciosVidrio
    preciosVidrio: Partial<Record<ClaveVidrio, number>> // precio por lámina según color y calibre
    precioSandblasting: number // por m² de vidrio con acabado sandblasting
    recargosColorAluminio: Partial<Record<ColorAluminio, number>> // % sobre el precio base de cada perfil según el color
    tamanoLamina: TamanoLamina
    kerfVidrio: number // mm que consume cada corte de vidrio (F3.3); 0 por defecto (vidrio rayado y partido)
    minRestoVidrio: number // mm de lado menor a partir del cual un sobrante de lámina es "resto" reutilizable y no desperdicio
    manoDeObra: number
    imprevistos: number // % sobre el costo de producción (modelo de costeo D8)
    utilidad: number // % sobre el costo total (modelo de costeo D8)
    costosAdicionales: CostoAdicional[]
}

// Overhead mensual del taller (modelo de costeo D8): se absorbe por tiempo
// (overhead × meses de obra), no por m². Ver lib/calculo/costeo.ts.
export interface ConfiguracionOverhead {
    servicioLuz: number
    servicioAgua: number
    servicioInternet: number
    servicioGas: number
    arriendo: number
    herramienta: number
    admin: number
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
    grupo?: string // tipo de vidrio (p. ej. "Bronce 5 mm") cuando el proyecto se agrupa por vidrio
}

export interface RestoLamina {
    x: number
    y: number
    ancho: number
    alto: number
    tipo: "resto" | "desperdicio"
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
    restos: RestoLamina[]
    grupo?: string // tipo de vidrio de todas las piezas de esta lámina
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

// Cascada del modelo de costeo D8. Cada paso guarda tanto el monto de esa línea como
// el subtotal acumulado hasta ahí, para que la vista pueda mostrar la cascada completa.
export interface CostosCalculadosCotizador {
    costoPerfiles: number
    costoAccesorios: number
    costoVidrio: number
    costoEmpaque: number
    costoMateriales: number // 1. perfiles + accesorios + vidrio + empaque
    costoManoObra: number // 2. m² × tarifa
    costoTransporte: number // 3. input por proyecto
    costosAdicionalesDetalle: Array<CostoAdicional & { valorCalculado: number }>
    costosAdicionalesTotal: number
    costoDirecto: number // A = 1 + 2 + 3 + costosAdicionales
    overheadAbsorbido: number // 4. overhead mensual × duración de la obra
    costoProduccion: number // B = A + 4
    imprevistosMonto: number // 5. % sobre B
    costoTotal: number // C = B + 5
    utilidadMonto: number // 6. % sobre C
    total: number // D = C + 6 (precio de venta)
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
    "2140x3300": { label: "2140 x 3300 mm", ancho: 3300, alto: 2140 },
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
