"use client"

import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Download, Star, StarOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { VersionCotizacion } from "@/lib/types"
import { MAX_VERSIONES_RECIENTES } from "@/lib/versiones-cotizacion"

interface VersionesPdfProps {
    versiones: readonly VersionCotizacion[]
    generando: boolean
    onDescargar: (version: VersionCotizacion) => void
    onGuardar: (id: string) => void
    onSoltar: () => void
}

interface FilaVersionProps {
    version: VersionCotizacion
    generando: boolean
    onDescargar: (version: VersionCotizacion) => void
    onGuardar: (id: string) => void
    onSoltar: () => void
}

const cuando = (creada: string) => format(parseISO(creada), "d 'de' MMM yyyy, HH:mm", { locale: es })

function FilaVersion({ version, generando, onDescargar, onGuardar, onSoltar }: FilaVersionProps) {
    const { documento } = version
    const total = documento.total === null ? "Sin valores" : formatCurrency(documento.total)
    const etiquetaFecha = cuando(version.creada)

    return (
        <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded border p-3">
            <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                    {etiquetaFecha}
                    {version.guardada && <Badge variant="secondary">Guardada</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">
                    {documento.cliente || "Sin cliente"} · {documento.filas.length} {documento.filas.length === 1 ? "ventana" : "ventanas"} · {total}
                </p>
            </div>
            <div className="flex gap-2">
                {version.guardada ? (
                    <Button variant="ghost" size="sm" onClick={onSoltar} aria-label={`Quitar guardada a la versión del ${etiquetaFecha}`}>
                        <StarOff className="h-4 w-4 mr-1" />
                        Quitar guardada
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => onGuardar(version.id)} aria-label={`Guardar la versión del ${etiquetaFecha}`}>
                        <Star className="h-4 w-4 mr-1" />
                        Guardar
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={generando}
                    onClick={() => onDescargar(version)}
                    aria-label={`Descargar la versión del ${etiquetaFecha}`}
                >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                </Button>
            </div>
        </li>
    )
}

export function VersionesPdf({ versiones, ...acciones }: VersionesPdfProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Versiones del PDF</CardTitle>
                <CardDescription>
                    Se conservan las {MAX_VERSIONES_RECIENTES} últimas que descargaste y una guardada, que no se borra. Al volver a
                    descargar una versión sale igual que entonces, con el logo actual.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {versiones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todavía no has descargado el PDF de esta cotización.</p>
                ) : (
                    <ul className="space-y-2" aria-label="Versiones del PDF">
                        {versiones.map((version) => (
                            <FilaVersion key={version.id} version={version} {...acciones} />
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
