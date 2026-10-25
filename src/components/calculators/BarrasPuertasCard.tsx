import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PERFILES_PUERTA_ALUMINA } from "@/lib/catalogo-alumina"
import { LONGITUD_BARRA } from "@/lib/calculo/comun"
import type { BarrasPuertaPorColor } from "@/lib/calculo/plan-puertas"
import { ESTILOS_PERFIL_PUERTA } from "@/lib/design/piezas"
import { formatMm } from "@/lib/format"
import { getColorAluminioLabel } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PiezaBadge } from "./PiezaBadge"

interface BarrasPuertasCardProps {
    barras: readonly BarrasPuertaPorColor[]
    espesorSierra: number
}

const LONGITUD_BARRA_MM = LONGITUD_BARRA * 1000
const porcentaje = (mm: number) => `${(mm / LONGITUD_BARRA_MM) * 100}%`

// Barras de 6 m de los perfiles de puerta, por color y referencia, con lo que sobra de cada una.
export function BarrasPuertasCard({ barras, espesorSierra }: BarrasPuertasCardProps) {
    const conPiezas = barras.filter(({ resultado }) => resultado.barras.length > 0)
    if (conPiezas.length === 0) return null
    const variosColores = new Set(conPiezas.map(({ color }) => color)).size > 1

    return (
        <Card>
            <CardHeader>
                <CardTitle>Corte de perfiles de puertas</CardTitle>
                <CardDescription>Barras de 6 m con sierra de {formatMm(espesorSierra)}; los ingletes se miden por la punta larga.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {conPiezas.map(({ color, referencia, resultado }) => {
                    const estilo = ESTILOS_PERFIL_PUERTA[referencia]
                    return (
                        <div key={`${color}-${referencia}`} className="border-b last:border-0 pb-4 last:pb-0">
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <PiezaBadge estilo={estilo} />
                                    <h3 className="font-medium">
                                        {variosColores && `${getColorAluminioLabel(color)}: `}
                                        {PERFILES_PUERTA_ALUMINA[referencia].nombre}
                                    </h3>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {resultado.barras.length} {resultado.barras.length === 1 ? "barra" : "barras"}; consumo {formatMm(resultado.consumoNeto)}, sobrante{" "}
                                    {formatMm(resultado.sobranteTotal)}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {resultado.barras.map((barra, indice) => (
                                    <div key={indice} className="flex gap-1">
                                        {barra.piezas.map((pieza, j) => (
                                            <div key={j} className={cn("border px-2 py-1 rounded text-xs", estilo.clases)} style={{ width: porcentaje(pieza) }}>
                                                {pieza}
                                            </div>
                                        ))}
                                        {barra.sobrante > 0 && (
                                            <div
                                                className="border border-dashed px-2 py-1 rounded text-xs text-muted-foreground"
                                                style={{ width: porcentaje(barra.sobrante) }}
                                            >
                                                {barra.sobrante}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
