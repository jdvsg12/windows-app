import { useEffect, useState } from "react"

import { obtenerDescuentos, guardarDescuentos } from "@/lib/storage"
import { DESCUNTOS_DEFAULT, type DescuentosPorSistema, type DescuentosSistema, type SistemaVentana } from "@/lib/types"
import { useSaveFeedback } from "./useSaveFeedback"

export const SISTEMAS: readonly SistemaVentana[] = ["5020", "744", "8025", "7038"]

export function useDescuentosForm() {
    const [descuentos, setDescuentos] = useState<DescuentosPorSistema>(DESCUNTOS_DEFAULT)
    const [activeTab, setActiveTab] = useState<SistemaVentana>(SISTEMAS[0])
    const [loading, setLoading] = useState(true)
    const { saved, markSaved } = useSaveFeedback()

    useEffect(() => {
        setDescuentos(obtenerDescuentos())
        setLoading(false)
    }, [])

    const handleChange = (field: keyof DescuentosSistema, value: number) => {
        setDescuentos((prev) => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [field]: value },
        }))
    }

    const handleSave = () => {
        guardarDescuentos(descuentos)
        markSaved()
    }

    const handleReset = () => {
        setDescuentos((prev) => ({ ...prev, [activeTab]: DESCUNTOS_DEFAULT[activeTab] }))
    }

    const handleResetAll = () => setDescuentos(DESCUNTOS_DEFAULT)

    return {
        descuentos,
        activeTab,
        setActiveTab,
        loading,
        saved,
        handleChange,
        handleSave,
        handleReset,
        handleResetAll,
    }
}
