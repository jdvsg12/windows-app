import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
} from "@/lib/storage"
import {
    optimizarCortes,
    calcularAccesorios,
    calcularVidrios,
    optimizarLaminasVidrio,
} from "@/lib/calculos"
import type { Proyecto, Ventana, TipoVentana, SistemaVentana } from "@/lib/types"

export function useVentanas(proyectoId: string | null) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])

    useEffect(() => {
        if (!proyectoId) return
        const proj = obtenerProyectoPorId(proyectoId)
        if (proj) {
            setProyecto(proj)
            setVentanas(proj.ventanas)
        }
    }, [proyectoId])

    const optimizacion = useMemo(() => ventanas.length > 0 ? optimizarCortes(ventanas) : {}, [ventanas])
    const accesorios = useMemo(() => ventanas.length > 0 ? calcularAccesorios(ventanas) : null, [ventanas])
    const vidrios = useMemo(() => ventanas.length > 0 ? calcularVidrios(ventanas) : [], [ventanas])
    const laminasVidrio = useMemo(() => ventanas.length > 0 ? optimizarLaminasVidrio(ventanas) : [], [ventanas])

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
