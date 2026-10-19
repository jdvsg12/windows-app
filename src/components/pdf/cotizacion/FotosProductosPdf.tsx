import { Image, Text, View } from "@react-pdf/renderer"

import type { ProductoCotizacion } from "@/lib/types"

interface FotosProductosPdfProps {
    productos: readonly ProductoCotizacion[]
}

const ALTO_FOTO = 72

export function FotosProductosPdf({ productos }: FotosProductosPdfProps) {
    const conFoto = productos.filter((producto) => producto.imagen)
    if (conFoto.length === 0) return null

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 8 }} wrap={false}>
            {conFoto.map((producto) => (
                <View key={producto.clave} style={{ width: "33.33%", alignItems: "center", paddingHorizontal: 6, marginBottom: 6 }}>
                    <Text style={{ fontSize: 8, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>{producto.nombre}</Text>
                    {producto.imagen && <Image src={producto.imagen} style={{ height: ALTO_FOTO, width: ALTO_FOTO * 1.5, objectFit: "contain" }} />}
                </View>
            ))}
        </View>
    )
}
