import type { Proyecto, DatosEmpresa, DatosBancarios, ConfiguracionPrecios } from "./types"

const STORAGE_KEYS = {
    PROYECTOS: "ventanas_proyectos",
    PROYECTO_ACTUAL: "ventanas_proyecto_actual",
    DATOS_EMPRESA: "ventanas_datos_empresa",
    DATOS_BANCARIOS: "ventanas_datos_bancarios",
}

// Datos por defecto de la empresa
export const DATOS_EMPRESA_DEFAULT: DatosEmpresa = {
    nombre: "ALUVE",
    nit: "79717122-6",
    direccion: "CARRERA 5 47B 91",
    telefono: "3112877130 / 3168297417",
    email: "ALUVE_03@hotmail.com",
    ciudad: "GIRARDOT CUNDINAMARCA",
    nombreRepresentante: "Oscar Velandia Malagón",
    cedulaRepresentante: "79'717.122 de Bta.",
}

export const DATOS_BANCARIOS_DEFAULT: DatosBancarios = {
    cuentas: [
        {
            banco: "Banco Caja Social",
            tipoCuenta: "Cuenta de Ahorros",
            numeroCuenta: "24076716113",
            titular: "Oscar Velandia",
            ciudad: "Girardot",
        },
        {
            banco: "Banco Caja Social",
            tipoCuenta: "Cuenta de Ahorros",
            numeroCuenta: "24085462744",
            titular: "Oscar Velandia",
            ciudad: "Bogotá",
        },
        {
            banco: "Bancolombia",
            tipoCuenta: "Cuenta de Ahorros",
            numeroCuenta: "65969220461",
            titular: "Diana Marcela Guarin - CC. 1070590109",
            ciudad: "Girardot",
        },
    ],
    nequi: "3168297417",
    daviplata: "3168297417",
}

// Proyectos
export const guardarProyectos = (proyectos: Proyecto[]) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.PROYECTOS, JSON.stringify(proyectos))
    }
}

export const obtenerProyectos = (): Proyecto[] => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem(STORAGE_KEYS.PROYECTOS)
        if (data) {
            try {
                return JSON.parse(data)
            } catch (error) {
                console.error("Error parsing proyectos:", error)
                return []
            }
        }
    }
    return []
}

export const guardarProyectoActual = (proyectoId: string | null) => {
    if (typeof window !== "undefined") {
        if (proyectoId) {
            localStorage.setItem(STORAGE_KEYS.PROYECTO_ACTUAL, proyectoId)
        } else {
            localStorage.removeItem(STORAGE_KEYS.PROYECTO_ACTUAL)
        }
    }
}

export const obtenerProyectoActual = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEYS.PROYECTO_ACTUAL)
    }
    return null
}

// Datos de empresa
export const guardarDatosEmpresa = (datos: DatosEmpresa) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.DATOS_EMPRESA, JSON.stringify(datos))
    }
}

export const obtenerDatosEmpresa = (): DatosEmpresa => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem(STORAGE_KEYS.DATOS_EMPRESA)
        if (data) {
            try {
                return JSON.parse(data)
            } catch (error) {
                console.error("Error parsing datos empresa:", error)
                return DATOS_EMPRESA_DEFAULT
            }
        }
    }
    return DATOS_EMPRESA_DEFAULT
}

// Datos bancarios
export const guardarDatosBancarios = (datos: DatosBancarios) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.DATOS_BANCARIOS, JSON.stringify(datos))
    }
}

export const obtenerDatosBancarios = (): DatosBancarios => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem(STORAGE_KEYS.DATOS_BANCARIOS)
        if (data) {
            try {
                return JSON.parse(data)
            } catch (error) {
                console.error("Error parsing datos bancarios:", error)
                return DATOS_BANCARIOS_DEFAULT
            }
        }
    }
    return DATOS_BANCARIOS_DEFAULT
}

export const getProyectos = obtenerProyectos

export const crearProyecto = (nombre: string, cliente?: string, direccion?: string): Proyecto => {
    const proyectos = obtenerProyectos()
    const nuevoProyecto: Proyecto = {
        id: crypto.randomUUID(),
        nombre,
        cliente: cliente || "",
        direccion: direccion || "",
        fechaCreacion: new Date().toISOString(),
        ventanas: [],
    }
    proyectos.push(nuevoProyecto)
    guardarProyectos(proyectos)
    guardarProyectoActual(nuevoProyecto.id)
    return nuevoProyecto
}

