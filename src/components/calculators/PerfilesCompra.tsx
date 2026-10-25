import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LONGITUD_BARRA } from "@/lib/calculo/comun"
import { formatMeters } from "@/lib/format"
import type { GrupoPerfilesCompra, PerfilCompra } from "@/lib/lista-compra"
import { cn } from "@/lib/utils"
import { PiezaBadge } from "./PiezaBadge"

interface PerfilesCompraProps {
    grupos: readonly GrupoPerfilesCompra[]
}

interface TarjetaPerfilProps {
    perfil: PerfilCompra
}

function TarjetaPerfil({ perfil }: TarjetaPerfilProps) {
    const disponibles = perfil.barras * LONGITUD_BARRA
    const uso = Math.min(100, Math.round((perfil.metrosUsados / disponibles) * 100))
    return (
        <article className="flex flex-col overflow-hidden rounded-lg border">
            <div className="relative flex h-32 items-center justify-center bg-paper">
                {perfil.imagen ? (
                    <img src={perfil.imagen} alt={`Sección del perfil ${perfil.referencia}`} className="max-h-28 max-w-[82%] object-contain" />
                ) : (
                    <div className="flex h-24 w-[78%] flex-col items-center justify-center rounded-md border border-dashed text-center text-xs text-muted-foreground">
                        <span className="font-mono text-sm font-semibold text-foreground">{perfil.referencia}</span>
                        Sin dibujo
                    </div>
                )}
                <PiezaBadge estilo={perfil.estilo} className="absolute left-2.5 top-2.5" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3.5">
                <div>
                    <h4 className="font-semibold">{perfil.nombre}</h4>
                    <p className="text-sm text-muted-foreground">Ref. {perfil.referencia}</p>
                </div>
                <p className="mt-auto flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold leading-none tabular-nums">{perfil.barras}</span>
                    <span className="text-sm text-muted-foreground">{perfil.barras === 1 ? "barra" : "barras"}</span>
                </p>
                <div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                        <div className={cn("h-full rounded-full border", perfil.estilo.clases)} style={{ width: `${uso}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatMeters(perfil.metrosUsados)} de {disponibles} m
                    </p>
                </div>
            </div>
        </article>
    )
}

// Barras de 6 m a comprar, por producto y color, con el dibujo de cada referencia.
export function PerfilesCompra({ grupos }: PerfilesCompraProps) {
    if (grupos.length === 0) return null
    return (
        <section aria-labelledby="perfiles-compra" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="perfiles-compra" className="text-xl font-bold">
                    Perfiles
                </h2>
                <p className="text-sm text-muted-foreground">Barras de 6 m por referencia y color. El corte de cada barra está en Optimización.</p>
            </div>
            {grupos.map((grupo) => (
                <Card key={grupo.clave}>
                    <CardHeader>
                        <CardTitle>{grupo.producto}</CardTitle>
                        <CardDescription>
                            Aluminio {grupo.color.toLowerCase()}; {grupo.productos.join(", ")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(45%,200px),1fr))] gap-3">
                            {grupo.perfiles.map((perfil) => (
                                <TarjetaPerfil key={perfil.clave} perfil={perfil} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    )
}
