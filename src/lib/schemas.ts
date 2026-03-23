import { z } from "zod"

export const VentanaSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    ancho: z.number().positive(),
    alto: z.number().positive(),
    tipoVentana: z.enum(["2hojas", "3hojas", "4hojas", "5hojas", "6hojas"]),
    sistema: z.enum(["5020", "744", "8025", "7038"]).optional(),
})

export const ProyectoSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    cliente: z.string(),
    direccion: z.string().optional(),
    fechaCreacion: z.string(),
    ventanas: z.array(VentanaSchema),
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
    precioVidrioLamina: z.number(),
    tamanoLamina: z.enum(["2440x3660", "2500x3600", "2440x3050", "2140x3300"]),
    manoDeObra: z.number(),
    transporte: z.number(),
    utilidad: z.number(),
    otros: z.number(),
    costosIndirectos: z.number(),
    costosAdicionales: z.array(CostoAdicionalSchema),
})

export type ProyectoInput = z.infer<typeof ProyectoSchema>
export type ConfiguracionEmpresaInput = z.infer<typeof ConfiguracionEmpresaSchema>
export type ConfiguracionPreciosInput = z.infer<typeof ConfiguracionPreciosSchema>
