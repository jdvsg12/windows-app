"use client"

import { CampoImagen } from "@/components/common/CampoImagen"
import { FormSkeleton } from "@/components/common/FormSkeleton"
import { SaveIndicator } from "@/components/common/SaveIndicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCargaImagen } from "@/hooks/useCargaImagen"
import { CERRADURAS, RODACHINAS } from "@/lib/types"
import { useFotosProductos, type FamiliaProducto } from "./useFotosProductos"

// Las fotos de producto se reducen a 240 px: seis viven en localStorage junto a los proyectos.
const TAMANO_FOTO = 240

const FAMILIAS: readonly { familia: FamiliaProducto; titulo: string; singular: string; tipos: readonly { value: string; label: string }[] }[] = [
    { familia: "cerraduras", titulo: "Cerraduras", singular: "Cerradura", tipos: CERRADURAS },
    { familia: "rodachinas", titulo: "Rodachinas", singular: "Rodachina", tipos: RODACHINAS },
]

interface FotoProductoCampoProps {
    id: string
    etiqueta: string
    imagen?: string
    nombre: string
    onImagen: (imagen: string | undefined) => void
    onNombre: (nombre: string) => void
}

function FotoProductoCampo({ id, etiqueta, imagen, nombre, onImagen, onNombre }: FotoProductoCampoProps) {
    const carga = useCargaImagen("La foto", onImagen, TAMANO_FOTO)
    return (
        <div className="space-y-2 rounded-md border p-3">
            <CampoImagen
                id={`${id}-foto`}
                etiqueta={etiqueta}
                imagen={imagen}
                descripcion={`Foto: ${etiqueta}`}
                ayuda="Foto del producto; se reduce a 240 px."
                error={carga.error}
                onArchivo={carga.handleArchivo}
                onQuitar={() => onImagen(undefined)}
            />
            {imagen && (
                <div className="space-y-1">
                    <Label htmlFor={`${id}-nombre`}>Leyenda en la cotización</Label>
                    <Input id={`${id}-nombre`} value={nombre} placeholder={etiqueta} onChange={(evento) => onNombre(evento.target.value)} />
                </div>
            )}
        </div>
    )
}

export function FotosProductosPanel() {
    const { fotos, status, ponerImagen, ponerNombre } = useFotosProductos()
    if (!fotos) return <FormSkeleton />

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle>Fotos de producto</CardTitle>
                    <CardDescription>
                        La cotización muestra, bajo «Criterios técnicos», la foto de cada tipo de cerradura y rodachina que usan sus ventanas.
                    </CardDescription>
                </div>
                <SaveIndicator status={status} />
            </CardHeader>
            <CardContent className="space-y-6">
                {FAMILIAS.map(({ familia, titulo, singular, tipos }) => {
                    const catalogo: Record<string, { imagen: string; nombre: string } | undefined> = fotos[familia]
                    return (
                        <section key={familia} className="space-y-3">
                            <h3 className="font-semibold">{titulo}</h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {tipos.map(({ value, label }) => (
                                    <FotoProductoCampo
                                        key={value}
                                        id={`${familia}-${value}`}
                                        etiqueta={`${singular} ${label}`}
                                        imagen={catalogo[value]?.imagen}
                                        nombre={catalogo[value]?.nombre ?? ""}
                                        onImagen={(imagen) => ponerImagen(familia, value, imagen)}
                                        onNombre={(nombre) => ponerNombre(familia, value, nombre)}
                                    />
                                ))}
                            </div>
                        </section>
                    )
                })}
            </CardContent>
        </Card>
    )
}
