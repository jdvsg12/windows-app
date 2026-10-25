import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
} from "@/lib/storage"
import type { Proyecto } from "@/lib/types"

export function useProyecto(proyectoId: string | null) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!proyectoId) {
            router.push("/")
            return
        }

        const proj = obtenerProyectoPorId(proyectoId)
        if (proj) {
            setProyecto(proj)
        } else {
            router.push("/")
        }
        setIsLoading(false)
    }, [proyectoId, router])

    // Siempre sobre el proyecto más reciente: quien llama después de un await (el PDF tarda) no
    // puede pisar con una copia vieja lo que guardó mientras tanto el autoguardado.
    const ultimo = useRef(proyecto)
    useEffect(() => {
        ultimo.current = proyecto
    }, [proyecto])

    const update = useCallback((updates: Partial<Proyecto>): boolean => {
        if (!ultimo.current) return false
        const updated = { ...ultimo.current, ...updates }
        ultimo.current = updated
        const guardado = actualizarProyecto(updated)
        setProyecto(updated)
        return guardado
    }, [])

    const remove = useCallback(() => {
        if (!proyecto) return
        eliminarProyecto(proyecto.id)
        setProyecto(null)
        router.push("/")
    }, [proyecto, router])

    return { proyecto, isLoading, update, remove }
}
