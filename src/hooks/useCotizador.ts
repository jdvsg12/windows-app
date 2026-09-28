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
    const [errorCosteo, setErrorCosteo] = useState<string | null>(null)

    useEffect(() => {
        const configuracion = obtenerConfiguracion()
        setConfig(configuracion)

        const preciosConfig = obtenerPrecios()
        setPrecios(preciosConfig)
    }, [])

    useEffect(() => {
        if (proyecto && precios) {
            try {
                const costos = calcularCosteo({
                    ventanas: proyecto.ventanas,
                    descuentos: obtenerDescuentos(),
                    precios,
                    overhead: obtenerOverhead(),
                    transporteProyecto: proyecto.transporte,
                    duracionMesesProyecto: proyecto.duracionMeses,
                })
                setCostosCalculados(costos)
                setErrorCosteo(null)
            } catch (error) {
                // Una pieza de vidrio que no cabe en la lámina configurada (F3.3) no debe
                // tumbar el cotizador: se muestra el error en vez de un costo silenciosamente mal.
                setCostosCalculados(null)
                setErrorCosteo(error instanceof Error ? error.message : String(error))
            }
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
        errorCosteo,
        updateConfig,
        updatePrecios,
        updateCliente,
    }
}
