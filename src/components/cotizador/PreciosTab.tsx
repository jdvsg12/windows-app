"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Plus, X } from "lucide-react"
import { TAMANOS_LAMINA } from "@/lib/types"

interface Props {
    precios: Record<string, unknown>
    costosCalculados: Record<string, unknown> | null
    onUpdatePrecios: (precios: Record<string, string | number | unknown[]>) => void
}

export function PreciosTab({ precios, costosCalculados, onUpdatePrecios }: Props) {
    const update = (field: string, value: number | string) => {
        onUpdatePrecios({ ...precios, [field]: value })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Precios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Perfiles (Barra 6m)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: "precioCabezal", label: "Cabezal" },
                                { key: "precioSillar", label: "Sillar" },
                                { key: "precioJamba", label: "Jamba" },
                                { key: "precioEnganche", label: "Enganche" },
                                { key: "precioTraslape", label: "Traslape" },
                                { key: "precioHorizontalSuperior", label: "Horizontal Superior" },
                                { key: "precioHorizontalInferior", label: "Horizontal Inferior" },
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <Label>{label}</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            className="pl-8"
                                            value={precios[key] ?? 0}
                                            onChange={(e) => update(key, Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="font-semibold text-lg border-b pb-2 mt-6">Vidrio y Empaque</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Precio Vidrio (por lámina)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-8"
                                        value={precios.precioVidrioLamina || 0}
                                        onChange={(e) => update("precioVidrioLamina", Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tamaño de Lámina</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={precios.tamanoLamina || "2500x3600"}
                                    onChange={(e) => update("tamanoLamina", e.target.value)}
                                >
                                    {Object.entries(TAMANOS_LAMINA).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {value.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Precio Empaque (metro)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-8"
                                        value={precios.precioEmpaque}
                                        onChange={(e) => update("precioEmpaque", Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Accesorios</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: "precioRodachina", label: "Rodachina" },
                                { key: "precioGuia", label: "Guía" },
                                { key: "precioCerradura", label: "Cerradura" },
                                { key: "precioTornillo8mm", label: "Tornillo 8mm" },
                                { key: "precioTornillo10mm", label: "Tornillo 10mm" },
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <Label>{label}</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            className="pl-8"
                                            value={precios[key] ?? 0}
                                            onChange={(e) => update(key, Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-6 col-span-2">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Costos Globales del Proyecto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Mano de Obra ($/m²)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        value={precios.manoDeObra}
                                        onChange={(e) => update("manoDeObra", Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Se multiplicará por el área total ({costosCalculados?.areaTotal?.toFixed(2) || 0} m²)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Costos Indirectos (Global)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        value={precios.costosIndirectos}
                                        onChange={(e) => update("costosIndirectos", Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Utilidad (%)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        value={precios.utilidad}
                                        onChange={(e) => update("utilidad", Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6 col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Costos Adicionales</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const nuevosCostos = [
                                        ...(precios.costosAdicionales || []),
                                        { id: Date.now().toString(), nombre: "", valor: 0, tipo: "fijo" },
                                    ]
                                    onUpdatePrecios({ ...precios, costosAdicionales: nuevosCostos })
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Costo
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {(precios.costosAdicionales || []).map((costo: { id: string; nombre: string; valor: number; tipo: string }, index: number) => (
                                <div key={costo.id} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Nombre del costo"
                                        value={costo.nombre}
                                        onChange={(e) => {
                                            const nuevosCostos = [...(precios.costosAdicionales || [])]
                                            nuevosCostos[index] = { ...costo, nombre: e.target.value }
                                            onUpdatePrecios({ ...precios, costosAdicionales: nuevosCostos })
                                        }}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Valor"
                                        value={costo.valor}
                                        onChange={(e) => {
                                            const nuevosCostos = [...(precios.costosAdicionales || [])]
                                            nuevosCostos[index] = { ...costo, valor: Number(e.target.value) }
                                            onUpdatePrecios({ ...precios, costosAdicionales: nuevosCostos })
                                        }}
                                        className="w-32"
                                    />
                                    <select
                                        value={costo.tipo}
                                        onChange={(e) => {
                                            const nuevosCostos = [...(precios.costosAdicionales || [])]
                                            nuevosCostos[index] = { ...costo, tipo: e.target.value }
                                            onUpdatePrecios({ ...precios, costosAdicionales: nuevosCostos })
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="fijo">Fijo ($)</option>
                                        <option value="porcentaje">Porcentaje (%)</option>
                                    </select>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            const nuevosCostos = precios.costosAdicionales.filter((c: { id: string }) => c.id !== costo.id)
                                            onUpdatePrecios({ ...precios, costosAdicionales: nuevosCostos })
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {(precios.costosAdicionales || []).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No hay costos adicionales configurados
                                </p>
                            )}
                        </div>
                    </div>

                    {costosCalculados && (
                        <div className="mt-8 p-4 bg-muted rounded-lg space-y-2 col-span-2">
                            <h3 className="font-bold mb-4">Resumen de Costos (Interno)</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span>Materiales (Perfiles + Accesorios + Vidrio):</span>
                                <span className="text-right">
                                    ${(costosCalculados.costoMateriales || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                                <span>Mano de Obra:</span>
                                <span className="text-right">
                                    ${(costosCalculados.costoManoObra || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                                <span>Costos Indirectos:</span>
                                <span className="text-right">
                                    ${(costosCalculados.costoIndirectos || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                                <span>Costos Adicionales:</span>
                                <span className="text-right">
                                    ${(costosCalculados.costosAdicionalesTotal || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                                <span className="font-bold pt-2 border-t">Costo Directo Total:</span>
                                <span className="text-right font-bold pt-2 border-t">
                                    ${(costosCalculados.costoDirecto || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                                <span>Utilidad ({precios.utilidad}%):</span>
                                <span className="text-right">
                                    ${(costosCalculados.utilidadMonto || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                                <span className="font-bold text-lg pt-2 border-t">PRECIO FINAL:</span>
                                <span className="text-right font-bold text-lg pt-2 border-t">
                                    ${(costosCalculados.total || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
