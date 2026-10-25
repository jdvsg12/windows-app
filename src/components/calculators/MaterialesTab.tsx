"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/common/StatCard"
import { formatArea, formatCount } from "@/lib/format"
import { Cog, DoorOpen, Lock, Ruler } from "lucide-react"
import type { DespiecePuerta } from "@/lib/calculo/motor-puerta-alumina"
import type { PlanPuertas, PuertaCalculada } from "@/lib/calculo/plan-puertas"
import type { Accesorios, VidrioCorte } from "@/lib/types"
import { DespiecePuertaCard } from "./DespiecePuertaCard"
import { ErroresPuertas } from "./ErroresPuertas"
import { HerrajesPuertasCard } from "./HerrajesPuertasCard"

interface Props {
    accesorios: Accesorios | null
    vidrios: VidrioCorte[]
    planPuertas: PlanPuertas
}

const conDespiece = (calculada: PuertaCalculada): calculada is PuertaCalculada & { despiece: DespiecePuerta } =>
    calculada.despiece !== null

export function MaterialesTab({ accesorios, vidrios, planPuertas }: Props) {
    const puertas = planPuertas.puertas.filter(conDespiece)
    return (
        <div className="space-y-4">
            {accesorios && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Rodachinas" value={accesorios.rodachinas} icon={Cog} />
                    <StatCard label="Guías" value={accesorios.guiasSuperior + accesorios.guiasInferior} icon={DoorOpen} />
                    <StatCard label="Cerraduras" value={accesorios.cerraduras} icon={Lock} />
                    <StatCard label="Empaque" value={formatCount(accesorios.empaqueTotal)} unit="m" icon={Ruler} />
                </div>
            )}

            <ErroresPuertas errores={planPuertas.errores} />
            {puertas.map((calculada) => (
                <DespiecePuertaCard key={calculada.puerta.id} calculada={calculada} />
            ))}
            {planPuertas.accesorios && <HerrajesPuertasCard accesorios={planPuertas.accesorios} />}

            <Card>
                <CardHeader>
                    <CardTitle>Vidrios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {vidrios.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="font-medium">
                                        {v.codigo && <span className="mr-2 font-mono">{v.codigo}</span>}
                                        {v.ventana} - {v.tipo}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {v.ancho.toFixed(0)} × {v.alto.toFixed(0)} mm
                                        {v.grupo && ` · ${v.grupo}`}
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
