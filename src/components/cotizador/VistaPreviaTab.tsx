"use client"

import { Card, CardContent } from "@/components/ui/card"
import { resumenPago } from "@/lib/pdf/cotizacion-formato"
import { parsearTextoEnriquecido } from "@/lib/pdf/texto-enriquecido"
import type { DocumentoCotizacion } from "@/lib/types"
import { ClientePreview } from "./vista-previa/ClientePreview"
import { CondicionesPreview } from "./vista-previa/CondicionesPreview"
import { DescripcionPreview } from "./vista-previa/DescripcionPreview"
import { EncabezadoPreview } from "./vista-previa/EncabezadoPreview"
import { FirmasPreview } from "./vista-previa/FirmasPreview"
import { ResumenPagoPreview } from "./vista-previa/ResumenPagoPreview"
import { TablaVentanasPreview } from "./vista-previa/TablaVentanasPreview"

interface VistaPreviaTabProps {
    documento: DocumentoCotizacion
}

const tituloSeccion = "mb-3 border-b border-paper-panel-border pb-1 text-xs font-bold uppercase tracking-wider"

// Lee el mismo DocumentoCotizacion que el PDF (CotizacionPdf) y repite sus secciones, así no se desalinean.
export function VistaPreviaTab({ documento }: VistaPreviaTabProps) {
    const pago = documento.mostrarValores ? resumenPago(documento.total) : null
    const tieneDescripcion = parsearTextoEnriquecido(documento.descripcion).length > 0

    return (
        <Card>
            <CardContent className="min-h-[800px] bg-paper p-4 text-paper-ink sm:p-10">
                <EncabezadoPreview documento={documento} />
                <ClientePreview documento={documento} />

                {tieneDescripcion && (
                    <section className="mb-6 text-sm">
                        <h3 className={tituloSeccion}>Criterios técnicos y especificaciones</h3>
                        <DescripcionPreview html={documento.descripcion} />
                    </section>
                )}

                <section className="mb-6">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider">Ventanas del proyecto</h3>
                    <TablaVentanasPreview documento={documento} />
                </section>

                {pago && documento.total !== null && <ResumenPagoPreview total={documento.total} pago={pago} />}
                <CondicionesPreview documento={documento} pago={pago} />
                <FirmasPreview empresa={documento.empresa} />

                <footer className="mt-8 flex justify-between border-t border-paper-panel-border pt-2 text-[10px] text-paper-muted">
                    <span>Documento generado digitalmente • {documento.empresa.nombre}</span>
                </footer>
            </CardContent>
        </Card>
    )
}
