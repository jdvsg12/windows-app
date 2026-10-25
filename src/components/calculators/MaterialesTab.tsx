"use client"

import { Package } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { textoListaCompra, type ListaCompra } from "@/lib/lista-compra"
import type { VidrioCorte } from "@/lib/types"
import { AccesoriosCompra } from "./AccesoriosCompra"
import { ErroresPuertas } from "./ErroresPuertas"
import { PerfilesCompra } from "./PerfilesCompra"
import { ResumenCompra } from "./ResumenCompra"
import { VidriosCompra } from "./VidriosCompra"

interface Props {
    proyecto: string
    listaCompra: ListaCompra
    vidrios: VidrioCorte[]
    erroresPuertas: readonly string[]
    tamanoLamina: string
}

// Lista de compra del proyecto. El despiece de cada pieza está en Optimización.
export function MaterialesTab({ proyecto, listaCompra, vidrios, erroresPuertas, tamanoLamina }: Props) {
    const vacia = listaCompra.grupos.length === 0 && listaCompra.accesorios.length === 0 && vidrios.length === 0
    const laminas = listaCompra.laminas.reduce((total, grupo) => total + grupo.laminas, 0)

    return (
        <div className="space-y-7">
            <ErroresPuertas errores={erroresPuertas} />
            {vacia ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            size="compact"
                            icon={Package}
                            title="Todavía no hay nada que comprar"
                            description="Agrega ventanas o puertas en la pestaña Productos y aquí aparece lo que hay que comprar."
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <ResumenCompra
                        barras={listaCompra.totalBarras}
                        accesorios={listaCompra.accesorios.length}
                        laminas={laminas}
                        texto={textoListaCompra(listaCompra, proyecto, tamanoLamina)}
                    />
                    <PerfilesCompra grupos={listaCompra.grupos} />
                    <AccesoriosCompra accesorios={listaCompra.accesorios} />
                    <VidriosCompra vidrios={vidrios} laminas={listaCompra.laminas} tamanoLamina={tamanoLamina} />
                </>
            )}
        </div>
    )
}
