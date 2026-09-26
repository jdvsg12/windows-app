"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/common/NativeSelect"
import type { OptimizacionPerfil, LaminaVidrio, TamanoLamina } from "@/lib/types"
import { TAMANOS_LAMINA } from "@/lib/types"

interface Props {
    optimizacion: Record<string, OptimizacionPerfil>
    laminasVidrio: LaminaVidrio[]
    tamanoLamina: TamanoLamina
    onTamanoLaminaChange: (tamano: TamanoLamina) => void
}

const COLORS = [
    "bg-blue-100 border-blue-400 text-blue-800",
    "bg-emerald-100 border-emerald-400 text-emerald-800",
    "bg-amber-100 border-amber-400 text-amber-800",
    "bg-purple-100 border-purple-400 text-purple-800",
    "bg-rose-100 border-rose-400 text-rose-800",
    "bg-cyan-100 border-cyan-400 text-cyan-800",
    "bg-orange-100 border-orange-400 text-orange-800",
    "bg-teal-100 border-teal-400 text-teal-800",
    "bg-pink-100 border-pink-400 text-pink-800",
    "bg-lime-100 border-lime-400 text-lime-800",
    "bg-indigo-100 border-indigo-400 text-indigo-800",
    "bg-violet-100 border-violet-400 text-violet-800",
    "bg-yellow-100 border-yellow-400 text-yellow-800",
    "bg-sky-100 border-sky-400 text-sky-800",
]

export function OptimizacionTab({ optimizacion, laminasVidrio, tamanoLamina, onTamanoLaminaChange }: Props) {
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
                        <div className="flex items-center justify-between">
                            <CardTitle>Láminas de Vidrio</CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="lamina-size" className="text-sm text-muted-foreground">Tamaño lámina:</Label>
                                <NativeSelect
                                    id="lamina-size"
                                    className="w-auto"
                                    value={tamanoLamina}
                                    onChange={(e) => onTamanoLaminaChange(e.target.value as TamanoLamina)}
                                >
                                    {Object.entries(TAMANOS_LAMINA).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {laminasVidrio.map((lamina) => {
                                const aspectRatio = lamina.anchoLamina / lamina.altoLamina
                                const height = 280
                                const width = Math.round(height * aspectRatio)
                                return (
                                    <div key={lamina.numero} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-semibold">Lámina {lamina.numero}</h3>
                                            <div className="text-sm text-muted-foreground">
                                                {lamina.vidrios.length} vidrios • {lamina.areaUsada.toFixed(2)} m² usados • {lamina.areaSobrante.toFixed(2)} m² sobrante
                                            </div>
                                        </div>
                                        <div
                                            className="relative border-2 border-muted-foreground/30 rounded-lg overflow-hidden mb-3"
                                            style={{ width: `${width}px`, height: `${height}px` }}
                                        >
                                            {lamina.vidrios.map((item, i) => {
                                                const colorClass = COLORS[i % COLORS.length]
                                                const left = (item.x / lamina.anchoLamina) * 100
                                                const top = (item.y / lamina.altoLamina) * 100
                                                const w = (item.vidrio.ancho / lamina.anchoLamina) * 100
                                                const h = (item.vidrio.alto / lamina.altoLamina) * 100
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`absolute border ${colorClass} flex flex-col items-center justify-center text-center p-0.5 overflow-hidden`}
                                                        style={{
                                                            left: `${left}%`,
                                                            top: `${top}%`,
                                                            width: `${w}%`,
                                                            height: `${h}%`,
                                                            fontSize: Math.min(w, h) > 8 ? "10px" : "0",
                                                            lineHeight: 1.2,
                                                        }}
                                                        title={`${item.vidrio.ventana} - ${item.vidrio.tipo}\n${item.vidrio.ancho.toFixed(0)}×${item.vidrio.alto.toFixed(0)} mm${item.rotado ? " (rotado)" : ""}`}
                                                    >
                                                        <span className="truncate w-full leading-tight">{item.vidrio.ventana}</span>
                                                        <span className="truncate w-full leading-tight opacity-75">
                                                            {item.vidrio.ancho.toFixed(0)}×{item.vidrio.alto.toFixed(0)}
                                                            {item.rotado && <span className="ml-0.5">↻</span>}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="space-y-1">
                                            {lamina.vidrios.map((item, i) => {
                                                const colorClass = COLORS[i % COLORS.length]
                                                return (
                                                    <div key={i} className={`flex items-center justify-between p-2 rounded text-sm ${colorClass}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded inline-block border" style={{ backgroundColor: "currentColor" }} />
                                                            <span>{item.vidrio.ventana} - {item.vidrio.tipo}</span>
                                                        </div>
                                                        <span className="text-muted-foreground">
                                                            ({item.x.toFixed(0)}, {item.y.toFixed(0)}) {item.vidrio.ancho.toFixed(0)}×{item.vidrio.alto.toFixed(0)} mm
                                                            {item.rotado && <span className="text-destructive ml-2">↻</span>}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
