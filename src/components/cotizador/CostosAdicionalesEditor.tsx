"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/common/NativeSelect"
import { Plus, X } from "lucide-react"
import type { CostoAdicional } from "@/lib/types"

interface CostosAdicionalesEditorProps {
    costos: readonly CostoAdicional[]
    onChange: (costos: CostoAdicional[]) => void
}

export function CostosAdicionalesEditor({ costos, onChange }: CostosAdicionalesEditorProps) {
    const handleAdd = () => {
        onChange([...costos, { id: crypto.randomUUID(), nombre: "", valor: 0, tipo: "fijo" }])
    }

    const handleUpdate = (id: string, changes: Partial<CostoAdicional>) => {
        onChange(costos.map((costo) => (costo.id === id ? { ...costo, ...changes } : costo)))
    }

    const handleRemove = (id: string) => {
        onChange(costos.filter((costo) => costo.id !== id))
    }

    return (
        <div className="border-t pt-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg border-b pb-2">Costos Adicionales</h3>
                <Button size="sm" variant="outline" onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Costo
                </Button>
            </div>
            <div className="space-y-2">
                {costos.map((costo) => (
                    <div key={costo.id} className="flex flex-wrap items-center gap-2">
                        <Input
                            aria-label="Nombre del costo adicional"
                            placeholder="Nombre del costo"
                            value={costo.nombre}
                            onChange={(e) => handleUpdate(costo.id, { nombre: e.target.value })}
                            className="w-full sm:w-auto sm:flex-1"
                        />
                        <Input
                            type="number"
                            aria-label="Valor del costo adicional"
                            placeholder="Valor"
                            value={costo.valor}
                            onChange={(e) => handleUpdate(costo.id, { valor: Number(e.target.value) })}
                            className="w-28"
                        />
                        <NativeSelect
                            aria-label="Tipo de costo adicional"
                            value={costo.tipo}
                            onChange={(e) => handleUpdate(costo.id, { tipo: e.target.value as CostoAdicional["tipo"] })}
                            className="min-w-32 flex-1 sm:w-44 sm:flex-none"
                        >
                            <option value="fijo">Fijo ($)</option>
                            <option value="porcentaje">Porcentaje (%)</option>
                        </NativeSelect>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Eliminar costo adicional${costo.nombre ? ` ${costo.nombre}` : ""}`}
                            onClick={() => handleRemove(costo.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {costos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No hay costos adicionales configurados
                    </p>
                )}
            </div>
        </div>
    )
}
