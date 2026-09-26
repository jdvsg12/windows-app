import type { CostosCalculadosCotizador } from "@/lib/types"

interface ResumenCostosProps {
    costos: CostosCalculadosCotizador
    utilidadPorcentaje: number
}

const formatCurrency = (value: number | undefined): string =>
    `$${(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`

export function ResumenCostos({ costos, utilidadPorcentaje }: ResumenCostosProps) {
    return (
        <div className="mt-8 p-4 bg-muted rounded-lg space-y-2 md:col-span-2">
            <h3 className="font-bold mb-4">Resumen de Costos (Interno)</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Materiales (Perfiles + Accesorios + Vidrio):</span>
                <span className="text-right">{formatCurrency(costos.costoMateriales)}</span>
                <span>Mano de Obra:</span>
                <span className="text-right">{formatCurrency(costos.costoManoObra)}</span>
                <span>Costos Indirectos:</span>
                <span className="text-right">{formatCurrency(costos.costoIndirectos)}</span>
                <span>Costos Adicionales:</span>
                <span className="text-right">{formatCurrency(costos.costosAdicionalesTotal)}</span>
                <span className="font-bold pt-2 border-t">Costo Directo Total:</span>
                <span className="text-right font-bold pt-2 border-t">{formatCurrency(costos.costoDirecto)}</span>
                <span>Utilidad ({utilidadPorcentaje}%):</span>
                <span className="text-right">{formatCurrency(costos.utilidadMonto)}</span>
                <span className="font-bold text-lg pt-2 border-t">PRECIO FINAL:</span>
                <span className="text-right font-bold text-lg pt-2 border-t">{formatCurrency(costos.total)}</span>
            </div>
        </div>
    )
}
