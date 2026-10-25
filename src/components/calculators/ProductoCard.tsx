"use client"

import { Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"

interface ProductoCardProps {
    // "V1" para ventanas, "P1" para puertas.
    codigo: string
    nombre: string
    sustantivo: "ventana" | "puerta"
    tipo: string
    lineas: readonly string[]
    activo: boolean
    onEditar: () => void
    onEliminar: () => void
}

export function ProductoCard({ codigo, nombre, sustantivo, tipo, lineas, activo, onEditar, onEliminar }: ProductoCardProps) {
    const titulo = sustantivo === "ventana" ? "Ventana" : "Puerta"
    return (
        <Card className={activo ? "border-primary ring-1 ring-primary" : ""}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold truncate">
                        <span className="mr-1 font-mono text-muted-foreground">{codigo}</span> {nombre}
                    </h3>
                    <Badge variant="secondary" className="shrink-0">
                        {tipo}
                    </Badge>
                </div>
                {lineas.map((linea, indice) => (
                    <p key={indice} className="text-sm text-muted-foreground mb-1 last:mb-3">
                        {linea}
                    </p>
                ))}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onEditar} className="flex-1" aria-label={`Editar ${sustantivo} ${nombre}`}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                    <ConfirmDeleteDialog
                        title={`Eliminar ${titulo}`}
                        description={`¿Estás seguro de que deseas eliminar la ${sustantivo} “${nombre}”? Esta acción no se puede deshacer.`}
                        confirmLabel={`Eliminar ${titulo}`}
                        triggerLabel={`Eliminar ${sustantivo} ${nombre}`}
                        triggerSize="sm"
                        onConfirm={onEliminar}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
