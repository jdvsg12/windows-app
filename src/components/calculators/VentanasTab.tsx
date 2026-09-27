"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Grid3X3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { EmptyState } from "@/components/common/EmptyState"
import { SaveIndicator } from "@/components/common/SaveIndicator"
import { useAutosave } from "@/hooks/useAutosave"
import { DeleteWindowDialog } from "./DeleteWindowDialog"
import { VentanaForm } from "./VentanaForm"
import { z } from "zod"
import type { VentanaFormValues } from "@/lib/schemas"
import { getTipoVentanaLabel, type Proyecto, type Ventana, type TipoVentana, type SistemaVentana } from "@/lib/types"

const DatosProyectoSchema = z.object({
    duracionMeses: z.number().positive(),
    transporte: z.number().min(0),
})
type DatosProyectoValues = z.infer<typeof DatosProyectoSchema>

interface VentanasTabProps {
    proyecto: Proyecto
    ventanas: Ventana[]
    onAgregar: (nombre: string, ancho: number, alto: number, tipo: TipoVentana, sistema: SistemaVentana, editandoId: string | null) => void
    onEliminar: (id: string) => void
    onActualizarDatosProyecto: (datos: DatosProyectoValues) => void
}

export function VentanasTab({ proyecto, ventanas, onAgregar, onEliminar, onActualizarDatosProyecto }: VentanasTabProps) {
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const editingVentana = ventanas.find((ventana) => ventana.id === editandoId) ?? null

    const datosForm = useForm<DatosProyectoValues>({
        resolver: zodResolver(DatosProyectoSchema),
        values: { duracionMeses: proyecto.duracionMeses, transporte: proyecto.transporte },
    })
    const datosStatus = useAutosave({ value: datosForm.watch(), onSave: onActualizarDatosProyecto })

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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Datos del Proyecto</CardTitle>
                    <SaveIndicator status={datosStatus} />
                </CardHeader>
                <CardContent>
                    <Form {...datosForm}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={datosForm.control}
                                name="duracionMeses"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duración estimada (meses)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={datosForm.control}
                                name="transporte"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transporte ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="1000"
                                                min="0"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Form>
                </CardContent>
            </Card>

            <VentanaForm
                editingVentana={editingVentana}
                onSubmit={handleSubmit}
                onCancelEdit={() => setEditandoId(null)}
            />

            {ventanas.length === 0 ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            size="compact"
                            icon={Grid3X3}
                            title="No hay ventanas agregadas"
                            description="Usa el formulario de arriba para agregar ventanas"
                        />
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
