import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { eliminarProyecto, repositorios } from "@/lib/storage"
import { DOCUMENTOS } from "@/lib/repositorios/documentos"
import { useCalculo } from "@/hooks/useCalculo"
import type { Proyecto, Ventana, TamanoLamina } from "@/lib/types"

export function useVentanas(proyectoId: string | null) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])
    // Única fuente del tamaño de lámina (F3.3): precios.tamanoLamina, leído aquí y
    // actualizado a través de actualizarTamanoLamina — ya no un estado local de la página.
    // Los predeterminados valen hasta que llega lo guardado (el mismo tick que el proyecto).
    const [precios, setPrecios] = useState(DOCUMENTOS.precios.predeterminado)
    const [descuentos, setDescuentos] = useState(DOCUMENTOS.descuentos.predeterminado)

    useEffect(() => {
        let cancelado = false
        Promise.all([repositorios.precios.obtener(), repositorios.descuentos.obtener()]).then(([guardados, descuentosGuardados]) => {
            if (cancelado) return
            setPrecios(guardados)
            setDescuentos(descuentosGuardados)
        })
        return () => {
            cancelado = true
        }
    }, [])

    useEffect(() => {
        // Sin id (el enlace "Calculadora") o con un id que no existe, no puede quedar abierto el
        // proyecto anterior: la página lo mostraría y "Cotizar" iría a /cotizador?id=null.
        let cancelado = false
        const cargar = proyectoId ? repositorios.proyectos.obtener(proyectoId) : Promise.resolve(null)
        cargar.then((proj) => {
            if (cancelado) return
            setProyecto(proj)
            setVentanas(proj?.ventanas ?? [])
        })
        return () => {
            cancelado = true
        }
    }, [proyectoId])

    const { optimizacion, accesorios, vidrios, laminasVidrio, metricasVidrio, errorLaminas } = useCalculo(ventanas, precios, descuentos)

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
        void repositorios.proyectos.actualizar(proyectoActualizado)
        setProyecto(proyectoActualizado)

        return { nuevasVentanas, editando: !!editandoId }
    }, [proyecto, ventanas])

    const eliminarVentana = useCallback((id: string) => {
        if (!proyecto) return

        const nuevasVentanas = ventanas.filter((v) => v.id !== id)
        setVentanas(nuevasVentanas)
        const proyectoActualizado = { ...proyecto, ventanas: nuevasVentanas }
        void repositorios.proyectos.actualizar(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto, ventanas])

    const eliminarProyectoActual = useCallback(async () => {
        if (!proyecto) return
        await eliminarProyecto(proyecto.id)
        setProyecto(null)
        router.push("/")
    }, [proyecto, router])

    const actualizarCliente = useCallback((cliente: string) => {
        if (!proyecto) return
        const proyectoActualizado = { ...proyecto, cliente }
        void repositorios.proyectos.actualizar(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto])

    const actualizarDatosProyecto = useCallback((datos: Pick<Proyecto, "duracionMeses" | "transporte">) => {
        if (!proyecto) return
        const proyectoActualizado = { ...proyecto, ...datos }
        void repositorios.proyectos.actualizar(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto])

    // Sobre los precios guardados, no la copia local: otra pestaña (Admin) pudo cambiarlos.
    const actualizarTamanoLamina = useCallback(async (tamanoLamina: TamanoLamina) => {
        const nuevosPrecios = { ...(await repositorios.precios.obtener()), tamanoLamina }
        setPrecios(nuevosPrecios)
        await repositorios.precios.guardar(nuevosPrecios)
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
