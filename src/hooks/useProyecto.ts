import { useState, useEffect, useCallback } from "react"
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

    const update = useCallback((updates: Partial<Proyecto>) => {
        if (!proyecto) return
        const updated = { ...proyecto, ...updates }
        actualizarProyecto(updated)
        setProyecto(updated)
    }, [proyecto])

    const remove = useCallback(() => {
        if (!proyecto) return
        eliminarProyecto(proyecto.id)
        setProyecto(null)
        router.push("/")
    }, [proyecto, router])

    return { proyecto, isLoading, update, remove }
}
