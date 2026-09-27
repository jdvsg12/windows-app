"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { EditorTextoEnriquecido } from "@/components/editor-texto-enriquecido"

interface Props {
    fecha: Date
    cliente: string
    descripcion: string
    mostrarMedidas: boolean
    mostrarValores: boolean
    onFechaChange: (fecha: Date) => void
    onClienteChange: (cliente: string) => void
    onDescripcionChange: (descripcion: string) => void
    onMostrarMedidasChange: (mostrar: boolean) => void
    onMostrarValoresChange: (mostrar: boolean) => void
}

export function ContenidoTab({
    fecha,
    cliente,
    descripcion,
    mostrarMedidas,
    mostrarValores,
    onFechaChange,
    onClienteChange,
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
                        <DatePicker value={fecha} onChange={onFechaChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cotizador-cliente">Cliente</Label>
                        <Input
                            id="cotizador-cliente"
                            value={cliente}
                            onChange={(e) => onClienteChange(e.target.value)}
                            placeholder="Nombre del cliente"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cotizador-descripcion">Descripción / Introducción</Label>
                    <EditorTextoEnriquecido
                        id="cotizador-descripcion"
                        ariaLabel="Descripción / Introducción de la cotización"
                        value={descripcion}
                        onChange={onDescripcionChange}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
                    <div className="flex items-center gap-2">
                        <Switch id="mostrar-medidas" checked={mostrarMedidas} onCheckedChange={onMostrarMedidasChange} />
                        <Label htmlFor="mostrar-medidas">Mostrar medidas y área</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch id="mostrar-valores" checked={mostrarValores} onCheckedChange={onMostrarValoresChange} />
                        <Label htmlFor="mostrar-valores">Mostrar valores</Label>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
