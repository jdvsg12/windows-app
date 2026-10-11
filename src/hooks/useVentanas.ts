import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
    obtenerDescuentos,
    obtenerPrecios,
    guardarPrecios,
} from "@/lib/storage"
import {
    optimizarCortes,
    calcularAccesorios,
    calcularVidrios,
} from "@/lib/calculo/motor-8025"
import { optimizarLaminasVidrio } from "@/lib/calculo/vidrio"
import {
    agruparPorColorAluminio,
    agruparPorTipoVidrio,
    etiquetarVidrios,
    fusionarLaminasPorTipo,
    fusionarPerfilesPorColor,
} from "@/lib/calculo/grupos"
import type { Proyecto, Ventana, TamanoLamina, LaminaVidrio } from "@/lib/types"
import { TAMANOS_LAMINA } from "@/lib/types"

export function useVentanas(proyectoId: string | null) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])
    // Única fuente del tamaño de lámina (F3.3): precios.tamanoLamina, leído aquí y
    // actualizado a través de actualizarTamanoLamina — ya no un estado local de la página.
    const [precios, setPrecios] = useState(() => obtenerPrecios())

    const { ancho: laminaAncho, alto: laminaAlto } = TAMANOS_LAMINA[precios.tamanoLamina]

    useEffect(() => {
        if (!proyectoId) return
        const proj = obtenerProyectoPorId(proyectoId)
        if (proj) {
            setProyecto(proj)
            setVentanas(proj.ventanas)
        }
    }, [proyectoId])

    // No module-level cache anymore (removed in F3.1): read fresh on every recompute.
    const descuentos = useMemo(() => obtenerDescuentos(), [])

    // Bars per aluminum color and sheets per glass type, the same grouping costeo charges for.
    const optimizacion = useMemo(
        () =>
            ventanas.length > 0
                ? fusionarPerfilesPorColor(
                      agruparPorColorAluminio(ventanas).map(({ color, ventanas: grupo }) => ({
                          color,
                          optimizacion: optimizarCortes(grupo, descuentos),
                      }))
                  )
                : {},
        [ventanas, descuentos]
    )
    const accesorios = useMemo(() => ventanas.length > 0 ? calcularAccesorios(ventanas, descuentos) : null, [ventanas, descuentos])
    const vidriosPorTipo = useMemo(
        () =>
            agruparPorTipoVidrio(ventanas).map(({ etiqueta, ventanas: grupo }) => ({
                etiqueta,
                vidrios: etiquetarVidrios(calcularVidrios(grupo, descuentos), etiqueta),
            })),
        [ventanas, descuentos]
    )
    const vidrios = useMemo(() => vidriosPorTipo.flatMap((grupo) => grupo.vidrios), [vidriosPorTipo])

    // El optimizador lanza si una pieza no cabe en ninguna orientación de la lámina
    // configurada (F3.3): se captura aquí para no tumbar la pestaña de Optimización.
    const { laminasVidrio, errorLaminas } = useMemo((): { laminasVidrio: LaminaVidrio[]; errorLaminas: string | null } => {
        if (vidrios.length === 0) return { laminasVidrio: [], errorLaminas: null }
        const opciones = { laminaAncho, laminaAlto, kerf: precios.kerfVidrio, minResto: precios.minRestoVidrio }
        try {
            return {
                laminasVidrio: fusionarLaminasPorTipo(
                    vidriosPorTipo.map(({ etiqueta, vidrios: grupo }) => ({
                        etiqueta,
                        laminas: optimizarLaminasVidrio(grupo, opciones),
                    }))
                ),
                errorLaminas: null,
            }
        } catch (error) {
            return { laminasVidrio: [], errorLaminas: error instanceof Error ? error.message : String(error) }
        }
    }, [vidrios, vidriosPorTipo, laminaAncho, laminaAlto, precios.kerfVidrio, precios.minRestoVidrio])

    const agregarVentana = useCallback((datos: Omit<Ventana, "id">, editandoId: string | null) => {
        if (!proyecto) return { nuevasVentanas: ventanas, editando: false }

        const nuevaVentana: Ventana = { ...datos, id: editandoId || crypto.randomUUID() }

        let nuevasVentanas: Ventana[]
        if (editandoId) {
            nuevasVentanas = ventanas.map((v) => (v.id === editandoId ? nuevaVentana : v))
        } else {
            nuevasVentanas = [...ventanas, nuevaVentana]
        }

        setVentanas(nuevasVentanas)
        const proyectoActualizado = { ...proyecto, ventanas: nuevasVentanas }
        actualizarProyecto(proyectoActualizado)
        setProyecto(proyectoActualizado)

        return { nuevasVentanas, editando: !!editandoId }
    }, [proyecto, ventanas])

    const eliminarVentana = useCallback((id: string) => {
        if (!proyecto) return

        const nuevasVentanas = ventanas.filter((v) => v.id !== id)
        setVentanas(nuevasVentanas)
        const proyectoActualizado = { ...proyecto, ventanas: nuevasVentanas }
        actualizarProyecto(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto, ventanas])

    const eliminarProyectoActual = useCallback(() => {
        if (!proyecto) return
        eliminarProyecto(proyecto.id)
        setProyecto(null)
        router.push("/")
    }, [proyecto, router])

    const actualizarCliente = useCallback((cliente: string) => {
        if (!proyecto) return
        const proyectoActualizado = { ...proyecto, cliente }
        actualizarProyecto(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto])

    const actualizarDatosProyecto = useCallback((datos: Pick<Proyecto, "duracionMeses" | "transporte">) => {
        if (!proyecto) return
        const proyectoActualizado = { ...proyecto, ...datos }
        actualizarProyecto(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto])

    const actualizarTamanoLamina = useCallback((tamanoLamina: TamanoLamina) => {
        const nuevosPrecios = { ...obtenerPrecios(), tamanoLamina }
        guardarPrecios(nuevosPrecios)
        setPrecios(nuevosPrecios)
    }, [])

    return {
        proyecto,
        ventanas,
        optimizacion,
        accesorios,
        vidrios,
        laminasVidrio,
        errorLaminas,
        tamanoLamina: precios.tamanoLamina,
        agregarVentana,
        eliminarVentana,
        eliminarProyectoActual,
        actualizarCliente,
        actualizarDatosProyecto,
        actualizarTamanoLamina,
    }
}
