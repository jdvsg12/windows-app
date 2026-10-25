import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PERFILES_PUERTA_ALUMINA } from "@/lib/catalogo-alumina"
import { LONGITUD_BARRA } from "@/lib/calculo/comun"
import type { ColorAluminio } from "@/lib/types"
import type { ReferenciaPerfilPuerta } from "@/lib/calculo/motor-puerta-alumina"
import type { BarrasPuertaPorColor, PuertaCalculada } from "@/lib/calculo/plan-puertas"
import { ESTILOS_PERFIL_PUERTA } from "@/lib/design/piezas"
import { formatMm } from "@/lib/format"
import { getColorAluminioLabel } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PiezaBadge } from "./PiezaBadge"

interface BarrasPuertasCardProps {
    barras: readonly BarrasPuertaPorColor[]
    puertas: readonly PuertaCalculada[]
    espesorSierra: number
}

interface CortesPuertasProps {
    puertas: readonly PuertaCalculada[]
    color: ColorAluminio
    referencia: ReferenciaPerfilPuerta
}

// Qué pieza es cada corte y con qué ángulo va cada extremo: lo que la barra sola no dice.
function CortesPuertas({ puertas, color, referencia }: CortesPuertasProps) {
    const filas = puertas.flatMap(({ puerta, codigo, despiece }) =>
        puerta.colorAluminio === color && despiece
            ? despiece.piezas.filter((pieza) => pieza.referencia === referencia).map((pieza) => ({ codigo, ...pieza }))
            : [],
    )
    return (
        <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
            {filas.map((fila) => (
                <li key={`${fila.codigo}-${fila.pieza}`} className="flex justify-between gap-3">
                    <span>
                        <span className="font-mono font-semibold text-foreground">{fila.codigo}</span> {fila.pieza}
                    </span>
                    <span className="tabular-nums">
                        {formatMm(fila.longitud)}, cortes {fila.cortes.map((angulo) => `${angulo}°`).join(" / ")}
                    </span>
                </li>
            ))}
        </ul>
    )
}

const LONGITUD_BARRA_MM = LONGITUD_BARRA * 1000
const porcentaje = (mm: number) => `${(mm / LONGITUD_BARRA_MM) * 100}%`

// Barras de 6 m de los perfiles de puerta, por color y referencia, con lo que sobra de cada una.
export function BarrasPuertasCard({ barras, puertas, espesorSierra }: BarrasPuertasCardProps) {
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
                            <CortesPuertas puertas={puertas} color={color} referencia={referencia} />
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
