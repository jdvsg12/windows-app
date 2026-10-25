import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PERFILES_PUERTA_ALUMINA } from "@/lib/catalogo-alumina"
import type { PuertaCalculada } from "@/lib/calculo/plan-puertas"
import type { DespiecePuerta } from "@/lib/calculo/motor-puerta-alumina"
import { ESTILOS_PERFIL_PUERTA } from "@/lib/design/piezas"
import { formatArea, formatMm } from "@/lib/format"
import { PiezaBadge } from "./PiezaBadge"

interface DespiecePuertaCardProps {
    calculada: PuertaCalculada & { despiece: DespiecePuerta }
}

// Despiece de una puerta: perfiles con sus cortes y el vidrio, tal como se mandan a cortar.
export function DespiecePuertaCard({ calculada: { puerta, codigo, despiece } }: DespiecePuertaCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <span className="mr-1 font-mono text-muted-foreground">{codigo}</span> {puerta.nombre}
                </CardTitle>
                <CardDescription>
                    Vano {formatMm(puerta.ancho)} × {formatMm(puerta.alto)}; hoja {formatMm(despiece.hoja.ancho)} ×{" "}
                    {formatMm(despiece.hoja.alto)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pieza</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead className="text-right">Cant.</TableHead>
                            <TableHead className="text-right">Longitud</TableHead>
                            <TableHead>Cortes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {despiece.piezas.map((pieza) => (
                            <TableRow key={pieza.pieza}>
                                <TableCell>
                                    <span className="inline-flex items-center gap-2">
                                        <PiezaBadge estilo={ESTILOS_PERFIL_PUERTA[pieza.referencia]} />
                                        {pieza.pieza}
                                    </span>
                                </TableCell>
                                <TableCell>{PERFILES_PUERTA_ALUMINA[pieza.referencia].nombre}</TableCell>
                                <TableCell className="text-right">{pieza.cantidad}</TableCell>
                                <TableCell className="text-right">{formatMm(pieza.longitud)}</TableCell>
                                <TableCell>{pieza.cortes.map((angulo) => `${angulo}°`).join(" / ")}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell>Vidrio</TableCell>
                            <TableCell>{formatArea(despiece.vidrio.area, 3)}</TableCell>
                            <TableCell className="text-right">{despiece.vidrio.cantidad}</TableCell>
                            <TableCell className="text-right">
                                {formatMm(despiece.vidrio.ancho)} × {formatMm(despiece.vidrio.alto)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
