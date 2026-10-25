import { useEffect, useState } from "react"

import { repositorios } from "@/lib/storage"
import { conPrecioOpcional } from "@/lib/precios"
import type {
    ClaveVidrio,
    ColorAluminio,
    ConfiguracionPrecios,
    TamanoLamina,
    TipoCerradura,
    TipoRodachina,
} from "@/lib/types"
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
    preciosVidrio: ConfiguracionPrecios["preciosVidrio"]
    precioSandblasting: number
    recargosColorAluminio: ConfiguracionPrecios["recargosColorAluminio"]
    preciosCerradura: ConfiguracionPrecios["preciosCerradura"]
    preciosRodachina: ConfiguracionPrecios["preciosRodachina"]
    tamanoLamina: TamanoLamina
    kerfVidrio: number
    minRestoVidrio: number
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
    preciosVidrio: {},
    precioSandblasting: 0,
    recargosColorAluminio: {},
    preciosCerradura: {},
    preciosRodachina: {},
    tamanoLamina: "2500x3600",
    kerfVidrio: 0,
    minRestoVidrio: 200,
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
    preciosVidrio: precios.preciosVidrio ?? {},
    precioSandblasting: precios.precioSandblasting ?? 0,
    recargosColorAluminio: precios.recargosColorAluminio ?? {},
    preciosCerradura: precios.preciosCerradura ?? {},
    preciosRodachina: precios.preciosRodachina ?? {},
    tamanoLamina: precios.tamanoLamina || PRECIOS_DEFAULT.tamanoLamina,
    kerfVidrio: precios.kerfVidrio,
    minRestoVidrio: precios.minRestoVidrio,
    manoDeObra: precios.manoDeObra,
    imprevistos: precios.imprevistos,
    utilidad: precios.utilidad,
})

export function usePreciosForm() {
    const [formData, setFormData] = useState<PreciosFormData>(PRECIOS_DEFAULT)
    const [loading, setLoading] = useState(true)
    const { saved, markSaved } = useSaveFeedback()

    useEffect(() => {
        let cancelado = false
        repositorios.precios.obtener().then((guardado) => {
            if (cancelado) return
            setFormData(toFormData(guardado))
            setLoading(false)
        })
        return () => {
            cancelado = true
        }
    }, [])

    const handleChange = <K extends keyof PreciosFormData>(field: K, value: PreciosFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handlePrecioVidrioChange = (clave: ClaveVidrio, value: number | undefined) => {
        setFormData((prev) => ({ ...prev, preciosVidrio: conPrecioOpcional(prev.preciosVidrio, clave, value) }))
    }

    const handlePrecioCerraduraChange = (tipo: TipoCerradura, value: number | undefined) => {
        setFormData((prev) => ({ ...prev, preciosCerradura: conPrecioOpcional(prev.preciosCerradura, tipo, value) }))
    }

    const handlePrecioRodachinaChange = (tipo: TipoRodachina, value: number | undefined) => {
        setFormData((prev) => ({ ...prev, preciosRodachina: conPrecioOpcional(prev.preciosRodachina, tipo, value) }))
    }

    const handleRecargoColorChange = (color: ColorAluminio, value: number) => {
        setFormData((prev) => ({ ...prev, recargosColorAluminio: { ...prev.recargosColorAluminio, [color]: value } }))
    }

    // Merge over the stored prices so fields this form doesn't edit
    // (e.g. costosAdicionales, managed in the cotizador) are preserved.
    const handleSave = async () => {
        if (await repositorios.precios.guardar({ ...(await repositorios.precios.obtener()), ...formData })) markSaved()
    }

    const handleReset = () => setFormData(PRECIOS_DEFAULT)

    return {
        formData,
        loading,
        saved,
        handleChange,
        handlePrecioVidrioChange,
        handlePrecioCerraduraChange,
        handlePrecioRodachinaChange,
        handleRecargoColorChange,
        handleSave,
        handleReset,
    }
}
