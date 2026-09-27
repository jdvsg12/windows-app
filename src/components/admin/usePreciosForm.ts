import { useEffect, useState } from "react"

import { obtenerPrecios, guardarPrecios } from "@/lib/storage"
import type { ConfiguracionPrecios, TamanoLamina } from "@/lib/types"
import { useSaveFeedback } from "./useSaveFeedback"

export interface PreciosFormData {
    precioCabezal: number
    precioSillar: number
    precioJamba: number
    precioEnganche: number
    precioTraslape: number
    precioHorizontalSuperior: number
    precioHorizontalInferior: number
    precioGuia: number
    precioRodachina: number
    precioCerradura: number
    precioTornillo8mm: number
    precioTornillo10mm: number
    precioEmpaque: number
    precioVidrioLamina: number
    tamanoLamina: TamanoLamina
    manoDeObra: number
    imprevistos: number
    utilidad: number
}

const PRECIOS_DEFAULT: PreciosFormData = {
    precioCabezal: 90000,
    precioSillar: 90000,
    precioJamba: 72000,
    precioEnganche: 72000,
    precioTraslape: 72000,
    precioHorizontalSuperior: 60000,
    precioHorizontalInferior: 60000,
    precioGuia: 2000,
    precioRodachina: 8000,
    precioCerradura: 25000,
    precioTornillo8mm: 500,
    precioTornillo10mm: 600,
    precioEmpaque: 3000,
    precioVidrioLamina: 180000,
    tamanoLamina: "2500x3600",
    manoDeObra: 30,
    imprevistos: 0,
    utilidad: 20,
}

const toFormData = (precios: ConfiguracionPrecios): PreciosFormData => ({
    precioCabezal: precios.precioCabezal,
    precioSillar: precios.precioSillar,
    precioJamba: precios.precioJamba,
    precioEnganche: precios.precioEnganche,
    precioTraslape: precios.precioTraslape,
    precioHorizontalSuperior: precios.precioHorizontalSuperior,
    precioHorizontalInferior: precios.precioHorizontalInferior,
    precioGuia: precios.precioGuia,
    precioRodachina: precios.precioRodachina,
    precioCerradura: precios.precioCerradura,
    precioTornillo8mm: precios.precioTornillo8mm,
    precioTornillo10mm: precios.precioTornillo10mm,
    precioEmpaque: precios.precioEmpaque,
    precioVidrioLamina: precios.precioVidrioLamina,
    tamanoLamina: precios.tamanoLamina || PRECIOS_DEFAULT.tamanoLamina,
    manoDeObra: precios.manoDeObra,
    imprevistos: precios.imprevistos,
    utilidad: precios.utilidad,
})

export function usePreciosForm() {
    const [formData, setFormData] = useState<PreciosFormData>(PRECIOS_DEFAULT)
    const [loading, setLoading] = useState(true)
    const { saved, markSaved } = useSaveFeedback()

    useEffect(() => {
        setFormData(toFormData(obtenerPrecios()))
        setLoading(false)
    }, [])

    const handleChange = <K extends keyof PreciosFormData>(field: K, value: PreciosFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Merge over the stored prices so fields this form doesn't edit
    // (e.g. costosAdicionales, managed in the cotizador) are preserved.
    const handleSave = () => {
        guardarPrecios({ ...obtenerPrecios(), ...formData })
        markSaved()
    }

    const handleReset = () => setFormData(PRECIOS_DEFAULT)

    return { formData, loading, saved, handleChange, handleSave, handleReset }
}
