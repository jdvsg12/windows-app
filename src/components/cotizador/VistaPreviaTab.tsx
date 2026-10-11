"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatArea, formatCount, formatCurrency } from "@/lib/format"
import { getTipoVentanaLabel, type ConfiguracionEmpresa, type Proyecto, type CostosCalculadosCotizador } from "@/lib/types"

interface Props {
    config: ConfiguracionEmpresa
    logo: string
    proyecto: Proyecto
    fecha: string
    descripcion: string
    mostrarMedidas: boolean
    mostrarValores: boolean
    costosCalculados: CostosCalculadosCotizador | null
}

export function VistaPreviaTab({
    config,
    logo,
    proyecto,
    fecha,
    descripcion,
    mostrarMedidas,
    mostrarValores,
    costosCalculados,
}: Props) {
    return (
        <Card>
            <CardContent className="p-8 bg-paper text-paper-ink min-h-[800px]">
                <div className="flex justify-between items-start mb-8 border-b-2 border-paper-ink pb-4">
                    {logo && (
                        <div className="w-32 h-32">
                            <img src={logo || "/placeholder.svg"} alt={`${config.nombre} - logo`} className="w-full h-full object-contain" />
                        </div>
                    )}
                    <div className="text-right text-sm leading-relaxed">
                        <p className="font-bold mb-1">{config.nombre}</p>
                        <p>NIT: {config.nit}</p>
                        <p>{config.direccion}</p>
                        <p>CEL: {config.telefonos}</p>
                        <p>e-mail: {config.email}</p>
                        <p>{config.ciudad}</p>
                    </div>
                </div>

                <div className="mb-6 text-right">
                    <p>{fecha}</p>
                </div>

                <div className="mb-6">
                    <p className="mb-1">Señor(a):</p>
                    <p className="font-bold">{proyecto.cliente}</p>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 underline">COTIZACIÓN</h2>

                {descripcion && (
                    <div className="mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: descripcion }} />
                )}

                <div className="mb-6">
                    <h3 className="font-bold mb-4">Ventanas del Proyecto: {proyecto.nombre}</h3>
                    <table className="w-full border-collapse border border-paper-rule mb-4">
                        <thead>
                            <tr className="bg-paper-shade">
                                <th className="border border-paper-rule p-2 text-left">Nombre</th>
                                <th className="border border-paper-rule p-2 text-left">Tipo</th>
                                {mostrarMedidas && (
                                    <>
                                        <th className="border border-paper-rule p-2 text-left">Ancho (mm)</th>
                                        <th className="border border-paper-rule p-2 text-left">Alto (mm)</th>
                                        <th className="border border-paper-rule p-2 text-right">Área (m²)</th>
                                    </>
                                )}
                                {mostrarValores && costosCalculados && (
                                    <th className="border border-paper-rule p-2 text-right">Valor</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {proyecto.ventanas.map((ventana) => {
                                const valorVentana = costosCalculados?.valoresPorVentana?.find((v) => v.id === ventana.id)
                                return (
                                    <tr key={ventana.id}>
                                        <td className="border border-paper-rule p-2">{ventana.nombre}</td>
                                        <td className="border border-paper-rule p-2">
                                            {getTipoVentanaLabel(ventana.tipoVentana)}
                                        </td>
                                        {mostrarMedidas && (
                                            <>
                                                <td className="border border-paper-rule p-2">{ventana.ancho}</td>
                                                <td className="border border-paper-rule p-2">{ventana.alto}</td>
                                                <td className="border border-paper-rule p-2 text-right">
                                                    {formatCount(valorVentana?.area, 2)}
                                                </td>
                                            </>
                                        )}
                                        {mostrarValores && costosCalculados && (
                                            <td className="border border-paper-rule p-2 text-right">
                                                {formatCurrency(valorVentana?.valor)}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div>
                        <p className="font-bold">Total de ventanas: {proyecto.ventanas.length}</p>
                        {mostrarMedidas && costosCalculados && (
                            <p className="mt-1">Área total: {formatArea(costosCalculados?.areaTotal)}</p>
                        )}
                        {mostrarValores && costosCalculados && (
                            <p className="mt-2 text-lg font-bold">
                                VALOR TOTAL: {formatCurrency(costosCalculados?.total)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold mb-2">FORMA DE PAGO:</h3>
                    <p>Anticipo 60%</p>
                    <p>Saldo: PAGOS PARCIALES SEGÚN AVANCE DE LA OBRA</p>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold mb-2">DATOS BANCARIOS:</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{config.datosBancarios}</p>
                </div>

                <div className="mt-12 border-t border-paper-ink pt-4">
                    <p>___________________________</p>
                    <p className="font-bold">{config.representante}</p>
                    <p>C.C. {config.cedula}</p>
                </div>
            </CardContent>
        </Card>
    )
}
