"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Grid3X3 } from "lucide-react"
import type { Ventana, TipoVentana, SistemaVentana } from "@/lib/types"

interface Props {
    ventanas: Ventana[]
    onAgregar: (nombre: string, ancho: number, alto: number, tipo: TipoVentana, sistema: SistemaVentana, editandoId: string | null) => void
    onEliminar: (id: string) => void
}

export function VentanasTab({ ventanas, onAgregar, onEliminar }: Props) {
    const [nombre, setNombre] = useState("")
    const [ancho, setAncho] = useState("")
    const [alto, setAlto] = useState("")
    const [tipoVentana, setTipoVentana] = useState<TipoVentana>("2hojas")
    const [sistema, setSistema] = useState<SistemaVentana>("5020")
    const [editandoId, setEditandoId] = useState<string | null>(null)

    const handleSubmit = () => {
        if (!ancho || !alto || !nombre) return
        onAgregar(nombre, Number.parseFloat(ancho), Number.parseFloat(alto), tipoVentana, sistema, editandoId)
        setNombre("")
        setAncho("")
        setAlto("")
        setTipoVentana("2hojas")
        setEditandoId(null)
    }

    const handleEditar = (ventana: Ventana) => {
        setNombre(ventana.nombre)
        setAncho(ventana.ancho.toString())
        setAlto(ventana.alto.toString())
        setTipoVentana(ventana.tipoVentana)
        setSistema(ventana.sistema || "5020")
        setEditandoId(ventana.id)
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{editandoId ? "Editar Ventana" : "Agregar Ventana"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ventana 1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ancho">Ancho (mm)</Label>
                            <Input id="ancho" type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="1100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alto">Alto (mm)</Label>
                            <Input id="alto" type="number" value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="1400" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo</Label>
                            <select
                                id="tipo"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={tipoVentana}
                                onChange={(e) => setTipoVentana(e.target.value as TipoVentana)}
                            >
                                <option value="2hojas">2 Hojas</option>
                                <option value="3hojas">3 Hojas</option>
                                <option value="4hojas">4 Hojas</option>
                                <option value="5hojas">5 Hojas</option>
                                <option value="6hojas">6 Hojas</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sistema">Sistema</Label>
                            <select
                                id="sistema"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={sistema}
                                onChange={(e) => setSistema(e.target.value as SistemaVentana)}
                            >
                                <option value="5020">5020</option>
                                <option value="744">744</option>
                                <option value="8025">8025</option>
                                <option value="7038">7038</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleSubmit} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                {editandoId ? "Actualizar" : "Agregar"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                        <Card key={ventana.id} className={editandoId === ventana.id ? "border-primary" : ""}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">{ventana.nombre}</h3>
                                    <Badge variant="secondary">{ventana.tipoVentana.replace("hojas", "H")}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {ventana.ancho} × {ventana.alto} mm
                                </p>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Sistema: {ventana.sistema || "5020"}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditar(ventana)} className="flex-1">
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Editar
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onEliminar(ventana.id)} className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