export const actualizarProyecto = (proyecto: Proyecto) => {
    const proyectos = obtenerProyectos()
    const index = proyectos.findIndex((p) => p.id === proyecto.id)
    if (index !== -1) {
        proyectos[index] = proyecto
        guardarProyectos(proyectos)
    }
}

export const eliminarProyecto = (id: string) => {
    const proyectos = obtenerProyectos()
    const nuevoProyectos = proyectos.filter((p) => p.id !== id)
    guardarProyectos(nuevoProyectos)
    const proyectoActual = obtenerProyectoActual()
    if (proyectoActual === id) {
        guardarProyectoActual(null)
    }
}

export const obtenerProyectoPorId = (id: string): Proyecto | null => {
    const proyectos = obtenerProyectos()
    return proyectos.find((p) => p.id === id) || null
}

const CONFIGURACION_DEFAULT = {
    nombre: "ALUVE",
    nit: "79717122-6",
    direccion: "CARRERA 5 47B 91",
    ciudad: "GIRARDOT CUNDINAMARCA",
    telefonos: "3112877130 / 3168297417",
    email: "ALUVE_03@hotmail.com",
    representante: "Oscar Velandia Malagón",
    cedula: "79'717.122 de Bta.",
    logo: "",
    datosBancarios: `PARA CONSIGNACIÓN EN EFECTIVO:
Número de cuenta: En Girardot 24076716113 Cuenta de Ahorros Banco Caja Social
En Bogotá 24085462744 Cuenta de Ahorros Banco Caja Social
Titular: Oscar Velandia

BANCOLOMBIA, TITULAR: DIANA MARCELA GUARIN CC. 1070590109 
CUENTA DE AHORROS 65969220461 DE GIRARDOT.

Nequi y daviplata 3168297417

Nota: En caso de consignación, se debe enviar fotografía al WhatsApp 3168297417`,
}

export const obtenerConfiguracion = () => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem("ventanas_configuracion")
        if (data) {
            try {
                return JSON.parse(data)
            } catch (error) {
                console.error("Error parsing configuracion:", error)
                return CONFIGURACION_DEFAULT
            }
        }
    }
    return CONFIGURACION_DEFAULT
}

export const guardarConfiguracion = (config: Record<string, unknown>) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("ventanas_configuracion", JSON.stringify(config))
    }
}

const PRECIOS_DEFAULT = {
    precioCabezal: 90000, // por barra de 6m
    precioSillar: 90000, // por barra de 6m
    precioJamba: 72000, // por barra de 6m
    precioEnganche: 72000, // por barra de 6m
    precioTraslape: 72000, // por barra de 6m
    precioHorizontalSuperior: 60000, // por barra de 6m
    precioHorizontalInferior: 60000, // por barra de 6m

    precioVidrio: 85000, // por m²
    precioVidrioLamina: 180000, // por lamina
    tamanoLamina: "2500x3600" as const,

    // Precios de accesorios por unidad
    precioGuia: 2000,
    precioRodachina: 8000,
    precioCerradura: 25000,
    precioTornillo8mm: 500,
    precioTornillo10mm: 600,
    precioEmpaque: 3000, // por metro

    // Costos adicionales fijos
    manoDeObra: 30, // 30%
    transporte: 50000,
    utilidad: 20, // 20%
    otros: 0,
    costosIndirectos: 0, // valor fijo

    costosAdicionales: [] as Array<{
        id: string
        nombre: string
        valor: number
        tipo: "fijo" | "porcentaje"
    }>,
}

export const obtenerPrecios = () => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem("ventanas_precios")
        if (data) {
            try {
                const precios = JSON.parse(data)
                if (!precios.costosAdicionales) {
                    precios.costosAdicionales = []
                }
                return precios
            } catch (error) {
                console.error("Error parsing precios:", error)
                return PRECIOS_DEFAULT
            }
        }
    }
    return PRECIOS_DEFAULT
}

export const guardarPrecios = (precios: ConfiguracionPrecios) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("ventanas_precios", JSON.stringify(precios))
    }
}
