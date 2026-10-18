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

// Lo que el usuario escribe en la pestaña Contenido del cotizador. Todo con .default():
// los proyectos guardados antes de AWA-16 no tienen este bloque.
export const ContenidoCotizacionSchema = z.object({
    // "yyyy-MM-dd"; sin fecha guardada la cotización sale con la fecha del día.
    fecha: z.string().optional(),
    descripcion: z.string().default(""),
    mostrarMedidas: z.boolean().default(true),
    mostrarValores: z.boolean().default(true),
})

export const ContenidoCotizacionFormSchema = z.object({
    cliente: z.string(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    descripcion: z.string(),
    mostrarMedidas: z.boolean(),
    mostrarValores: z.boolean(),
})

export type ContenidoCotizacionFormValues = z.infer<typeof ContenidoCotizacionFormSchema>

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

// Lo que se imprime en una cotización (vista previa y PDF), ya resuelto: etiquetas en texto y
// opciones aplicadas. Es lo que se guarda en cada versión del PDF y en el snapshot al emitir.
export const FilaCotizacionSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    tipo: z.string(),
    especificaciones: z.array(z.string()),
    ancho: z.number(),
    alto: z.number(),
    // null: sin costeo (por ejemplo, un vidrio que no cabe en la lámina).
    area: z.number().nullable(),
    valor: z.number().nullable(),
})

export const DocumentoCotizacionSchema = z.object({
    empresa: ConfiguracionEmpresaSchema,
    fecha: z.string(),
    cliente: z.string(),
    proyecto: z.string(),
    descripcion: z.string(),
    mostrarMedidas: z.boolean(),
    mostrarValores: z.boolean(),
    filas: z.array(FilaCotizacionSchema),
    areaTotal: z.number().nullable(),
    total: z.number().nullable(),
})

// Cada PDF de cotización generado guarda sus datos (no el archivo) y se vuelve a generar al
// descargarlo. Se conservan las 3 últimas más una marcada como "guardada" (ver versiones-cotizacion.ts).
export const VersionCotizacionSchema = z.object({
    id: z.string(),
    creada: z.string(),
    guardada: z.boolean(),
    // Sin el logo: pesa hasta ~500 KB y repetido en cada versión llenaría el almacenamiento.
    documento: DocumentoCotizacionSchema,
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
    // .catch(): un valor inválido ya guardado (null por un NaN del formulario) no puede
    // invalidar el arreglo entero de proyectos y hacerlos desaparecer todos.
    duracionMeses: z.number().positive().default(1).catch(1),
    transporte: z.number().min(0).default(0).catch(0),
    contenidoCotizacion: ContenidoCotizacionSchema.default({}),
    // .catch([]): una versión dañada no puede tumbar el proyecto; se pierden las versiones, no la obra.
    versionesCotizacion: z.array(VersionCotizacionSchema).default([]).catch([]),
})


// Plan de corte de vidrio listo para imprimir: una lámina por página. Se guarda igual que la
// cotización cuando el snapshot al emitir congele también el plan (AWA-45).
export const PiezaPlanCorteSchema = z.object({
    etiqueta: z.string(),
    hoja: z.enum(["fija", "movil"]),
    descripcion: z.string(),
    x: z.number(),
    y: z.number(),
    ancho: z.number(),
    alto: z.number(),
    rotada: z.boolean(),
})

export const RestoPlanCorteSchema = z.object({
    tipo: z.enum(["resto", "desperdicio"]),
    x: z.number(),
    y: z.number(),
    ancho: z.number(),
    alto: z.number(),
})

export const LaminaPlanCorteSchema = z.object({
    numero: z.number(),
    grupo: z.string().nullable(),
    ancho: z.number(),
    alto: z.number(),
    // La lámina es un resto del inventario, no una lámina nueva.
    deInventario: z.boolean(),
    piezas: z.array(PiezaPlanCorteSchema),
    restos: z.array(RestoPlanCorteSchema),
    areaUsada: z.number(),
    areaSobrante: z.number(),
})

export const DocumentoPlanCorteSchema = z.object({
    proyecto: z.string(),
    fecha: z.string(),
    laminas: z.array(LaminaPlanCorteSchema),
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
    // Precio por tipo de cerradura y de rodachina. Un tipo sin precio propio usa precioCerradura /
    // precioRodachina, así los precios guardados antes de AWA-28 siguen igual.
    preciosCerradura: z.record(z.string(), z.number().min(0)).default({}),
    preciosRodachina: z.record(z.string(), z.number().min(0)).default({}),
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
