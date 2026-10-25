import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ACCESORIOS_PUERTA_ALUMINA, PERFILES_PUERTA_ALUMINA, type ItemCatalogoAlumina } from "@/lib/catalogo-alumina"
import { ACCESORIOS_PUERTA, REFERENCIAS_PERFIL_PUERTA, type AccesoriosPuerta } from "@/lib/calculo/motor-puerta-alumina"

interface HerrajesPuertasCardProps {
    accesorios: AccesoriosPuerta
}

interface ItemConImagenProps {
    item: ItemCatalogoAlumina
    cantidad?: number
}

function ItemConImagen({ item, cantidad }: ItemConImagenProps) {
    return (
        <li className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-paper">
                {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} className="h-full w-full object-contain" />
                ) : (
                    <span className="text-caption text-muted-foreground">Sin imagen</span>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-medium">{item.nombre}</p>
                <p className="text-sm text-muted-foreground">{item.especificacion}</p>
            </div>
            {cantidad !== undefined && <p className="text-lg font-semibold tabular-nums">{cantidad}</p>}
        </li>
    )
}

// Herrajes de todas las puertas del proyecto y las referencias de perfil, con sus imágenes técnicas.
export function HerrajesPuertasCard({ accesorios }: HerrajesPuertasCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Herrajes de puertas</CardTitle>
                <CardDescription>Cantidades para todas las puertas del proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {ACCESORIOS_PUERTA.map((clave) => (
                        <ItemConImagen key={clave} item={ACCESORIOS_PUERTA_ALUMINA[clave]} cantidad={accesorios[clave]} />
                    ))}
                </ul>
                <div className="space-y-3">
                    <h3 className="font-semibold">Perfiles</h3>
                    <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {REFERENCIAS_PERFIL_PUERTA.map((referencia) => (
                            <ItemConImagen key={referencia} item={PERFILES_PUERTA_ALUMINA[referencia]} />
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
