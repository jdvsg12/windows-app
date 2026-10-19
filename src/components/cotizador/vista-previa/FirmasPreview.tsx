import type { ConfiguracionEmpresa } from "@/lib/types"

interface FirmasPreviewProps {
    empresa: ConfiguracionEmpresa
}

export function FirmasPreview({ empresa }: FirmasPreviewProps) {
    return (
        <section className="mt-6 grid gap-8 border-t border-paper-panel-border pt-4 text-sm sm:grid-cols-2">
            <div>
                <div className="flex h-16 items-end">
                    {empresa.firma && <img src={empresa.firma} alt={`Firma de ${empresa.representante}`} className="h-16 w-auto object-contain" />}
                </div>
                <div className="border-t-2 border-paper-header pt-1.5">
                    <p className="font-bold uppercase">{empresa.representante}</p>
                    {empresa.cedula && <p className="text-paper-muted">C.C. {empresa.cedula}</p>}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-paper-accent">{empresa.nombre}</p>
                </div>
            </div>
            <div>
                <div className="flex h-16 items-end justify-center pb-2 text-xs italic text-paper-muted">Firma y sello de aceptación</div>
                <div className="border-t-2 border-dashed border-paper-muted pt-1.5">
                    <p className="font-bold uppercase">Aceptado por el cliente</p>
                    <p className="flex justify-between text-paper-muted">
                        <span>C.C. / NIT: __________</span>
                        <span>Fecha: ___/___/_____</span>
                    </p>
                </div>
            </div>
        </section>
    )
}
