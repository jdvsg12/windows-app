"use client"

import { useState } from "react"
import { Pencil, Grid3X3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteWindowDialog } from "./DeleteWindowDialog"
import { VentanaForm } from "./VentanaForm"
import type { VentanaFormValues } from "@/lib/schemas"
import { getTipoVentanaLabel, type Ventana, type TipoVentana, type SistemaVentana } from "@/lib/types"

interface VentanasTabProps {
    ventanas: Ventana[]
    onAgregar: (nombre: string, ancho: number, alto: number, tipo: TipoVentana, sistema: SistemaVentana, editandoId: string | null) => void
    onEliminar: (id: string) => void
}

export function VentanasTab({ ventanas, onAgregar, onEliminar }: VentanasTabProps) {
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const editingVentana = ventanas.find((ventana) => ventana.id === editandoId) ?? null

    const handleSubmit = ({ nombre, ancho, alto, tipoVentana, sistema }: VentanaFormValues) => {
        onAgregar(nombre, Number.parseFloat(ancho), Number.parseFloat(alto), tipoVentana, sistema, editandoId)
        setEditandoId(null)
    }

    const handleEliminar = (id: string) => {
        if (id === editandoId) setEditandoId(null)
        onEliminar(id)
    }

    return (
        <div className="space-y-4">
            <VentanaForm
                editingVentana={editingVentana}
                onSubmit={handleSubmit}
                onCancelEdit={() => setEditandoId(null)}
            />

            {ventanas.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold">No hay ventanas agregadas</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Usa el formulario de arriba para agregar ventanas
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ventanas.map((ventana) => (
                        <Card
                            key={ventana.id}
                            className={editandoId === ventana.id ? "border-primary ring-1 ring-primary" : ""}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h3 className="font-semibold truncate">{ventana.nombre}</h3>
                                    <Badge variant="secondary" className="shrink-0">
                                        {getTipoVentanaLabel(ventana.tipoVentana)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {ventana.ancho} × {ventana.alto} mm
                                </p>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Sistema: {ventana.sistema || "5020"}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditandoId(ventana.id)}
                                        className="flex-1"
                                        aria-label={`Editar ventana ${ventana.nombre}`}
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Editar
                                    </Button>
                                    <DeleteWindowDialog
                                        windowName={ventana.nombre}
                                        onConfirm={() => handleEliminar(ventana.id)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
