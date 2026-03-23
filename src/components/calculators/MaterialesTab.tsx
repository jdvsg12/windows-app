"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Accesorios, VidrioCorte } from "@/lib/types"

interface Props {
    accesorios: Accesorios | null
    vidrios: VidrioCorte[]
}

export function MaterialesTab({ accesorios, vidrios }: Props) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rodachinas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{accesorios?.rodachinas || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Guías</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{(accesorios?.guiasSuperior || 0) + (accesorios?.guiasInferior || 0)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cerraduras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{accesorios?.cerraduras || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Empaque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{accesorios?.empaqueTotal.toFixed(1) || 0} m</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vidrios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {vidrios.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="font-medium">{v.ventana} - {v.tipo}</p>
                                    <p className="text-sm text-muted-foreground">{v.ancho.toFixed(0)} × {v.alto.toFixed(0)} mm</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{v.area.toFixed(3)} m²</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
