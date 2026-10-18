import { formatCount, formatCurrency } from "@/lib/format"
import type { DocumentoCotizacion } from "@/lib/types"

interface TablaVentanasPreviewProps {
    documento: DocumentoCotizacion
}

const celda = "border border-paper-rule p-2"

export function TablaVentanasPreview({ documento }: TablaVentanasPreviewProps) {
    const { mostrarMedidas, mostrarValores } = documento
    return (
        <table className="w-full border-collapse border border-paper-rule mb-4">
            <thead>
                <tr className="bg-paper-shade">
                    <th className={`${celda} text-left`}>Nombre</th>
                    <th className={`${celda} text-left`}>Tipo</th>
                    {mostrarMedidas && (
                        <>
                            <th className={`${celda} text-left`}>Ancho (mm)</th>
                            <th className={`${celda} text-left`}>Alto (mm)</th>
                            <th className={`${celda} text-right`}>Área (m²)</th>
                        </>
                    )}
                    {mostrarValores && <th className={`${celda} text-right`}>Valor</th>}
                </tr>
            </thead>
            <tbody>
                {documento.filas.map((fila) => (
                    <tr key={fila.id}>
                        <td className={celda}>{fila.nombre}</td>
                        <td className={celda}>
                            {fila.tipo}
                            {fila.especificaciones.length > 0 && (
                                <p className="text-xs mt-1">{fila.especificaciones.join(" · ")}</p>
                            )}
                        </td>
                        {mostrarMedidas && (
                            <>
                                <td className={celda}>{fila.ancho}</td>
                                <td className={celda}>{fila.alto}</td>
                                <td className={`${celda} text-right`}>{formatCount(fila.area ?? undefined, 2)}</td>
                            </>
                        )}
                        {mostrarValores && <td className={`${celda} text-right`}>{formatCurrency(fila.valor ?? undefined)}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
