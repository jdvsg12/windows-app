import { useState, useEffect, useMemo, useCallback } from "react"
import {
    obtenerConfiguracion,
    guardarConfiguracion,
    obtenerPrecios,
    guardarPrecios,
    obtenerOverhead,
    obtenerDescuentos,
    obtenerFotosProductos,
} from "@/lib/storage"
import { intentarCosteo } from "@/lib/calculo/costeo"
import type { Proyecto, ConfiguracionEmpresa, ConfiguracionPrecios, FotosProductos } from "@/lib/types"

export function useCotizador(proyecto: Proyecto | null) {
    const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null)
    const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null)
    const [fotos, setFotos] = useState<FotosProductos | undefined>(undefined)

    useEffect(() => {
        const configuracion = obtenerConfiguracion()
        setConfig(configuracion)

        const preciosConfig = obtenerPrecios()
        setPrecios(preciosConfig)

        setFotos(obtenerFotosProductos())
    }, [])

    const ventanas = proyecto?.ventanas
    const transporte = proyecto?.transporte
    const duracionMeses = proyecto?.duracionMeses
    // Depende solo de lo que entra al costeo: guardar el contenido de la cotización
    // (cliente, descripción…) actualiza el proyecto pero no recalcula costos.
    const { costos: costosCalculados, error: errorCosteo } = useMemo(
        () =>
            ventanas && precios && transporte !== undefined && duracionMeses !== undefined
                ? intentarCosteo({
                      ventanas,
                      descuentos: obtenerDescuentos(),
                      precios,
                      overhead: obtenerOverhead(),
                      transporteProyecto: transporte,
                      duracionMesesProyecto: duracionMeses,
                  })
                : { costos: null, error: null },
        [ventanas, precios, transporte, duracionMeses]
    )

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

    return {
        config,
        precios,
        fotos,
        costosCalculados,
        errorCosteo,
        updateConfig,
        updatePrecios,
    }
}
