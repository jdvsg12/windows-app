import { Text, View, type Styles } from "@react-pdf/renderer"

import { estilosBase } from "@/lib/pdf/estilos"

export interface ColumnaPdf {
    titulo: string
    estilo: Styles[string]
}

interface TablaPdfProps {
    columnas: readonly ColumnaPdf[]
    filas: readonly (readonly string[])[]
    tamanoLetra?: number
}

// Tabla genérica de los PDF: encabezado repetido en cada página y filas que no se parten.
export function TablaPdf({ columnas, filas, tamanoLetra = 8 }: TablaPdfProps) {
    return (
        <View style={{ fontSize: tamanoLetra }}>
            <View style={[estilosBase.filaTabla, estilosBase.encabezadoTabla]} fixed>
                {columnas.map((columna, indice) => (
                    <Text key={columna.titulo} style={[estilosBase.celda, columna.estilo, indice === columnas.length - 1 ? { borderRightWidth: 0 } : {}]}>
                        {columna.titulo}
                    </Text>
                ))}
            </View>
            {filas.map((fila, indiceFila) => (
                <View key={indiceFila} style={estilosBase.filaTabla} wrap={false}>
                    {fila.map((celda, indice) => (
                        <Text key={indice} style={[estilosBase.celda, columnas[indice].estilo, indice === fila.length - 1 ? { borderRightWidth: 0 } : {}]}>
                            {celda}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    )
}
