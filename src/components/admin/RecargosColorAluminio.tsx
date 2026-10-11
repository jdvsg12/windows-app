"use client"

import { COLORES_ALUMINIO, type ColorAluminio, type ConfiguracionPrecios } from "@/lib/types"
import { NumberField } from "./NumberField"

interface RecargosColorAluminioProps {
    recargos: ConfiguracionPrecios["recargosColorAluminio"]
    onChange: (color: ColorAluminio, value: number) => void
}

export function RecargosColorAluminio({ recargos, onChange }: RecargosColorAluminioProps) {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {COLORES_ALUMINIO.map(({ value, label }) => (
                    <NumberField
                        key={value}
                        id={`recargo-${value}`}
                        label={`${label} (%)`}
                        value={recargos[value] ?? 0}
                        onChange={(recargo) => onChange(value, recargo)}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
                Recargo sobre el precio de cada perfil según el color del aluminio. 0 % = precio base de arriba.
            </p>
        </div>
    )
}
