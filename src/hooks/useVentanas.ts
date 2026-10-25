import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { eliminarProyecto, repositorios } from "@/lib/storage"
import { DOCUMENTOS } from "@/lib/repositorios/documentos"
import { useCalculo } from "@/hooks/useCalculo"
import type { Proyecto, Puerta, Ventana, TamanoLamina } from "@/lib/types"

const SIN_PUERTAS: Puerta[] = []

export function useVentanas(proyectoId: string | null) {
    const router = useRouter()
    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])
    // Única fuente del tamaño de lámina (F3.3): precios.tamanoLamina, leído aquí y
    // actualizado a través de actualizarTamanoLamina — ya no un estado local de la página.
    // Los predeterminados valen hasta que llega lo guardado (el mismo tick que el proyecto).
    const [precios, setPrecios] = useState(DOCUMENTOS.precios.predeterminado)
    const [descuentos, setDescuentos] = useState(DOCUMENTOS.descuentos.predeterminado)
    const [parametrosPuerta, setParametrosPuerta] = useState(DOCUMENTOS.parametrosPuertaAlumina.predeterminado)

    useEffect(() => {
        let cancelado = false
        Promise.all([
            repositorios.precios.obtener(),
            repositorios.descuentos.obtener(),
            repositorios.parametrosPuertaAlumina.obtener(),
        ]).then(([guardados, descuentosGuardados, parametrosGuardados]) => {
            if (cancelado) return
            setPrecios(guardados)
            setDescuentos(descuentosGuardados)
            setParametrosPuerta(parametrosGuardados)
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

    const puertas = proyecto?.puertas ?? SIN_PUERTAS
    const plan = useCalculo(ventanas, precios, descuentos, puertas, parametrosPuerta)

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
    // Las puertas viven en el proyecto, igual que las ventanas.
    const agregarPuerta = useCallback((datos: Omit<Puerta, "id">, editandoId: string | null) => {
        if (!proyecto) return
        const nueva: Puerta = { ...datos, id: editandoId || crypto.randomUUID() }
        const nuevasPuertas = editandoId ? puertas.map((puerta) => (puerta.id === editandoId ? nueva : puerta)) : [...puertas, nueva]
        const proyectoActualizado = { ...proyecto, puertas: nuevasPuertas }
        void repositorios.proyectos.actualizar(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto, puertas])

    const eliminarPuerta = useCallback((id: string) => {
        if (!proyecto) return
        const proyectoActualizado = { ...proyecto, puertas: puertas.filter((puerta) => puerta.id !== id) }
        void repositorios.proyectos.actualizar(proyectoActualizado)
        setProyecto(proyectoActualizado)
    }, [proyecto, puertas])

    const actualizarTamanoLamina = useCallback(async (tamanoLamina: TamanoLamina) => {
        const nuevosPrecios = { ...(await repositorios.precios.obtener()), tamanoLamina }
        setPrecios(nuevosPrecios)
        await repositorios.precios.guardar(nuevosPrecios)
    }, [])

    return {
        proyecto,
        ventanas,
        puertas,
        parametrosPuerta,
        optimizacion: plan.optimizacion,
        accesorios: plan.accesorios,
        vidrios: plan.vidrios,
        laminasVidrio: plan.laminasVidrio,
        metricasVidrio: plan.metricasVidrio,
        errorLaminas: plan.errorLaminas,
        planPuertas: plan.puertas,
        tamanoLamina: precios.tamanoLamina,
        agregarVentana,
        eliminarVentana,
        agregarPuerta,
        eliminarPuerta,
        eliminarProyectoActual,
        actualizarCliente,
        actualizarDatosProyecto,
        actualizarTamanoLamina,
    }
}
