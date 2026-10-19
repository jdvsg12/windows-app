import type { ProductoCotizacion } from "@/lib/types"

interface FotosProductosPreviewProps {
    productos: readonly ProductoCotizacion[]
}

export function FotosProductosPreview({ productos }: FotosProductosPreviewProps) {
    const conFoto = productos.filter((producto) => producto.imagen)
    if (conFoto.length === 0) return null

    return (
        <div className="mt-3 flex flex-wrap justify-center gap-6">
            {conFoto.map((producto) => (
                <figure key={producto.clave} className="w-36 text-center">
                    <figcaption className="mb-1.5 text-xs font-semibold">{producto.nombre}</figcaption>
                    <img src={producto.imagen} alt={producto.nombre} className="mx-auto h-24 w-auto object-contain" />
                </figure>
            ))}
        </div>
    )
}
