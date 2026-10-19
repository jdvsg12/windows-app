import { textoFormaPago, type ResumenPago } from "@/lib/pdf/cotizacion-formato"
import type { DocumentoCotizacion } from "@/lib/types"

interface CondicionesPreviewProps {
    documento: DocumentoCotizacion
    pago: ResumenPago | null
}

const titulo = "mb-2 border-b border-paper-panel-border pb-1 text-xs font-black uppercase tracking-wider"


export function CondicionesPreview({ documento, pago }: CondicionesPreviewProps) {
    const condiciones = [
        { titulo: "Forma de pago", texto: textoFormaPago(pago) },
        documento.tiempoEntrega && { titulo: "Tiempo de entrega", texto: documento.tiempoEntrega },
        documento.validez && { titulo: "Validez de la oferta", texto: documento.validez },
    ].filter((condicion): condicion is { titulo: string; texto: string } => Boolean(condicion))

    return (
        <section className="mb-6 grid gap-5 text-sm sm:grid-cols-12">
            <div className="sm:col-span-5">
                <h3 className={titulo}>Condiciones comerciales</h3>
                <ul className="space-y-2">
                    {condiciones.map((condicion) => (
                        <li key={condicion.titulo}>
                            <strong>{condicion.titulo}:</strong> <span className="text-paper-muted">{condicion.texto}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {documento.empresa.datosBancarios && (
                <div className="border border-paper-panel-border bg-paper-panel p-3.5 sm:col-span-7">
                    <h3 className={titulo}>Información bancaria</h3>
                    <p className="whitespace-pre-wrap">{documento.empresa.datosBancarios}</p>
                </div>
            )}
        </section>
    )
}
