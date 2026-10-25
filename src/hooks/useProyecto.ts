import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { eliminarProyecto, repositorios } from "@/lib/storage"
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

        let cancelado = false
        repositorios.proyectos.obtener(proyectoId).then((proj) => {
            if (cancelado) return
            if (proj) {
                setProyecto(proj)
            } else {
                router.push("/")
            }
            setIsLoading(false)
        })
        return () => {
            cancelado = true
        }
    }, [proyectoId, router])

    // Siempre sobre el proyecto más reciente: quien llama después de un await (el PDF tarda) no
    // puede pisar con una copia vieja lo que guardó mientras tanto el autoguardado.
    const ultimo = useRef(proyecto)
    useEffect(() => {
        ultimo.current = proyecto
    }, [proyecto])

    // El estado cambia al instante; la promesa dice si quedó guardado (para el indicador).
    const update = useCallback((updates: Partial<Proyecto>): Promise<boolean> => {
        if (!ultimo.current) return Promise.resolve(false)
        const updated = { ...ultimo.current, ...updates }
        ultimo.current = updated
        setProyecto(updated)
        return repositorios.proyectos.actualizar(updated)
    }, [])

    const remove = useCallback(async () => {
        if (!proyecto) return
        await eliminarProyecto(proyecto.id)
        setProyecto(null)
        router.push("/")
    }, [proyecto, router])

    return { proyecto, isLoading, update, remove }
}
