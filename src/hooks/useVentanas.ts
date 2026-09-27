import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
    obtenerDescuentos,
} from "@/lib/storage"
import {
    optimizarCortes,
    calcularAccesorios,
    calcularVidrios,
    optimizarLaminasVidrio,
} from "@/lib/calculo/motor-8025"
import type { Proyecto, Ventana, TipoVentana, SistemaVentana, TamanoLamina } from "@/lib/types"
import { TAMANOS_LAMINA } from "@/lib/types"

export function useVentanas(proyectoId: string | null, tamanoLamina?: TamanoLamina) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])

    const actualTamano = tamanoLamina || "2500x3600"
    const { ancho: laminaAncho, alto: laminaAlto } = TAMANOS_LAMINA[actualTamano]

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

    const optimizacion = useMemo(() => ventanas.length > 0 ? optimizarCortes(ventanas, descuentos) : {}, [ventanas, descuentos])
    const accesorios = useMemo(() => ventanas.length > 0 ? calcularAccesorios(ventanas, descuentos) : null, [ventanas, descuentos])
    const vidrios = useMemo(() => ventanas.length > 0 ? calcularVidrios(ventanas, descuentos) : [], [ventanas, descuentos])
    const laminasVidrio = useMemo(() => ventanas.length > 0 ? optimizarLaminasVidrio(ventanas, descuentos, laminaAncho, laminaAlto) : [], [ventanas, descuentos, laminaAncho, laminaAlto])

    const agregarVentana = useCallback((
        nombre: string,
        ancho: number,
        alto: number,
        tipoVentana: TipoVentana,
        sistema: SistemaVentana,
        editandoId: string | null
    ) => {
        if (!proyecto) return { nuevasVentanas: ventanas, editando: false }

        const nuevaVentana: Ventana = {
            id: editandoId || crypto.randomUUID(),
            nombre,
            ancho,
            alto,
            tipoVentana,
            sistema,
        }

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

    return {
        proyecto,
        ventanas,
        optimizacion,
        accesorios,
        vidrios,
        laminasVidrio,
        agregarVentana,
        eliminarVentana,
        eliminarProyectoActual,
        actualizarCliente,
    }
}
