import { useEffect, useState } from "react"

import { obtenerOverhead, guardarOverhead } from "@/lib/storage"
import type { ConfiguracionOverhead } from "@/lib/types"
import { useSaveFeedback } from "./useSaveFeedback"

// Conocidos hoy; arriendo/herramienta/admin quedan en 0 hasta que se definan (D8, F3.2).
const OVERHEAD_DEFAULT: ConfiguracionOverhead = {
    servicioLuz: 300000,
    servicioAgua: 180000,
    servicioInternet: 80000,
    servicioGas: 40000,
    arriendo: 0,
    herramienta: 0,
    admin: 0,
}

export function useOverheadForm() {
    const [formData, setFormData] = useState<ConfiguracionOverhead>(OVERHEAD_DEFAULT)
    const [loading, setLoading] = useState(true)
    const { saved, markSaved } = useSaveFeedback()

    useEffect(() => {
        setFormData(obtenerOverhead())
        setLoading(false)
    }, [])

    const handleChange = <K extends keyof ConfiguracionOverhead>(field: K, value: ConfiguracionOverhead[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = () => {
        guardarOverhead(formData)
        markSaved()
    }

    const handleReset = () => setFormData(OVERHEAD_DEFAULT)

    return { formData, loading, saved, handleChange, handleSave, handleReset }
}
