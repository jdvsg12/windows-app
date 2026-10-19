"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatArea } from "@/lib/format"
import type { DocumentoCotizacion } from "@/lib/types"
import { DescripcionPreview } from "./DescripcionPreview"
import { TablaVentanasPreview } from "./TablaVentanasPreview"

interface VistaPreviaTabProps {
    documento: DocumentoCotizacion
}

// Lee el mismo DocumentoCotizacion que el PDF (CotizacionPdf), así la vista previa no se desalinea.
export function VistaPreviaTab({ documento }: VistaPreviaTabProps) {
    const { empresa } = documento
    const mostrarAreaTotal = documento.mostrarMedidas && documento.areaTotal !== null

    return (
        <Card>
            <CardContent className="p-8 bg-paper text-paper-ink min-h-[800px]">
                <div className="flex justify-between items-start mb-8 border-b-2 border-paper-ink pb-4">
                    {empresa.logo ? (
                        <div className="w-32 h-32">
                            <img src={empresa.logo} alt={`${empresa.nombre} - logo`} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div />
                    )}
                    <div className="text-right text-sm leading-relaxed">
                        <p className="font-bold mb-1">{empresa.nombre}</p>
                        <p>NIT: {empresa.nit}</p>
                        <p>{empresa.direccion}</p>
                        <p>CEL: {empresa.telefonos}</p>
                        <p>e-mail: {empresa.email}</p>
                        <p>{empresa.ciudad}</p>
                    </div>
                </div>

                <p className="mb-6 text-right">{documento.fecha}</p>

                <div className="mb-6">
                    <p className="mb-1">Señor(a):</p>
                    <p className="font-bold">{documento.cliente}</p>
                    {documento.direccionObra && <p>{documento.direccionObra}</p>}
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 underline">COTIZACIÓN</h2>

                <DescripcionPreview html={documento.descripcion} />

                <div className="mb-6">
                    <h3 className="font-bold mb-4">Ventanas del Proyecto: {documento.proyecto}</h3>
                    <TablaVentanasPreview documento={documento} />
                    <p className="font-bold">Total de ventanas: {documento.filas.length}</p>
                    {mostrarAreaTotal && <p className="mt-1">Área total: {formatArea(documento.areaTotal ?? undefined)}</p>}
                </div>

                {(documento.tiempoEntrega || documento.validez) && (
                    <div className="mb-6">
                        {documento.tiempoEntrega && (
                            <p>
                                <span className="font-bold">Tiempo de entrega:</span> {documento.tiempoEntrega}
                            </p>
                        )}
                        {documento.validez && (
                            <p>
                                <span className="font-bold">Validez de la cotización:</span> {documento.validez}
                            </p>
                        )}
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="font-bold mb-2">FORMA DE PAGO:</h3>
                    <p>Anticipo 60%</p>
                    <p>Saldo: PAGOS PARCIALES SEGÚN AVANCE DE LA OBRA</p>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold mb-2">DATOS BANCARIOS:</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{empresa.datosBancarios}</p>
                </div>

                <div className="mt-12 border-t border-paper-ink pt-4">
                    {empresa.firma && <img src={empresa.firma} alt={`Firma de ${empresa.representante}`} className="h-16 w-auto object-contain" />}
                    <p>___________________________</p>
                    <p className="font-bold">{empresa.representante}</p>
                    <p>C.C. {empresa.cedula}</p>
                </div>
            </CardContent>
        </Card>
    )
}
