"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TAMANOS_LAMINA, type TamanoLamina } from "@/lib/types"
import { Save, RotateCcw } from "lucide-react"
import { NumberField } from "./NumberField"
import { usePreciosForm, type PreciosFormData } from "./usePreciosForm"
import { FormSkeleton } from "@/components/common/FormSkeleton"

type NumericPrecioKey = Exclude<keyof PreciosFormData, "tamanoLamina">

interface NumericFieldConfig {
    key: NumericPrecioKey
    label: string
}

const PERFILES_FIELDS: readonly NumericFieldConfig[] = [
    { key: "precioCabezal", label: "Cabezal" },
    { key: "precioSillar", label: "Sillar" },
    { key: "precioJamba", label: "Jamba" },
    { key: "precioEnganche", label: "Enganche" },
    { key: "precioTraslape", label: "Traslape" },
    { key: "precioHorizontalSuperior", label: "Horizontal Superior" },
    { key: "precioHorizontalInferior", label: "Horizontal Inferior" },
    { key: "precioGuia", label: "Guía" },
]

const ACCESORIOS_FIELDS: readonly NumericFieldConfig[] = [
    { key: "precioRodachina", label: "Rodachina" },
    { key: "precioCerradura", label: "Cerradura" },
    { key: "precioTornillo8mm", label: "Tornillo 8mm" },
    { key: "precioTornillo10mm", label: "Tornillo 10mm" },
    { key: "precioEmpaque", label: "Empaque (metro)" },
]

const COSTOS_FIELDS: readonly NumericFieldConfig[] = [
    { key: "manoDeObra", label: "Mano de Obra (por m²)" },
    { key: "imprevistos", label: "Imprevistos (%)" },
    { key: "utilidad", label: "Utilidad (%)" },
]

export function PreciosPanel() {
    const { formData, loading, saved, handleChange, handleSave, handleReset } = usePreciosForm()

    const renderFields = (fields: readonly NumericFieldConfig[]) =>
        fields.map(({ key, label }) => (
            <NumberField
                key={key}
                id={key}
                label={label}
                value={formData[key]}
                onChange={(value) => handleChange(key, value)}
            />
        ))

    if (loading) return <FormSkeleton />

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Perfiles (precios por unidad - metros)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderFields(PERFILES_FIELDS)}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Accesorios (precios por unidad)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderFields(ACCESORIOS_FIELDS)}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Vidrio y Mano de Obra</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <NumberField
                        id="precioVidrioLamina"
                        label="Precio por Lama de Vidrio"
                        value={formData.precioVidrioLamina}
                        onChange={(value) => handleChange("precioVidrioLamina", value)}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="tamanoLamina">Tamaño de Lama</Label>
                        <Select
                            value={formData.tamanoLamina}
                            onValueChange={(value) => handleChange("tamanoLamina", value as TamanoLamina)}
                        >
                            <SelectTrigger id="tamanoLamina">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TAMANOS_LAMINA).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {renderFields(COSTOS_FIELDS)}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Restablecer Valores
                </Button>
                <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Guardado!" : "Guardar Cambios"}
                </Button>
            </div>
        </div>
    )
}
