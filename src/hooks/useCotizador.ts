import { useState, useEffect, useCallback } from "react"
import {
    obtenerConfiguracion,
    guardarConfiguracion,
    obtenerPrecios,
    guardarPrecios,
    actualizarProyecto,
} from "@/lib/storage"
import {
    optimizarCortes,
    calcularAccesorios,
    calcularVidrios,
    ORDEN_PERFILES,
    optimizarCortesVidrio,
} from "@/lib/calculos"
import type { Proyecto, ConfiguracionEmpresa, ConfiguracionPrecios, CostosCalculadosCotizador } from "@/lib/types"

export function useCotizador(proyecto: Proyecto | null) {
    const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null)
    const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null)
    const [costosCalculados, setCostosCalculados] = useState<CostosCalculadosCotizador | null>(null)

    useEffect(() => {
        const configuracion = obtenerConfiguracion()
        setConfig(configuracion)

        const preciosConfig = obtenerPrecios()
        setPrecios(preciosConfig)
    }, [])

    useEffect(() => {
        if (proyecto && precios) {
            const costos = calcularCostos(proyecto, precios)
            setCostosCalculados(costos)
        }
    }, [proyecto, precios])

    const updateConfig = useCallback((updates: Partial<ConfiguracionEmpresa>) => {
        if (!config) return
        const newConfig = { ...config, ...updates }
        setConfig(newConfig)
        guardarConfiguracion(newConfig)
    }, [config])

    const updatePrecios = useCallback((newPrecios: ConfiguracionPrecios) => {
        setPrecios(newPrecios)
        guardarPrecios(newPrecios)
    }, [])

    const updateCliente = useCallback((cliente: string) => {
        if (!proyecto) return
        const proyectoActualizado = { ...proyecto, cliente }
        actualizarProyecto(proyectoActualizado)
    }, [proyecto])

    return {
        config,
        precios,
        costosCalculados,
        updateConfig,
        updatePrecios,
        updateCliente,
    }
}

function calcularCostos(proyecto: Proyecto, precios: ConfiguracionPrecios): CostosCalculadosCotizador {
    const areaTotalVentanas = proyecto.ventanas.reduce((acc, v) => acc + (v.ancho * v.alto) / 1000000, 0)

    let costoPerfiles = 0
    const optimizacion = optimizarCortes(proyecto.ventanas)

    ORDEN_PERFILES.forEach((perfil) => {
        if (optimizacion[perfil]) {
            const numBarras = optimizacion[perfil].barras.length
            let precioBarra = 0

            switch (perfil) {
                case "Cabezal": precioBarra = precios.precioCabezal; break
                case "Sillar": precioBarra = precios.precioSillar; break
                case "Jamba Izquierda":
                case "Jamba Derecha": precioBarra = precios.precioJamba; break
                case "Enganche": precioBarra = precios.precioEnganche; break
                case "Traslape": precioBarra = precios.precioTraslape; break
                case "Horizontal Superior": precioBarra = precios.precioHorizontalSuperior; break
                case "Horizontal Inferior": precioBarra = precios.precioHorizontalInferior; break
            }

            costoPerfiles += numBarras * precioBarra
        }
    })

    const accesorios = calcularAccesorios(proyecto.ventanas)
    const costoAccesorios =
        accesorios.rodachinas * precios.precioRodachina +
        accesorios.guiasSuperior * precios.precioGuia +
        accesorios.guiasInferior * precios.precioGuia +
        accesorios.tornillosHojas * precios.precioTornillo8mm +
        accesorios.tornillosMarco * precios.precioTornillo8mm +
        accesorios.tornillosInstalacion * precios.precioTornillo10mm +
        accesorios.cerraduras * precios.precioCerradura

    const vidrios = calcularVidrios(proyecto.ventanas)
    let metrosEmpaque = 0
    vidrios.forEach((v) => {
        metrosEmpaque += ((v.ancho * 2 + v.alto * 2) / 1000) || 0
    })

    const laminasVidrio = optimizarCortesVidrio(proyecto.ventanas)
    const numLaminas = laminasVidrio.length
    const costoVidrio = numLaminas * (precios.precioVidrioLamina || 0)

    const costoEmpaque = metrosEmpaque * precios.precioEmpaque
    const costoMateriales = costoPerfiles + costoAccesorios + costoVidrio + costoEmpaque

    const costoManoObra = areaTotalVentanas * precios.manoDeObra
    const costoIndirectos = precios.costosIndirectos || 0

    let costosAdicionalesTotal = 0
    const costosAdicionalesDetalle = (precios.costosAdicionales || []).map((costo) => {
        const valor = costo.tipo === "porcentaje" ? costoMateriales * (costo.valor / 100) : costo.valor
        costosAdicionalesTotal += valor
        return { ...costo, valorCalculado: valor }
    })

    const costoDirecto = costoMateriales + costoManoObra + costoIndirectos + costosAdicionalesTotal
    const utilidadMonto = costoDirecto * (precios.utilidad / 100)
    const precioFinal = costoDirecto + utilidadMonto
    const precioPorM2 = areaTotalVentanas > 0 ? precioFinal / areaTotalVentanas : 0

    const valoresPorVentana = proyecto.ventanas.map((v) => {
        const area = (v.ancho * v.alto) / 1000000
        return { id: v.id, area, valor: area * precioPorM2 }
    })

    return {
        costoPerfiles,
        costoAccesorios,
        costoVidrio,
        costoEmpaque,
        costoMateriales,
        costoManoObra,
        costoIndirectos,
        costosAdicionalesDetalle,
        costosAdicionalesTotal,
        costoDirecto,
        utilidadMonto,
        total: precioFinal,
        areaTotal: areaTotalVentanas,
        precioPorM2,
        valoresPorVentana,
    }
}
