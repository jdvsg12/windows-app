import { z } from "zod"

export const TipoVentanaSchema = z.enum(["2hojas", "2hojas_mixto", "3hojas", "4hojas", "5hojas", "6hojas"])
export const SistemaVentanaSchema = z.enum(["5020", "744", "8025", "7038"])
export const ColorAluminioSchema = z.enum(["natural", "blanco", "negro", "bronce", "champana", "madera"])
export const TipoCerraduraSchema = z.enum(["impacto", "dummy", "manija"])
export const TipoRodachinaSchema = z.enum(["plastica", "metalica", "pabose"])
export const CalibreVidrioSchema = z.union([z.literal(4), z.literal(5), z.literal(6)])
export const ColorVidrioSchema = z.enum([
    "incoloro",
    "bronce",
    "gris",
    "azul",
    "verde",
    "reflectivo_plata",
    "reflectivo_bronce",
    "reflectivo_azul",
    "reflectivo_verde",
])

export const VentanaSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    ancho: z.number().positive(),
    alto: z.number().positive(),
    tipoVentana: TipoVentanaSchema,
    sistema: SistemaVentanaSchema.optional(),
    // .optional(): ventanas guardadas antes de agregar estas especificaciones no las tienen.
    colorAluminio: ColorAluminioSchema.optional(),
    cerradura: TipoCerraduraSchema.optional(),
    rodachina: TipoRodachinaSchema.optional(),
    calibreVidrio: CalibreVidrioSchema.optional(),
    colorVidrio: ColorVidrioSchema.optional(),
    sandblasting: z.boolean().optional(),
})

export const ProyectoSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    cliente: z.string(),
    direccion: z.string().optional(),
    fechaCreacion: z.string(),
    ventanas: z.array(VentanaSchema),
    // .default() en vez de required: los proyectos guardados antes de F3.2 no tienen
    // estos campos, y deben seguir cargando (con estos valores neutros) en vez de
    // fallar la validación y perderse.
    duracionMeses: z.number().positive().default(1),
    transporte: z.number().min(0).default(0),
})

export const ConfiguracionEmpresaSchema = z.object({
    nombre: z.string(),
    nit: z.string(),
    direccion: z.string(),
    ciudad: z.string(),
    telefonos: z.string(),
    email: z.string(),
    representante: z.string(),
    cedula: z.string(),
    logo: z.string().optional(),
    datosBancarios: z.string(),
})

export const CostoAdicionalSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    valor: z.number(),
    tipo: z.enum(["fijo", "porcentaje"]),
})

export const ConfiguracionPreciosSchema = z.object({
    precioCabezal: z.number(),
    precioSillar: z.number(),
    precioJamba: z.number(),
    precioEnganche: z.number(),
    precioTraslape: z.number(),
    precioHorizontalSuperior: z.number(),
    precioHorizontalInferior: z.number(),
    precioGuia: z.number(),
    precioRodachina: z.number(),
    precioCerradura: z.number(),
    precioTornillo8mm: z.number(),
    precioTornillo10mm: z.number(),
    precioEmpaque: z.number(),
    // Respaldo cuando un color/calibre no tiene precio propio en preciosVidrio.
    precioVidrioLamina: z.number(),
    // .default(): precios guardados antes de tener precio por color/calibre de vidrio.
    // Las claves no se validan contra la lista de colores: una clave vieja no debe tumbar
    // todos los precios guardados. El tipo ConfiguracionPrecios las restringe en el código.
    preciosVidrio: z.record(z.string(), z.number().min(0)).default({}), // por lámina, clave "<color>-<calibre>"
    precioSandblasting: z.number().min(0).default(0), // por m² de vidrio con acabado sandblasting
    recargosColorAluminio: z.record(z.string(), z.number()).default({}), // % sobre el precio base de cada perfil
    tamanoLamina: z.enum(["2440x3660", "2500x3600", "2440x3050", "2140x3300"]),
    // .default(): precios guardados antes de F3.3 no tienen estos campos (modelo D8/F3.3).
    kerfVidrio: z.number().min(0).default(0), // mm por corte; 0 = vidrio rayado y partido
    minRestoVidrio: z.number().min(0).default(200), // mm de lado menor para que un sobrante sea "resto" y no desperdicio
    manoDeObra: z.number(),
    // .default(0): precios guardados antes de F3.2 no tienen "imprevistos" (era un
    // campo nuevo del modelo D8) y deben seguir cargando en vez de perder todos los
    // demás precios ya configurados por caer al fallback completo.
    imprevistos: z.number().default(0), // % sobre el costo de producción (D8)
    utilidad: z.number(), // % sobre el costo total (D8)
    costosAdicionales: z.array(CostoAdicionalSchema),
})

export const ConfiguracionOverheadSchema = z.object({
    servicioLuz: z.number(),
    servicioAgua: z.number(),
    servicioInternet: z.number(),
    servicioGas: z.number(),
    arriendo: z.number(),
    herramienta: z.number(),
    admin: z.number(),
})

const dimensionSchema = (label: string) =>
    z
        .string()
        .min(1, `Ingresa el ${label}`)
        .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, `El ${label} debe ser mayor a 0`)

export const VentanaFormSchema = z.object({
    nombre: z.string().trim().min(1, "Ingresa un nombre"),
    ancho: dimensionSchema("ancho"),
    alto: dimensionSchema("alto"),
    tipoVentana: TipoVentanaSchema,
    sistema: SistemaVentanaSchema,
    ambasMoviles: z.boolean(),
    colorAluminio: ColorAluminioSchema,
    cerradura: TipoCerraduraSchema,
    rodachina: TipoRodachinaSchema,
    // Native <select> values are strings; VentanasTab converts it to the stored number.
    calibreVidrio: z.enum(["4", "5", "6"]),
    colorVidrio: ColorVidrioSchema,
    sandblasting: z.boolean(),
})

export type VentanaFormValues = z.infer<typeof VentanaFormSchema>

export const CreateProjectSchema = z.object({
    nombre: z.string().trim().min(1, "Ingresa un nombre"),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const AdminLoginSchema = z.object({
    password: z.string().min(1, "Ingrese la contraseña"),
})

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>
export type ProyectoInput = z.infer<typeof ProyectoSchema>
export type ConfiguracionEmpresaInput = z.infer<typeof ConfiguracionEmpresaSchema>
export type ConfiguracionPreciosInput = z.infer<typeof ConfiguracionPreciosSchema>
export type ConfiguracionOverheadInput = z.infer<typeof ConfiguracionOverheadSchema>
