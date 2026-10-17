import { describe, expect, it } from "vitest"

import { armarDocumentoCotizacion, type EntradaDocumentoCotizacion } from "@/lib/pdf/cotizacion-modelo"
import { DocumentoCotizacionSchema, ProyectoSchema } from "@/lib/schemas"
import type { ConfiguracionEmpresa, CostosCalculadosCotizador } from "@/lib/types"

const empresa: ConfiguracionEmpresa = {
    nombre: "Taller de prueba",
    nit: "900.000.000-0",
    direccion: "Calle 1 # 2-3",
    ciudad: "Cali",
    telefonos: "300 000 0000",
    email: "taller@example.com",
    representante: "Representante",
    cedula: "1.000.000",
    datosBancarios: "Cuenta de ahorros 000",
}

const proyecto = ProyectoSchema.parse({
    id: "p1",
    nombre: "Casa López",
    cliente: "Ana López",
    fechaCreacion: "2026-10-01T12:00:00.000Z",
    ventanas: [
        {
            id: "v1",
            nombre: "Sala",
            ancho: 1500,
            alto: 1200,
            tipoVentana: "2hojas_mixto",
            colorAluminio: "negro",
            cerradura: "manija",
            rodachina: "metalica",
            calibreVidrio: 5,
            colorVidrio: "bronce",
            sandblasting: true,
        },
        // Guardada antes de las especificaciones.
        { id: "v2", nombre: "Cocina", ancho: 1000, alto: 1000, tipoVentana: "2hojas" },
    ],
})

const costos: CostosCalculadosCotizador = {
    costoPerfiles: 0,
    costoAccesorios: 0,
    costoVidrio: 0,
    costoEmpaque: 0,
    costoMateriales: 0,
    costoManoObra: 0,
    costoTransporte: 0,
    costosAdicionalesDetalle: [],
    costosAdicionalesTotal: 0,
    costoDirecto: 0,
    overheadAbsorbido: 0,
    costoProduccion: 0,
    imprevistosMonto: 0,
    costoTotal: 0,
    utilidadMonto: 0,
    total: 2_786_030,
    areaTotal: 2.8,
    precioPorM2: 995_011,
    valoresPorVentana: [
        { id: "v1", area: 1.8, valor: 1_791_020 },
        { id: "v2", area: 1, valor: 995_010 },
    ],
}

const entrada: EntradaDocumentoCotizacion = {
    proyecto,
    empresa,
    costos,
    contenido: {
        cliente: "Ana López de Pérez",
        fecha: "2026-10-17",
        descripcion: "<b>Ventanas</b> en aluminio",
        mostrarMedidas: true,
        mostrarValores: true,
    },
}

describe("documento de cotización", () => {
    it("arma el encabezado con el cliente y la fecha del contenido", () => {
        const documento = armarDocumentoCotizacion(entrada)
        expect(documento.empresa).toBe(empresa)
        expect(documento.cliente).toBe("Ana López de Pérez")
        expect(documento.proyecto).toBe("Casa López")
        expect(documento.fecha).toBe("17 de octubre de 2026")
        expect(documento.descripcion).toBe("<b>Ventanas</b> en aluminio")
    })

    it("una fila por ventana, con tipo, especificaciones, medidas y valor", () => {
        const [sala, cocina] = armarDocumentoCotizacion(entrada).filas
        expect(sala).toEqual({
            id: "v1",
            nombre: "Sala",
            tipo: "1 Móvil + 1 Fija",
            especificaciones: [
                "Aluminio Negro",
                "Cerradura Manija",
                "Rodachina Metálica",
                "Vidrio 5 mm",
                "Bronce",
                "Sandblasting",
            ],
            ancho: 1500,
            alto: 1200,
            area: 1.8,
            valor: 1_791_020,
        })
        expect(cocina.especificaciones).toEqual([])
        expect(cocina.valor).toBe(995_010)
    })

    it("lleva los totales del costeo", () => {
        const documento = armarDocumentoCotizacion(entrada)
        expect(documento.areaTotal).toBe(2.8)
        expect(documento.total).toBe(2_786_030)
        expect(documento.mostrarValores).toBe(true)
    })

    it("respeta las opciones de mostrar medidas y valores", () => {
        const documento = armarDocumentoCotizacion({
            ...entrada,
            contenido: { ...entrada.contenido, mostrarMedidas: false, mostrarValores: false },
        })
        expect(documento.mostrarMedidas).toBe(false)
        expect(documento.mostrarValores).toBe(false)
    })

    it("sin costeo no muestra valores aunque la opción esté activa", () => {
        const documento = armarDocumentoCotizacion({ ...entrada, costos: null })
        expect(documento.mostrarValores).toBe(false)
        expect(documento.total).toBeNull()
        expect(documento.areaTotal).toBeNull()
        expect(documento.filas.every((fila) => fila.area === null && fila.valor === null)).toBe(true)
    })

    it("cumple su esquema, para poder guardarlo como versión o snapshot", () => {
        const documento = armarDocumentoCotizacion(entrada)
        expect(DocumentoCotizacionSchema.parse(documento)).toEqual(documento)
    })
})
