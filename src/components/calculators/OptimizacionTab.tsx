"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/common/NativeSelect"
import { StatCard } from "@/components/common/StatCard"
import { PiezaBadge } from "./PiezaBadge"
import { ESTILOS_HOJA, obtenerEstiloPerfil, obtenerTipoHoja } from "@/lib/design/piezas"
import { cn } from "@/lib/utils"
import { formatMeters } from "@/lib/format"
import { Layers, Ruler, SquareStack } from "lucide-react"
import type { OptimizacionPerfil, LaminaVidrio, TamanoLamina } from "@/lib/types"
import { TAMANOS_LAMINA } from "@/lib/types"

interface Props {
    optimizacion: Record<string, OptimizacionPerfil>
    laminasVidrio: LaminaVidrio[]
    errorLaminas: string | null
    tamanoLamina: TamanoLamina
    onTamanoLaminaChange: (tamano: TamanoLamina) => void
}

const ESTILO_RESTO = { codigo: "R", clases: "bg-resto border-resto-border text-resto-fg" }
const ESTILO_DESPERDICIO = { codigo: "S", clases: "bg-desperdicio border-desperdicio-border text-desperdicio-fg" }

export function OptimizacionTab({ optimizacion, laminasVidrio, errorLaminas, tamanoLamina, onTamanoLaminaChange }: Props) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    label="Barras 6m"
                    value={Object.values(optimizacion).reduce((sum, opt) => sum + opt.barras.length, 0)}
                    icon={Ruler}
                />
                <StatCard
                    label="Metros Totales"
                    value={formatMeters(Object.values(optimizacion).reduce((sum, opt) => sum + opt.metrosUsados, 0))}
                    icon={Layers}
                />
                <StatCard label="Láminas Vidrio" value={laminasVidrio.length} icon={SquareStack} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Corte de Perfiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(optimizacion).map(([tipo, opt]) => (
                        <div key={tipo} className="border-b last:border-0 pb-4 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <PiezaBadge estilo={obtenerEstiloPerfil(tipo)} />
                                    <h3 className="font-medium">{tipo}</h3>
                                </div>
                                <span className="text-sm text-muted-foreground">{opt.barras.length} barras</span>
                            </div>
                            <div className="space-y-1">
                                {opt.barras.map((barra, i) => (
                                    <div key={i} className="flex gap-1">
                                        {barra.map((medida, j) => (
                                            <div key={j} className={cn("border px-2 py-1 rounded text-xs", obtenerEstiloPerfil(tipo).clases)} style={{ width: `${(medida / 6) * 100}%` }}>
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

            {errorLaminas && (
                <Card className="border-destructive">
                    <CardContent className="pt-6 text-sm text-destructive">
                        {errorLaminas} Cambia el tamaño de lámina en Precios para poder cotizar este vidrio.
                    </CardContent>
                </Card>
            )}

            {laminasVidrio.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
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
                        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {(["fija", "movil"] as const).map((tipo) => (
                                <span key={tipo} className="inline-flex items-center gap-2">
                                    <PiezaBadge estilo={ESTILOS_HOJA[tipo]} />
                                    Hoja {ESTILOS_HOJA[tipo].nombre.toLowerCase()}
                                </span>
                            ))}
                            <span className="inline-flex items-center gap-2">
                                <PiezaBadge estilo={ESTILO_RESTO} />
                                Resto reutilizable
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <PiezaBadge estilo={ESTILO_DESPERDICIO} />
                                Desperdicio
                            </span>
                        </div>
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
                                                const hoja = ESTILOS_HOJA[obtenerTipoHoja(item.vidrio.tipo)]
                                                const left = (item.x / lamina.anchoLamina) * 100
                                                const top = (item.y / lamina.altoLamina) * 100
                                                const w = (item.vidrio.ancho / lamina.anchoLamina) * 100
                                                const h = (item.vidrio.alto / lamina.altoLamina) * 100
                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn("absolute border flex flex-col items-center justify-center text-center p-0.5 overflow-hidden", hoja.clases)}
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
                                                        <span className="truncate w-full leading-tight font-semibold">#{i + 1} {item.vidrio.ventana}</span>
                                                        <span className="truncate w-full leading-tight">
                                                            {item.vidrio.ancho.toFixed(0)}×{item.vidrio.alto.toFixed(0)}
                                                            {item.rotado && <span className="ml-0.5">↻</span>}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                            {lamina.restos.map((resto, i) => {
                                                const estilo = resto.tipo === "resto" ? ESTILO_RESTO : ESTILO_DESPERDICIO
                                                const left = (resto.x / lamina.anchoLamina) * 100
                                                const top = (resto.y / lamina.altoLamina) * 100
                                                const w = (resto.ancho / lamina.anchoLamina) * 100
                                                const h = (resto.alto / lamina.altoLamina) * 100
                                                return (
                                                    <div
                                                        key={`resto-${i}`}
                                                        className={cn("absolute border flex items-center justify-center overflow-hidden", estilo.clases)}
                                                        style={{
                                                            left: `${left}%`,
                                                            top: `${top}%`,
                                                            width: `${w}%`,
                                                            height: `${h}%`,
                                                            fontSize: Math.min(w, h) > 8 ? "10px" : "0",
                                                        }}
                                                        title={`${resto.tipo === "resto" ? "Resto" : "Desperdicio"}: ${resto.ancho.toFixed(0)}×${resto.alto.toFixed(0)} mm`}
                                                    >
                                                        {estilo.codigo}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="space-y-1">
                                            {lamina.vidrios.map((item, i) => {
                                                const hoja = ESTILOS_HOJA[obtenerTipoHoja(item.vidrio.tipo)]
                                                return (
                                                    <div key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded border bg-card p-2 text-sm">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className="w-7 shrink-0 text-right font-mono text-caption text-muted-foreground">#{i + 1}</span>
                                                            <PiezaBadge estilo={hoja} />
                                                            <span className="truncate">{item.vidrio.ventana} - {item.vidrio.tipo}</span>
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
