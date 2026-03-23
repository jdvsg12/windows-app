import type { Proyecto, ConfiguracionPrecios } from "./types"
import { ProyectoSchema, ConfiguracionEmpresaSchema, ConfiguracionPreciosSchema } from "./schemas"

const STORAGE_KEYS = {
    PROYECTOS: "ventanas_proyectos",
    PROYECTO_ACTUAL: "ventanas_proyecto_actual",
    DATOS_EMPRESA: "ventanas_datos_empresa",
    DATOS_BANCARIOS: "ventanas_datos_bancarios",
    CONFIGURACION: "ventanas_configuracion",
    PRECIOS: "ventanas_precios",
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

const PRECIOS_DEFAULT: ConfiguracionPrecios = {
    precioCabezal: 90000,
    precioSillar: 90000,
    precioJamba: 72000,
    precioEnganche: 72000,
    precioTraslape: 72000,
    precioHorizontalSuperior: 60000,
    precioHorizontalInferior: 60000,
    precioGuia: 2000,
    precioRodachina: 8000,
    precioCerradura: 25000,
    precioTornillo8mm: 500,
    precioTornillo10mm: 600,
    precioEmpaque: 3000,
    precioVidrioLamina: 180000,
    tamanoLamina: "2500x3600",
    manoDeObra: 30,
    transporte: 50000,
    utilidad: 20,
    otros: 0,
    costosIndirectos: 0,
    costosAdicionales: [],
}

function safeGet<T>(key: string, fallback: T, validator?: (data: unknown) => T): T {
    if (typeof window === "undefined") return fallback
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return fallback
        const parsed = JSON.parse(raw)
        return validator ? validator(parsed) : parsed as T
    } catch {
        return fallback
    }
}

function safeSet(key: string, value: unknown): void {
    if (typeof window === "undefined") return
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error("Error saving to localStorage:", error)
    }
}

function validateProyectos(data: unknown): Proyecto[] {
    const result = z.array(ProyectoSchema).safeParse(data)
    return result.success ? result.data : []
}

function validateConfiguracion(data: unknown) {
    const result = ConfiguracionEmpresaSchema.safeParse(data)
    return result.success ? result.data : CONFIGURACION_DEFAULT
}

function validatePrecios(data: unknown): ConfiguracionPrecios {
    const result = ConfiguracionPreciosSchema.safeParse(data)
    return result.success ? result.data : PRECIOS_DEFAULT
}

import { z } from "zod"

export const obtenerProyectos = (): Proyecto[] => 
    safeGet(STORAGE_KEYS.PROYECTOS, [], validateProyectos)

export const guardarProyectos = (proyectos: Proyecto[]) => 
    safeSet(STORAGE_KEYS.PROYECTOS, proyectos)

export const guardarProyectoActual = (proyectoId: string | null) => {
    if (typeof window === "undefined") return
    if (proyectoId) {
        localStorage.setItem(STORAGE_KEYS.PROYECTO_ACTUAL, proyectoId)
    } else {
        localStorage.removeItem(STORAGE_KEYS.PROYECTO_ACTUAL)
    }
}

export const obtenerProyectoActual = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(STORAGE_KEYS.PROYECTO_ACTUAL)
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

export const obtenerConfiguracion = () => 
    safeGet(STORAGE_KEYS.CONFIGURACION, CONFIGURACION_DEFAULT, validateConfiguracion)

export const guardarConfiguracion = (config: Record<string, string | undefined>) => 
    safeSet(STORAGE_KEYS.CONFIGURACION, config)

export const obtenerPrecios = (): ConfiguracionPrecios => 
    safeGet(STORAGE_KEYS.PRECIOS, PRECIOS_DEFAULT, validatePrecios)

export const guardarPrecios = (precios: ConfiguracionPrecios) => 
    safeSet(STORAGE_KEYS.PRECIOS, precios)
