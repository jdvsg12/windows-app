"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { EditorTextoEnriquecido } from "@/components/editor-texto-enriquecido"

interface Props {
    fecha: string
    proyecto: any
    descripcion: string
    mostrarMedidas: boolean
    mostrarValores: boolean
    onFechaChange: (fecha: string) => void
    onDescripcionChange: (descripcion: string) => void
    onMostrarMedidasChange: (mostrar: boolean) => void
    onMostrarValoresChange: (mostrar: boolean) => void
}

export function ContenidoTab({
    fecha,
    proyecto,
    descripcion,
    mostrarMedidas,
    mostrarValores,
    onFechaChange,
    onDescripcionChange,
    onMostrarMedidasChange,
    onMostrarValoresChange,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Contenido de la Cotización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input value={fecha} onChange={(e) => onFechaChange(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Input value={proyecto.cliente} readOnly className="bg-muted" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Descripción / Introducción</Label>
                    <EditorTextoEnriquecido value={descripcion} onChange={onDescripcionChange} />
                </div>

                <div className="flex items-center gap-8 py-4">
                    <div className="flex items-center gap-2">
                        <Switch checked={mostrarMedidas} onCheckedChange={onMostrarMedidasChange} />
                        <Label>Mostrar medidas y área</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch checked={mostrarValores} onCheckedChange={onMostrarValoresChange} />
                        <Label>Mostrar valores</Label>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
