import { formatCount, formatCurrency } from "@/lib/format"
import { metrosDesdeMm, numeroItem } from "@/lib/pdf/cotizacion-formato"
import type { DocumentoCotizacion } from "@/lib/types"

interface TablaVentanasPreviewProps {
    documento: DocumentoCotizacion
}

const celda = "px-2.5 py-2"
// Medidas y valores nunca se parten en dos líneas ("1,50 / m").
const cifra = `${celda} whitespace-nowrap tabular-nums`
const encabezado = `${celda} text-[10px] font-bold uppercase tracking-wider`

export function TablaVentanasPreview({ documento }: TablaVentanasPreviewProps) {
    const { mostrarMedidas, mostrarValores } = documento
    const columnasAntesDelValor = mostrarMedidas ? 5 : 2

    return (
        <div className="overflow-x-auto border border-paper-header">
            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-paper-header text-paper-header-ink">
                        <th className={`${encabezado} w-12 text-center`}>Ítem</th>
                        <th className={encabezado}>Ubicación y especificaciones</th>
                        {mostrarMedidas && (
                            <>
                                <th className={`${encabezado} text-center`}>Ancho</th>
                                <th className={`${encabezado} text-center`}>Alto</th>
                                <th className={`${encabezado} whitespace-nowrap text-right`}>Área m²</th>
                            </>
                        )}
                        {mostrarValores && <th className={`${encabezado} text-right`}>Valor</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-paper-panel-border">
                    {documento.filas.map((fila, indice) => (
                        <tr key={fila.id}>
                            <td className={`${celda} text-center font-bold text-paper-muted`}>{numeroItem(indice)}</td>
                            <td className={celda}>
                                <span className="font-bold">{fila.nombre}</span> <span className="text-paper-muted">· {fila.tipo}</span>
                                {fila.especificaciones.length > 0 && (
                                    <p className="mt-0.5 text-xs text-paper-muted">{fila.especificaciones.join(" · ")}</p>
                                )}
                            </td>
                            {mostrarMedidas && (
                                <>
                                    <td className={`${cifra} text-center`}>{metrosDesdeMm(fila.ancho)}</td>
                                    <td className={`${cifra} text-center`}>{metrosDesdeMm(fila.alto)}</td>
                                    <td className={`${cifra} text-right`}>{formatCount(fila.area ?? undefined, 2)}</td>
                                </>
                            )}
                            {mostrarValores && (
                                <td className={`${cifra} bg-paper-accent-soft text-right font-bold text-paper-accent`}>
                                    {formatCurrency(fila.valor ?? undefined)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
                {mostrarValores && (
                    <tfoot>
                        <tr className="border-t-2 border-paper-header bg-paper-panel font-bold">
                            <td className={`${celda} text-right uppercase`} colSpan={columnasAntesDelValor}>
                                TOTAL {documento.filas.length} {documento.filas.length === 1 ? "ventana" : "ventanas"}
                                {mostrarMedidas && documento.areaTotal !== null && ` · ${formatCount(documento.areaTotal, 2)} m²`}
                            </td>
                            <td className={`${cifra} text-right text-paper-accent`}>{formatCurrency(documento.total ?? undefined)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    )
}
