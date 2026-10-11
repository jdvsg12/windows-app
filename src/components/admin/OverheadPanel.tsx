"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, RotateCcw } from "lucide-react"
import { NumberField } from "./NumberField"
import { useOverheadForm } from "./useOverheadForm"
import { FormSkeleton } from "@/components/common/FormSkeleton"
import type { ConfiguracionOverhead } from "@/lib/types"

interface OverheadFieldConfig {
    key: keyof ConfiguracionOverhead
    label: string
}

const SERVICIOS_FIELDS: readonly OverheadFieldConfig[] = [
    { key: "servicioLuz", label: "Luz" },
    { key: "servicioAgua", label: "Agua" },
    { key: "servicioInternet", label: "Internet" },
    { key: "servicioGas", label: "Gas" },
]

const OTROS_FIELDS: readonly OverheadFieldConfig[] = [
    { key: "arriendo", label: "Arriendo" },
    { key: "herramienta", label: "Herramienta" },
    { key: "admin", label: "Administración" },
]

export function OverheadPanel() {
    const { formData, loading, saved, handleChange, handleSave, handleReset } = useOverheadForm()

    const renderFields = (fields: readonly OverheadFieldConfig[]) =>
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
                    <CardTitle className="text-lg">Overhead Mensual del Taller</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Se absorbe por tiempo (overhead × meses de obra), asumiendo siempre una sola obra a la vez.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {renderFields(SERVICIOS_FIELDS)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {renderFields(OTROS_FIELDS)}
                    </div>
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
