import { useState, useEffect, useCallback } from "react"
import {
    obtenerConfiguracion,
    guardarConfiguracion,
    obtenerPrecios,
    guardarPrecios,
    obtenerOverhead,
    obtenerDescuentos,
    actualizarProyecto,
} from "@/lib/storage"
import { calcularCosteo } from "@/lib/calculo/costeo"
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
            const costos = calcularCosteo({
                ventanas: proyecto.ventanas,
                descuentos: obtenerDescuentos(),
                precios,
                overhead: obtenerOverhead(),
                transporteProyecto: proyecto.transporte,
                duracionMesesProyecto: proyecto.duracionMeses,
            })
            setCostosCalculados(costos)
        }
    }, [proyecto, precios])

    const updateConfig = useCallback((updates: Partial<ConfiguracionEmpresa>) => {
        if (!config) return false
        const newConfig = { ...config, ...updates }
        setConfig(newConfig)
        return guardarConfiguracion(newConfig)
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
