"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { precioDesdeTexto } from "@/lib/precios"

interface PreciosPorTipoProps<K extends string> {
    titulo: string
    idPrefijo: string
    opciones: readonly { value: K; label: string }[]
    precios: Partial<Record<K, number>>
    precioGeneral: number
    onChange: (tipo: K, valor: number | undefined) => void
}

// An empty field means "no own price": the quote uses the general price shown as placeholder.
export function PreciosPorTipo<K extends string>({
    titulo,
    idPrefijo,
    opciones,
    precios,
    precioGeneral,
    onChange,
}: PreciosPorTipoProps<K>) {
    const placeholder = precioGeneral > 0 ? formatCurrency(precioGeneral) : "Sin precio"

    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{titulo}</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {opciones.map(({ value, label }) => {
                    const id = `${idPrefijo}-${value}`
                    return (
                        <div key={value} className="space-y-2">
                            <Label htmlFor={id}>{label}</Label>
                            <Input
                                id={id}
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder={placeholder}
                                value={precios[value] ?? ""}
                                onChange={(e) => onChange(value, precioDesdeTexto(e.target.value))}
                            />
                        </div>
                    )
                })}
            </div>
            <p className="text-xs text-muted-foreground">Vacío = usa el precio general ({placeholder}).</p>
        </fieldset>
    )
}
