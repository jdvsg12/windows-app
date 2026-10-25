import { z } from "zod"

import {
    ConfiguracionEmpresaSchema,
    ConfiguracionOverheadSchema,
    ConfiguracionPreciosSchema,
    FotosProductosSchema,
    ProyectoSchema,
} from "../schemas"
import {
    DESCUNTOS_DEFAULT,
    type ConfiguracionEmpresa,
    type ConfiguracionOverhead,
    type ConfiguracionPrecios,
    type DescuentosPorSistema,
    type FotosProductos,
    type Proyecto,
} from "../types"

// Qué se guarda y cómo se lee, compartido por todos los adaptadores (localStorage hoy, IndexedDB
// después): la clave, el valor cuando no hay nada guardado y la validación con Zod de lo leído.
// Las claves son las de localStorage desde el principio: cambiarlas perdería los datos guardados.

export interface DefinicionDocumento<T> {
    clave: string
    predeterminado: T
    validar: (dato: unknown) => T
}

// Real company/banking data lives in Vercel env vars (NEXT_PUBLIC_COMPANY_*), not in
// source: it used to be hardcoded here and shipped in the git history and the bundle
// for anyone to read. NEXT_PUBLIC_ vars are still inlined into the client bundle (this
// data has to be readable in the browser to prefill the form), so this only keeps it
// out of the repo and lets it differ per Vercel environment — it does not by itself
// hide it from someone with access to the deployed app. See .env.example.
const CONFIGURACION_DEFAULT: ConfiguracionEmpresa = {
    nombre: process.env.NEXT_PUBLIC_COMPANY_NOMBRE ?? "",
    nit: process.env.NEXT_PUBLIC_COMPANY_NIT ?? "",
    direccion: process.env.NEXT_PUBLIC_COMPANY_DIRECCION ?? "",
    ciudad: process.env.NEXT_PUBLIC_COMPANY_CIUDAD ?? "",
    telefonos: process.env.NEXT_PUBLIC_COMPANY_TELEFONOS ?? "",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "",
    representante: process.env.NEXT_PUBLIC_COMPANY_REPRESENTANTE ?? "",
    cedula: process.env.NEXT_PUBLIC_COMPANY_CEDULA ?? "",
    logo: "",
    datosBancarios: process.env.NEXT_PUBLIC_COMPANY_DATOS_BANCARIOS ?? "",
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
    preciosVidrio: {},
    precioSandblasting: 0,
    recargosColorAluminio: {},
    preciosCerradura: {},
    preciosRodachina: {},
    tamanoLamina: "2500x3600",
    kerfVidrio: 0,
    minRestoVidrio: 200,
    manoDeObra: 30,
    imprevistos: 0,
    utilidad: 20,
    costosAdicionales: [],
}

// Servicios conocidos hoy; arriendo/herramienta/admin quedan listos en 0 hasta que se
// definan (modelo de costeo D8, tarea F3.2).
const OVERHEAD_DEFAULT: ConfiguracionOverhead = {
    servicioLuz: 300000,
    servicioAgua: 180000,
    servicioInternet: 80000,
    servicioGas: 40000,
    arriendo: 0,
    herramienta: 0,
    admin: 0,
}

const FOTOS_PRODUCTOS_DEFAULT: FotosProductos = { cerraduras: {}, rodachinas: {} }

function conEsquema<T>(esquema: z.ZodType<T, z.ZodTypeDef, unknown>, predeterminado: T) {
    return (dato: unknown): T => {
        const resultado = esquema.safeParse(dato)
        return resultado.success ? resultado.data : predeterminado
    }
}

export const CLAVE_PROYECTOS = "ventanas_proyectos"

// Un proyecto inválido invalida toda la lista (comportamiento heredado de storage.ts): ProyectoSchema
// repara con .catch() los campos que se sabe que llegan dañados, para que esto no pase.
export const validarProyectos = conEsquema<Proyecto[]>(z.array(ProyectoSchema), [])

export const DOCUMENTOS: {
    configuracion: DefinicionDocumento<ConfiguracionEmpresa>
    precios: DefinicionDocumento<ConfiguracionPrecios>
    descuentos: DefinicionDocumento<DescuentosPorSistema>
    overhead: DefinicionDocumento<ConfiguracionOverhead>
    fotosProductos: DefinicionDocumento<FotosProductos>
} = {
    configuracion: {
        clave: "ventanas_configuracion",
        predeterminado: CONFIGURACION_DEFAULT,
        validar: conEsquema<ConfiguracionEmpresa>(ConfiguracionEmpresaSchema, CONFIGURACION_DEFAULT),
    },
    precios: {
        clave: "ventanas_precios",
        predeterminado: PRECIOS_DEFAULT,
        validar: conEsquema<ConfiguracionPrecios>(ConfiguracionPreciosSchema, PRECIOS_DEFAULT),
    },
    // Sin esquema todavía: se lee tal cual se guardó, como antes de los repositorios.
    descuentos: {
        clave: "ventanas_descuentos",
        predeterminado: DESCUNTOS_DEFAULT,
        validar: (dato) => (dato ?? DESCUNTOS_DEFAULT) as DescuentosPorSistema,
    },
    overhead: {
        clave: "ventanas_overhead",
        predeterminado: OVERHEAD_DEFAULT,
        validar: conEsquema<ConfiguracionOverhead>(ConfiguracionOverheadSchema, OVERHEAD_DEFAULT),
    },
    fotosProductos: {
        clave: "ventanas_fotos_productos",
        predeterminado: FOTOS_PRODUCTOS_DEFAULT,
        validar: conEsquema<FotosProductos>(FotosProductosSchema, FOTOS_PRODUCTOS_DEFAULT),
    },
}
