import type { DocumentoCotizacion } from "@/lib/types"

interface ClientePreviewProps {
    documento: DocumentoCotizacion
}

interface FilaClienteProps {
    etiqueta: string
    valor: string
    destacado?: boolean
}

function FilaCliente({ etiqueta, valor, destacado = false }: FilaClienteProps) {
    return (
        <p className="flex">
            <span className="w-24 shrink-0 text-paper-muted">{etiqueta}</span>
            <span className={destacado ? "font-bold" : undefined}>{valor}</span>
        </p>
    )
}

export function ClientePreview({ documento }: ClientePreviewProps) {
    return (
        <section className="mb-6 space-y-1 border border-paper-panel-border bg-paper-panel p-3.5 text-sm">
            <FilaCliente etiqueta="Atención:" valor={documento.cliente || "—"} destacado />
            <FilaCliente etiqueta="Proyecto:" valor={documento.proyecto} />
            {documento.direccionObra && <FilaCliente etiqueta="Obra:" valor={documento.direccionObra} />}
        </section>
    )
}
