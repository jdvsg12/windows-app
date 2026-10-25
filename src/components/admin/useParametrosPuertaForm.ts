import { useEffect, useState } from "react"

import { repositorios } from "@/lib/storage"
import { DOCUMENTOS } from "@/lib/repositorios/documentos"
import { ParametrosPuertaAluminaSchema } from "@/lib/schemas"
import type { ParametrosPuertaAlumina } from "@/lib/types"
import { useSaveFeedback } from "./useSaveFeedback"

const PREDETERMINADOS = DOCUMENTOS.parametrosPuertaAlumina.predeterminado

export function useParametrosPuertaForm() {
    const [formData, setFormData] = useState<ParametrosPuertaAlumina>(PREDETERMINADOS)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { saved, markSaved } = useSaveFeedback()

    useEffect(() => {
        let cancelado = false
        repositorios.parametrosPuertaAlumina.obtener().then((guardado) => {
            if (cancelado) return
            setFormData(guardado)
            setLoading(false)
        })
        return () => {
            cancelado = true
        }
    }, [])

    const handleChange = <K extends keyof ParametrosPuertaAlumina>(field: K, value: ParametrosPuertaAlumina[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // La validación es la del esquema: descuentos y sierra sin negativos, tornillos enteros.
    const handleSave = async () => {
        const resultado = ParametrosPuertaAluminaSchema.safeParse(formData)
        if (!resultado.success) {
            setError("Revisa los valores: no pueden ser negativos y los tornillos van en unidades enteras.")
            return
        }
        setError(null)
        if (await repositorios.parametrosPuertaAlumina.guardar(resultado.data)) markSaved()
    }

    const handleReset = () => setFormData(PREDETERMINADOS)

    return { formData, loading, saved, error, handleChange, handleSave, handleReset }
}
