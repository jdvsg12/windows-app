"use client"

import { useState } from "react"
import { Grid3X3 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { PUERTA_ALUMINA } from "@/lib/catalogo-alumina"
import { codigoPuerta } from "@/lib/calculo/plan-puertas"
import type { VentanaFormValues } from "@/lib/schemas"
import {
    especificacionesPuerta,
    especificacionesVentana,
    getTipoVentanaLabel,
    tipoDesdeFormulario,
    type CalibreVidrio,
    type ParametrosPuertaAlumina,
    type Proyecto,
    type Puerta,
    type Ventana,
} from "@/lib/types"
import { DatosProyectoCard, type DatosProyectoValues } from "./DatosProyectoCard"
import { ProductoCard } from "./ProductoCard"
import { PuertaForm } from "./PuertaForm"
import { SelectorProducto, type ProductoAgregable } from "./SelectorProducto"
import { VentanaForm } from "./VentanaForm"

const ventanaDesdeFormulario = ({ ambasMoviles, ancho, alto, tipoVentana, calibreVidrio, ...resto }: VentanaFormValues): Omit<Ventana, "id"> => ({
    ...resto,
    ancho: Number.parseFloat(ancho),
    alto: Number.parseFloat(alto),
    tipoVentana: tipoDesdeFormulario(tipoVentana, ambasMoviles),
    calibreVidrio: Number(calibreVidrio) as CalibreVidrio,
})

interface Editando {
    producto: ProductoAgregable
    id: string
}

interface ProductosTabProps {
    proyecto: Proyecto
    ventanas: Ventana[]
    puertas: Puerta[]
    parametrosPuerta: ParametrosPuertaAlumina
    onAgregarVentana: (datos: Omit<Ventana, "id">, editandoId: string | null) => void
    onEliminarVentana: (id: string) => void
    onAgregarPuerta: (datos: Omit<Puerta, "id">, editandoId: string | null) => void
    onEliminarPuerta: (id: string) => void
    onActualizarDatosProyecto: (datos: DatosProyectoValues) => void
}

export function ProductosTab({
    proyecto,
    ventanas,
    puertas,
    parametrosPuerta,
    onAgregarVentana,
    onEliminarVentana,
    onAgregarPuerta,
    onEliminarPuerta,
    onActualizarDatosProyecto,
}: ProductosTabProps) {
    const [producto, setProducto] = useState<ProductoAgregable>("ventana")
    const [editando, setEditando] = useState<Editando | null>(null)
    const editingVentana = editando?.producto === "ventana" ? (ventanas.find((ventana) => ventana.id === editando.id) ?? null) : null
    const editingPuerta = editando?.producto === "puerta" ? (puertas.find((puerta) => puerta.id === editando.id) ?? null) : null

    const editar = (siguiente: Editando) => {
        setProducto(siguiente.producto)
        setEditando(siguiente)
    }

    const eliminar = (objetivo: Editando) => {
        if (editando?.id === objetivo.id) setEditando(null)
        if (objetivo.producto === "ventana") onEliminarVentana(objetivo.id)
        else onEliminarPuerta(objetivo.id)
    }

    return (
        <div className="space-y-4">
            <DatosProyectoCard proyecto={proyecto} onActualizar={onActualizarDatosProyecto} />

            <SelectorProducto value={producto} onChange={setProducto} disabled={editando !== null} />

            {producto === "ventana" ? (
                <VentanaForm
                    editingVentana={editingVentana}
                    onSubmit={(values) => {
                        onAgregarVentana(ventanaDesdeFormulario(values), editingVentana?.id ?? null)
                        setEditando(null)
                    }}
                    onCancelEdit={() => setEditando(null)}
                />
            ) : (
                <PuertaForm
                    editingPuerta={editingPuerta}
                    parametros={parametrosPuerta}
                    onSubmit={(datos) => {
                        onAgregarPuerta(datos, editingPuerta?.id ?? null)
                        setEditando(null)
                    }}
                    onCancelEdit={() => setEditando(null)}
                />
            )}

            {ventanas.length === 0 && puertas.length === 0 ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            size="compact"
                            icon={Grid3X3}
                            title="No hay productos agregados"
                            description="Elige ventana o puerta y usa el formulario de arriba para agregarla"
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ventanas.map((ventana, indice) => (
                        <ProductoCard
                            key={ventana.id}
                            codigo={`V${indice + 1}`}
                            nombre={ventana.nombre}
                            sustantivo="ventana"
                            tipo={getTipoVentanaLabel(ventana.tipoVentana)}
                            lineas={[
                                `${ventana.ancho} × ${ventana.alto} mm`,
                                `Sistema: ${ventana.sistema || "5020"}`,
                                especificacionesVentana(ventana).join(" · ") || "Sin especificaciones",
                            ]}
                            activo={editando?.id === ventana.id}
                            onEditar={() => editar({ producto: "ventana", id: ventana.id })}
                            onEliminar={() => eliminar({ producto: "ventana", id: ventana.id })}
                        />
                    ))}
                    {puertas.map((puerta, indice) => (
                        <ProductoCard
                            key={puerta.id}
                            codigo={codigoPuerta(indice)}
                            nombre={puerta.nombre}
                            sustantivo="puerta"
                            tipo="Puerta abatible"
                            lineas={[
                                `Vano ${puerta.ancho} × ${puerta.alto} mm`,
                                `${PUERTA_ALUMINA.fabricante}, sistema ${PUERTA_ALUMINA.sistema.toLowerCase()}`,
                                especificacionesPuerta(puerta).join(" · "),
                            ]}
                            activo={editando?.id === puerta.id}
                            onEditar={() => editar({ producto: "puerta", id: puerta.id })}
                            onEliminar={() => eliminar({ producto: "puerta", id: puerta.id })}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
