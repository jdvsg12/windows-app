"use client"

import { RotateCcw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormSkeleton } from "@/components/common/FormSkeleton"
import { PUERTA_ALUMINA } from "@/lib/catalogo-alumina"
import type { ParametrosPuertaAlumina } from "@/lib/types"
import { NumberField } from "./NumberField"
import { useParametrosPuertaForm } from "./useParametrosPuertaForm"

interface Campo {
    key: keyof ParametrosPuertaAlumina
    label: string
    hint?: string
}

interface Grupo {
    titulo: string
    descripcion: string
    campos: readonly Campo[]
}

const GRUPOS: readonly Grupo[] = [
    {
        titulo: "Hoja (VP-1102)",
        descripcion: "Se descuenta de las medidas del vano. El marco U-57 va a la medida del vano, sin descuento.",
        campos: [
            { key: "descuentoAnchoHoja", label: "Descuento ancho (mm)" },
            { key: "descuentoAltoHoja", label: "Descuento alto (mm)" },
        ],
    },
    {
        titulo: "Pisavidrio cuadrado",
        descripcion: "Se descuenta de la hoja. Provisional hasta confirmarlo con la ficha técnica de Alumina.",
        campos: [
            { key: "descuentoPisavidrioHorizontal", label: "Descuento horizontal (mm)" },
            { key: "descuentoPisavidrioVertical", label: "Descuento vertical (mm)" },
        ],
    },
    {
        titulo: "Vidrio",
        descripcion: "Se descuenta de la hoja. Provisional hasta confirmarlo con la ficha técnica de Alumina.",
        campos: [
            { key: "descuentoAnchoVidrio", label: "Descuento ancho (mm)" },
            { key: "descuentoAltoVidrio", label: "Descuento alto (mm)" },
        ],
    },
    {
        titulo: "Corte e instalación",
        descripcion: "El espesor de sierra se descuenta en cada corte al acomodar las piezas en barras de 6 m.",
        campos: [
            { key: "espesorSierra", label: "Espesor de sierra (mm)" },
            { key: "tornillosInstalacion", label: 'Tornillos de instalación #10 × 3" por puerta', hint: "Unidades enteras" },
        ],
    },
]

export function ParametrosPuertaPanel() {
    const { formData, loading, saved, error, handleChange, handleSave, handleReset } = useParametrosPuertaForm()

    if (loading) return <FormSkeleton />

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{PUERTA_ALUMINA.nombre}</CardTitle>
                    <CardDescription>Sistema {PUERTA_ALUMINA.sistema.toLowerCase()}. Los cambios se aplican a todas las puertas al recalcular.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {GRUPOS.map(({ titulo, descripcion, campos }) => (
                        <section key={titulo} className="space-y-3">
                            <div>
                                <h3 className="font-semibold">{titulo}</h3>
                                <p className="text-sm text-muted-foreground">{descripcion}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {campos.map(({ key, label, hint }) => (
                                    <NumberField
                                        key={key}
                                        id={`puerta-${key}`}
                                        label={label}
                                        hint={hint}
                                        step={key === "tornillosInstalacion" ? "1" : "0.5"}
                                        value={formData[key]}
                                        onChange={(value) => handleChange(key, value)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
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
