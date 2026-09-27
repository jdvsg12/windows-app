"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/common/StatCard"
import { formatArea, formatCount } from "@/lib/format"
import { Cog, DoorOpen, Lock, Ruler } from "lucide-react"
import type { Accesorios, VidrioCorte } from "@/lib/types"

interface Props {
    accesorios: Accesorios | null
    vidrios: VidrioCorte[]
}

export function MaterialesTab({ accesorios, vidrios }: Props) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Rodachinas" value={accesorios?.rodachinas || 0} icon={Cog} />
                <StatCard
                    label="Guías"
                    value={(accesorios?.guiasSuperior || 0) + (accesorios?.guiasInferior || 0)}
                    icon={DoorOpen}
                />
                <StatCard label="Cerraduras" value={accesorios?.cerraduras || 0} icon={Lock} />
                <StatCard label="Empaque" value={formatCount(accesorios?.empaqueTotal)} unit="m" icon={Ruler} />
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
                                    <p className="text-sm text-muted-foreground">
                                        {v.ancho.toFixed(0)} × {v.alto.toFixed(0)} mm
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatArea(v.area, 3)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
