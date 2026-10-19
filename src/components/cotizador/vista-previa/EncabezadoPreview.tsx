import type { DocumentoCotizacion } from "@/lib/types"

interface EncabezadoPreviewProps {
    documento: DocumentoCotizacion
}

const etiqueta = "text-[10px] font-bold uppercase tracking-wide text-paper-muted"

export function EncabezadoPreview({ documento }: EncabezadoPreviewProps) {
    const { empresa } = documento
    const direccion = [empresa.direccion, empresa.ciudad].filter(Boolean).join(" • ")
    const contacto = [empresa.telefonos && `Cel: ${empresa.telefonos}`, empresa.email && `Email: ${empresa.email}`].filter(Boolean).join(" • ")

    return (
        <header className="mb-6 flex flex-col gap-4 border-b-2 border-paper-header pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
                {empresa.logo && <img src={empresa.logo} alt={`${empresa.nombre} - logo`} className="h-16 w-16 shrink-0 object-contain" />}
                <div className="text-xs text-paper-muted">
                    <p className="text-base font-bold text-paper-ink">{empresa.nombre}</p>
                    {empresa.nit && (
                        <p>
                            <span className="font-bold text-paper-ink">NIT:</span> {empresa.nit}
                        </p>
                    )}
                    {direccion && <p>{direccion}</p>}
                    {contacto && <p>{contacto}</p>}
                </div>
            </div>
            <div className="flex flex-col items-start sm:items-end">
                <span className="mb-2 bg-paper-header px-3.5 py-1 text-xs font-black uppercase tracking-widest text-paper-header-ink">Cotización</span>
                {documento.fecha && (
                    <p className="text-xs">
                        <span className={etiqueta}>Fecha:</span> <span className="font-semibold">{documento.fecha}</span>
                    </p>
                )}
                {documento.validez && (
                    <p className="text-xs">
                        <span className={etiqueta}>Validez:</span> <span className="font-semibold text-paper-ok">{documento.validez}</span>
                    </p>
                )}
            </div>
        </header>
    )
}
