import { formatCurrency } from "@/lib/format"
import { PORCENTAJE_ANTICIPO, type ResumenPago } from "@/lib/pdf/cotizacion-formato"

interface ResumenPagoPreviewProps {
    total: number
    pago: ResumenPago
}

const etiqueta = "block text-[10px] font-bold uppercase tracking-wide"

export function ResumenPagoPreview({ total, pago }: ResumenPagoPreviewProps) {
    return (
        <section className="mb-6 grid gap-3 border border-paper-panel-border bg-paper-panel p-3.5 sm:grid-cols-12 sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:col-span-7">
                <div className="bg-paper-accent-soft p-2">
                    <span className={`${etiqueta} text-paper-accent`}>Anticipo ({PORCENTAJE_ANTICIPO} %)</span>
                    <span className="font-bold tabular-nums text-paper-accent">{formatCurrency(pago.anticipo)}</span>
                </div>
                <div className="border border-paper-panel-border bg-paper p-2">
                    <span className={`${etiqueta} text-paper-muted`}>Saldo ({100 - PORCENTAJE_ANTICIPO} %)</span>
                    <span className="font-bold tabular-nums">{formatCurrency(pago.saldo)}</span>
                </div>
            </div>
            <div className="flex items-center justify-between border-t-2 border-paper-header pt-2 sm:col-span-5 sm:border-l-2 sm:border-t-0 sm:pl-4 sm:pt-0">
                <span className="text-sm font-black uppercase">Total proyecto</span>
                <span className="text-right">
                    <span className="block text-xl font-black tabular-nums">{formatCurrency(total)}</span>
                    <span className={`${etiqueta} text-paper-muted`}>COP</span>
                </span>
            </div>
        </section>
    )
}
