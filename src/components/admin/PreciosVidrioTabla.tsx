"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CALIBRES_VIDRIO, COLORES_VIDRIO, claveVidrio, type ClaveVidrio, type ConfiguracionPrecios } from "@/lib/types"
import { formatCurrency } from "@/lib/format"

interface PreciosVidrioTablaProps {
    precios: ConfiguracionPrecios["preciosVidrio"]
    precioGeneral: number
    onChange: (clave: ClaveVidrio, value: number | undefined) => void
}

// An empty cell means "no specific price": the quote falls back to the general sheet price.
export function PreciosVidrioTabla({ precios, precioGeneral, onChange }: PreciosVidrioTablaProps) {
    const placeholder = precioGeneral > 0 ? formatCurrency(precioGeneral) : "Sin precio"

    const handleInput = (clave: ClaveVidrio, raw: string) => {
        const value = Number(raw)
        onChange(clave, raw === "" || !Number.isFinite(value) || value <= 0 ? undefined : value)
    }

    return (
        <div className="space-y-2">
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-36">Color</TableHead>
                            {CALIBRES_VIDRIO.map(({ value, label }) => (
                                <TableHead key={value} className="min-w-36">
                                    {label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {COLORES_VIDRIO.map((color) => (
                            <TableRow key={color.value}>
                                <TableCell className="font-medium">{color.label}</TableCell>
                                {CALIBRES_VIDRIO.map((calibre) => {
                                    const clave = claveVidrio(color.value, calibre.value)
                                    return (
                                        <TableCell key={clave} className="py-1.5">
                                            <Input
                                                type="number"
                                                min="0"
                                                inputMode="numeric"
                                                aria-label={`Precio lámina ${color.label} ${calibre.label}`}
                                                placeholder={placeholder}
                                                value={precios[clave] ?? ""}
                                                onChange={(e) => handleInput(clave, e.target.value)}
                                            />
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-muted-foreground">
                Precio por lámina completa. Las celdas vacías usan el precio general de lámina.
            </p>
        </div>
    )
}
