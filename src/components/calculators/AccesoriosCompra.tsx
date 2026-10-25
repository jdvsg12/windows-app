import { Cog } from "lucide-react"

import type { AccesorioCompra } from "@/lib/lista-compra"

interface AccesoriosCompraProps {
    accesorios: readonly AccesorioCompra[]
}

const cantidadTexto = ({ cantidad, unidad }: AccesorioCompra) =>
    unidad === "metros" ? cantidad.toLocaleString("es-CO", { maximumFractionDigits: 1 }) : String(cantidad)

const unidadTexto = ({ cantidad, unidad }: AccesorioCompra) => (unidad === "metros" ? "metros" : cantidad === 1 ? "unidad" : "unidades")

// Accesorios y herrajes del proyecto: cantidad total y en qué ventanas y puertas va cada uno.
export function AccesoriosCompra({ accesorios }: AccesoriosCompraProps) {
    if (accesorios.length === 0) return null
    return (
        <section aria-labelledby="accesorios-compra" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="accesorios-compra" className="text-xl font-bold">
                    Accesorios y herrajes
                </h2>
                <p className="text-sm text-muted-foreground">Cantidad total y en qué productos va cada uno.</p>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-3">
                {accesorios.map((accesorio) => (
                    <li key={accesorio.clave} className="flex items-center gap-3.5 rounded-lg border bg-card p-3">
                        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-md border bg-paper">
                            {accesorio.imagen ? (
                                <img src={accesorio.imagen} alt={accesorio.nombre} className="h-full w-full object-contain" />
                            ) : (
                                <Cog className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold">{accesorio.nombre}</p>
                            {accesorio.detalle && <p className="text-sm text-muted-foreground">{accesorio.detalle}</p>}
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{accesorio.en.join(" · ")}</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-2xl font-bold leading-none tabular-nums">{cantidadTexto(accesorio)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{unidadTexto(accesorio)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
