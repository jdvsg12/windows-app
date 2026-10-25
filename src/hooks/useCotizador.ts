import { useState, useEffect, useMemo, useCallback } from "react"
import { repositorios } from "@/lib/storage"
import { intentarCosteo } from "@/lib/calculo/costeo"
import type {
    Proyecto,
    ConfiguracionEmpresa,
    ConfiguracionOverhead,
    ConfiguracionPrecios,
    DescuentosPorSistema,
    FotosProductos,
} from "@/lib/types"

export function useCotizador(proyecto: Proyecto | null) {
    const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null)
    const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null)
    const [fotos, setFotos] = useState<FotosProductos | undefined>(undefined)
    const [descuentos, setDescuentos] = useState<DescuentosPorSistema | null>(null)
    const [overhead, setOverhead] = useState<ConfiguracionOverhead | null>(null)

    useEffect(() => {
        let cancelado = false
        Promise.all([
            repositorios.configuracion.obtener(),
            repositorios.precios.obtener(),
            repositorios.fotosProductos.obtener(),
            repositorios.descuentos.obtener(),
            repositorios.overhead.obtener(),
        ]).then(([configuracion, preciosConfig, fotosGuardadas, descuentosGuardados, overheadGuardado]) => {
            if (cancelado) return
            setConfig(configuracion)
            setPrecios(preciosConfig)
            setFotos(fotosGuardadas)
            setDescuentos(descuentosGuardados)
            setOverhead(overheadGuardado)
        })
        return () => {
            cancelado = true
        }
    }, [])

    const ventanas = proyecto?.ventanas
    const transporte = proyecto?.transporte
    const duracionMeses = proyecto?.duracionMeses
    // Depende solo de lo que entra al costeo: guardar el contenido de la cotización
    // (cliente, descripción…) actualiza el proyecto pero no recalcula costos.
    const { costos: costosCalculados, error: errorCosteo } = useMemo(
        () =>
            ventanas && precios && descuentos && overhead && transporte !== undefined && duracionMeses !== undefined
                ? intentarCosteo({
                      ventanas,
                      descuentos,
                      precios,
                      overhead,
                      transporteProyecto: transporte,
                      duracionMesesProyecto: duracionMeses,
                  })
                : { costos: null, error: null },
        [ventanas, precios, descuentos, overhead, transporte, duracionMeses]
    )

    const updateConfig = useCallback((updates: Partial<ConfiguracionEmpresa>) => {
        if (!config) return Promise.resolve(false)
        const newConfig = { ...config, ...updates }
        setConfig(newConfig)
        return repositorios.configuracion.guardar(newConfig)
    }, [config])

    const updatePrecios = useCallback((newPrecios: ConfiguracionPrecios) => {
        setPrecios(newPrecios)
        void repositorios.precios.guardar(newPrecios)
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
