"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/common/NativeSelect"
import { TAMANOS_LAMINA, type ConfiguracionPrecios, type CostosCalculadosCotizador } from "@/lib/types"
import { PrecioField } from "./PrecioField"
import { CostosAdicionalesEditor } from "./CostosAdicionalesEditor"
import { ResumenCostos } from "./ResumenCostos"

interface PreciosTabProps {
    precios: ConfiguracionPrecios
    costosCalculados: CostosCalculadosCotizador | null
    onUpdatePrecios: (precios: ConfiguracionPrecios) => void
}

type PrecioNumericKey = {
    [K in keyof ConfiguracionPrecios]: ConfiguracionPrecios[K] extends number ? K : never
}[keyof ConfiguracionPrecios]

interface PrecioFieldConfig {
    key: PrecioNumericKey
    label: string
}

const PERFILES_FIELDS: readonly PrecioFieldConfig[] = [
    { key: "precioCabezal", label: "Cabezal" },
    { key: "precioSillar", label: "Sillar" },
    { key: "precioJamba", label: "Jamba" },
    { key: "precioEnganche", label: "Enganche" },
    { key: "precioTraslape", label: "Traslape" },
    { key: "precioHorizontalSuperior", label: "Horizontal Superior" },
    { key: "precioHorizontalInferior", label: "Horizontal Inferior" },
]

const ACCESORIOS_FIELDS: readonly PrecioFieldConfig[] = [
    { key: "precioRodachina", label: "Rodachina" },
    { key: "precioGuia", label: "Guía" },
    { key: "precioCerradura", label: "Cerradura" },
    { key: "precioTornillo8mm", label: "Tornillo 8mm" },
    { key: "precioTornillo10mm", label: "Tornillo 10mm" },
]

export function PreciosTab({ precios, costosCalculados, onUpdatePrecios }: PreciosTabProps) {
    const update = (field: keyof ConfiguracionPrecios, value: number | string) => {
        onUpdatePrecios({ ...precios, [field]: value })
    }

    const renderFields = (fields: readonly PrecioFieldConfig[]) =>
        fields.map(({ key, label }) => (
            <PrecioField
                key={key}
                id={key}
                label={label}
                value={precios[key]}
                onChange={(value) => update(key, value)}
            />
        ))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Precios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Perfiles (Barra 6m)</h3>
                        <div className="grid grid-cols-2 gap-4">{renderFields(PERFILES_FIELDS)}</div>

                        <h3 className="font-semibold text-lg border-b pb-2 mt-6">Vidrio y Empaque</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <PrecioField
                                id="precioVidrioLamina"
                                label="Precio Vidrio (por lámina)"
                                value={precios.precioVidrioLamina}
                                onChange={(value) => update("precioVidrioLamina", value)}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="tamanoLamina">Tamaño de Lámina</Label>
                                <NativeSelect
                                    id="tamanoLamina"
                                    value={precios.tamanoLamina || "2500x3600"}
                                    onChange={(e) => update("tamanoLamina", e.target.value)}
                                >
                                    {Object.entries(TAMANOS_LAMINA).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {value.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <PrecioField
                                id="precioEmpaque"
                                label="Precio Empaque (metro)"
                                value={precios.precioEmpaque}
                                onChange={(value) => update("precioEmpaque", value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Accesorios</h3>
                        <div className="grid grid-cols-2 gap-4">{renderFields(ACCESORIOS_FIELDS)}</div>
                    </div>

                    <div className="border-t pt-6 md:col-span-2">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Costos Globales del Proyecto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <PrecioField
                                id="manoDeObra"
                                label="Mano de Obra ($/m²)"
                                value={precios.manoDeObra}
                                onChange={(value) => update("manoDeObra", value)}
                                hint={`Se multiplicará por el área total (${costosCalculados?.areaTotal?.toFixed(2) || 0} m²)`}
                            />
                            <PrecioField
                                id="costosIndirectos"
                                label="Costos Indirectos (Global)"
                                value={precios.costosIndirectos}
                                onChange={(value) => update("costosIndirectos", value)}
                            />
                            <PrecioField
                                id="utilidad"
                                label="Utilidad (%)"
                                value={precios.utilidad}
                                onChange={(value) => update("utilidad", value)}
                            />
                        </div>
                    </div>

                    <CostosAdicionalesEditor
                        costos={precios.costosAdicionales || []}
                        onChange={(costosAdicionales) => onUpdatePrecios({ ...precios, costosAdicionales })}
                    />

                    {costosCalculados && (
                        <ResumenCostos costos={costosCalculados} utilidadPorcentaje={precios.utilidad} />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
