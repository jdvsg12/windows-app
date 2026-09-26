"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DescuentosSistema, SistemaVentana } from "@/lib/types"
import { NumberField } from "./NumberField"

interface DescuentoFieldConfig {
    key: keyof DescuentosSistema
    label: string
    hint?: string
    step?: string
}

interface DescuentoSection {
    title: string
    gridClassName: string
    fields: readonly DescuentoFieldConfig[]
    extra?: "horizontalAutomatico"
}

const SECTIONS: readonly DescuentoSection[] = [
    {
        title: "Marco",
        gridClassName: "grid-cols-1 md:grid-cols-2",
        fields: [{ key: "jamba", label: "Jamba (mm)", hint: "Descuento vertical en jambas" }],
        extra: "horizontalAutomatico",
    },
    {
        title: "Enganches (Naves)",
        gridClassName: "grid-cols-2 md:grid-cols-3",
        fields: [
            { key: "engancheNormal", label: "Normal (mm)", hint: "Hojas móviles" },
            { key: "engancheParche", label: "Parche (mm)", hint: "Punto fijo" },
        ],
    },
    {
        title: "Traslapes (Naves)",
        gridClassName: "grid-cols-2 md:grid-cols-3",
        fields: [
            { key: "traslapeNormal", label: "Normal (mm)", hint: "Hojas móviles" },
            { key: "traslapeParche", label: "Parche (mm)", hint: "Punto fijo" },
        ],
    },
    {
        title: "Vidrio",
        gridClassName: "grid-cols-2 md:grid-cols-3",
        fields: [{ key: "anchoVidrio", label: "Ancho Vidrio (mm)", step: "0.1" }],
    },
]

interface DescuentosSistemaCardProps {
    sistema: SistemaVentana
    values: DescuentosSistema
    onChange: (field: keyof DescuentosSistema, value: number) => void
}

export function DescuentosSistemaCard({ sistema, values, onChange }: DescuentosSistemaCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Descuentos del Sistema {sistema}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <h4 className="font-medium mb-3 text-sm text-muted-foreground">{section.title}</h4>
                        <div className={`grid gap-4 ${section.gridClassName}`}>
                            {section.fields.map(({ key, label, hint, step }) => (
                                <NumberField
                                    key={key}
                                    id={key}
                                    label={label}
                                    hint={hint}
                                    step={step}
                                    value={values[key]}
                                    onChange={(value) => onChange(key, value)}
                                />
                            ))}
                            {section.extra === "horizontalAutomatico" && (
                                <div className="space-y-2">
                                    <Label>Horizontal Superior/Inferior</Label>
                                    <Input disabled value="(ancho/hojas) + 10mm" />
                                    <p className="text-xs text-muted-foreground">Cálculo automático, no editable</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
