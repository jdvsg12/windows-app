import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAutosave } from "@/hooks/useAutosave"
import { cambiosContenido, valoresContenido } from "@/lib/contenido-cotizacion"
import { ContenidoCotizacionFormSchema, type ContenidoCotizacionFormValues } from "@/lib/schemas"
import type { Proyecto } from "@/lib/types"

// Formulario de la pestaña Contenido, guardado solo en el proyecto. Devuelve los valores
// en vivo para que la vista previa y el PDF no esperen al guardado.
export function useContenidoCotizacion(
    proyecto: Proyecto | null,
    // false: no se guardó (almacenamiento lleno); el indicador muestra el error.
    onSave: (cambios: Partial<Proyecto>) => boolean,
) {
    const valoresGuardados = useMemo(
        () => (proyecto ? valoresContenido(proyecto, new Date()) : undefined),
        [proyecto],
    )

    const form = useForm<ContenidoCotizacionFormValues>({
        resolver: zodResolver(ContenidoCotizacionFormSchema),
        values: valoresGuardados,
    })

    const enVivo = form.watch()
    // watch() devuelve {} hasta que el formulario recibe sus valores (un render después de cargar
    // el proyecto): lo escrito va encima de lo guardado para que nunca falte un campo.
    const escritos = Object.fromEntries(
        Object.entries(enVivo).filter(([, valor]) => valor !== undefined),
    ) as Partial<ContenidoCotizacionFormValues>
    const valores: ContenidoCotizacionFormValues | null = valoresGuardados ? { ...valoresGuardados, ...escritos } : null

    // isDirty: el formulario cargando lo que ya está guardado no cuenta como un cambio que guardar.
    const status = useAutosave({
        value: enVivo,
        enabled: form.formState.isDirty,
        onSave: (actuales) => onSave(cambiosContenido(actuales)),
    })

    return { form, valores, status }
}
