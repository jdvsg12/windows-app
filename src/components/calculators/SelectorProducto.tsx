"use client"

import { AppWindow, DoorOpen, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { PUERTA_ALUMINA } from "@/lib/catalogo-alumina"

export type ProductoAgregable = "ventana" | "puerta"

interface OpcionProducto {
    value: ProductoAgregable
    nombre: string
    detalle: string
    Icono: LucideIcon
}

const OPCIONES: readonly OpcionProducto[] = [
    { value: "ventana", nombre: "Ventana corrediza", detalle: "Sistema 80-25, de 2 a 6 hojas", Icono: AppWindow },
    { value: "puerta", nombre: PUERTA_ALUMINA.nombre, detalle: `Sistema ${PUERTA_ALUMINA.sistema.toLowerCase()}, una hoja con vidrio`, Icono: DoorOpen },
]

interface SelectorProductoProps {
    value: ProductoAgregable
    onChange: (producto: ProductoAgregable) => void
    // Mientras se edita un producto no se puede cambiar de tipo: se perdería lo que se está editando.
    disabled?: boolean
}

export function SelectorProducto({ value, onChange, disabled = false }: SelectorProductoProps) {
    return (
        <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <legend className="sr-only">Producto a agregar</legend>
            {OPCIONES.map(({ value: opcion, nombre, detalle, Icono }) => {
                const elegido = opcion === value
                return (
                    <label
                        key={opcion}
                        className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                            elegido ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted",
                            "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
                        )}
                    >
                        <input
                            type="radio"
                            name="producto-a-agregar"
                            value={opcion}
                            checked={elegido}
                            disabled={disabled && !elegido}
                            onChange={() => onChange(opcion)}
                            className="sr-only"
                        />
                        <span
                            className={cn(
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
                                elegido ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                            )}
                        >
                            <Icono className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span>
                            <span className="block font-semibold">{nombre}</span>
                            <span className="block text-sm text-muted-foreground">{detalle}</span>
                        </span>
                    </label>
                )
            })}
        </fieldset>
    )
}
