import { describe, expect, it } from "vitest"

import { cambiosContenido, fechaATexto, textoAFecha, valoresContenido } from "@/lib/contenido-cotizacion"
import { ProyectoSchema } from "@/lib/schemas"

// Proyecto tal como quedaba guardado antes de AWA-16: sin contenidoCotizacion.
const proyectoGuardadoAntes = {
    id: "p1",
    nombre: "Casa López",
    cliente: "Ana López",
    fechaCreacion: "2026-10-01T12:00:00.000Z",
    ventanas: [],
    duracionMeses: 2,
    transporte: 50000,
}

const HOY = new Date(2026, 9, 13)

describe("contenido de la cotización guardado en el proyecto", () => {
    it("un proyecto guardado antes de AWA-16 sigue cargando, con el contenido por defecto", () => {
        const proyecto = ProyectoSchema.parse(proyectoGuardadoAntes)
        expect(proyecto.contenidoCotizacion).toEqual({
            descripcion: "",
            mostrarMedidas: true,
            mostrarValores: true,
        })
    })

    it("sin fecha guardada, el formulario arranca con la fecha de hoy", () => {
        const proyecto = ProyectoSchema.parse(proyectoGuardadoAntes)
        expect(valoresContenido(proyecto, HOY)).toEqual({
            cliente: "Ana López",
            fecha: "2026-10-13",
            descripcion: "",
            mostrarMedidas: true,
            mostrarValores: true,
        })
    })

    it("con fecha guardada, el formulario usa esa fecha y no la de hoy", () => {
        const proyecto = ProyectoSchema.parse({
            ...proyectoGuardadoAntes,
            contenidoCotizacion: { fecha: "2026-09-30", descripcion: "<p>Hola</p>", mostrarValores: false },
        })
        expect(valoresContenido(proyecto, HOY)).toMatchObject({
            fecha: "2026-09-30",
            descripcion: "<p>Hola</p>",
            mostrarMedidas: true,
            mostrarValores: false,
        })
    })

    it("lo guardado desde el formulario vuelve a cargar igual (ida y vuelta)", () => {
        const valores = {
            cliente: "Pedro Gómez",
            fecha: "2026-11-02",
            descripcion: "<b>Obra</b>",
            mostrarMedidas: false,
            mostrarValores: true,
        }
        const proyecto = ProyectoSchema.parse({ ...proyectoGuardadoAntes, ...cambiosContenido(valores) })
        expect(valoresContenido(proyecto, HOY)).toEqual(valores)
    })

    it("la fecha en texto no se corre un día por la zona horaria", () => {
        expect(fechaATexto(textoAFecha("2026-10-13"))).toBe("2026-10-13")
    })
})
