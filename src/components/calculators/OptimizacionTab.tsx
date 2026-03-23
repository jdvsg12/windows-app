"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OptimizacionPerfil, LaminaVidrio } from "@/lib/types"

interface Props {
    optimizacion: Record<string, OptimizacionPerfil>
    laminasVidrio: LaminaVidrio[]
}

export function OptimizacionTab({ optimizacion, laminasVidrio }: Props) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Barras 6m</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {Object.values(optimizacion).reduce((sum, opt) => sum + opt.barras.length, 0)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Metros Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {Object.values(optimizacion).reduce((sum, opt) => sum + opt.metrosUsados, 0).toFixed(2)} m
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Láminas Vidrio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{laminasVidrio.length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Corte de Perfiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(optimizacion).map(([tipo, opt]) => (
                        <div key={tipo} className="border-b last:border-0 pb-4 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{tipo}</h3>
                                <span className="text-sm text-muted-foreground">{opt.barras.length} barras</span>
                            </div>
                            <div className="space-y-1">
                                {opt.barras.map((barra, i) => (
                                    <div key={i} className="flex gap-1">
                                        {barra.map((medida, j) => (
                                            <div key={j} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs" style={{ width: `${(medida / 6) * 100}%` }}>
                                                {medida.toFixed(3)}m
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {laminasVidrio.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Láminas de Vidrio (2500 × 3600 mm)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {laminasVidrio.map((lamina) => (
                                <div key={lamina.numero} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold">Lámina {lamina.numero}</h3>
                                        <div className="text-sm text-muted-foreground">
                                            {lamina.vidrios.length} vidrios • {lamina.areaUsada.toFixed(2)} m² usados
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {lamina.vidrios.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                                <span>{item.vidrio.ventana} - {item.vidrio.tipo}</span>
                                                <span className="text-muted-foreground">
                                                    {item.vidrio.ancho.toFixed(0)}×{item.vidrio.alto.toFixed(0)} mm
                                                    {item.rotado && <span className="text-destructive ml-2">↻</span>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
