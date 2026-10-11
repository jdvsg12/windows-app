import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
    obtenerPrecios,
    guardarPrecios,
} from "@/lib/storage"
import { useCalculo } from "@/hooks/useCalculo"
import type { Proyecto, Ventana, TamanoLamina } from "@/lib/types"

export function useVentanas(proyectoId: string | null) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])
    // Única fuente del tamaño de lámina (F3.3): precios.tamanoLamina, leído aquí y
    // actualizado a través de actualizarTamanoLamina — ya no un estado local de la página.
    const [precios, setPrecios] = useState(() => obtenerPrecios())

    useEffect(() => {
        if (!proyectoId) return
        const proj = obtenerProyectoPorId(proyectoId)
        if (proj) {
            setProyecto(proj)
            setVentanas(proj.ventanas)
        }
    }, [proyectoId])

    const { optimizacion, accesorios, vidrios, laminasVidrio, metricasVidrio, errorLaminas } = useCalculo(ventanas, precios)

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
        metricasVidrio,
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
