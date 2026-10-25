import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatArea, formatMm } from "@/lib/format"
import type { LaminasCompra } from "@/lib/lista-compra"
import type { VidrioCorte } from "@/lib/types"

interface VidriosCompraProps {
    vidrios: readonly VidrioCorte[]
    laminas: readonly LaminasCompra[]
    tamanoLamina: string
}

export function VidriosCompra({ vidrios, laminas, tamanoLamina }: VidriosCompraProps) {
    if (vidrios.length === 0) return null
    const area = vidrios.reduce((total, vidrio) => total + vidrio.area, 0)
    const totalLaminas = laminas.reduce((total, grupo) => total + grupo.laminas, 0)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vidrios</CardTitle>
                <CardDescription>
                    {totalLaminas} {totalLaminas === 1 ? "lámina" : "láminas"} de {tamanoLamina} ({laminas.map((grupo) => `${grupo.laminas} ${grupo.grupo}`).join(", ")}); {formatArea(area)} netos
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pieza</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Medida</TableHead>
                            <TableHead className="text-right">Área</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vidrios.map((vidrio, indice) => (
                            <TableRow key={vidrio.codigo ?? indice}>
                                <TableCell className="font-mono font-semibold">{vidrio.codigo ?? "—"}</TableCell>
                                <TableCell>
                                    {vidrio.ventana} - {vidrio.tipo}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{vidrio.grupo}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatMm(vidrio.ancho)} × {formatMm(vidrio.alto)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">{formatArea(vidrio.area, 3)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
