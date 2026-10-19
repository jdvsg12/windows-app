import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CampoImagenProps {
    id: string
    etiqueta: string
    imagen?: string
    descripcion: string
    ayuda: string
    error: string | null
    onArchivo: (evento: React.ChangeEvent<HTMLInputElement>) => void
    onQuitar?: () => void
}

export function CampoImagen({ id, etiqueta, imagen, descripcion, ayuda, error, onArchivo, onQuitar }: CampoImagenProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{etiqueta}</Label>
            <div className="flex items-center gap-4">
                {imagen && (
                    <div className="w-20 h-20 border rounded-md overflow-hidden bg-paper">
                        <img src={imagen} alt={descripcion} className="w-full h-full object-contain" />
                    </div>
                )}
                <div className="flex-1">
                    <Input id={id} type="file" accept="image/*" onChange={onArchivo} />
                    <p className="text-xs text-muted-foreground mt-1">{ayuda}</p>
                    {error && <p role="alert" className="text-sm text-destructive mt-1">{error}</p>}
                    {imagen && onQuitar && (
                        <Button type="button" variant="ghost" size="sm" className="mt-1 px-0" onClick={onQuitar}>
                            Quitar {etiqueta.toLowerCase()}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
