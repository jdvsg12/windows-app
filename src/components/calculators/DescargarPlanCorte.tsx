"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useDescargaPdf } from "@/hooks/useDescargaPdf"
import { nombreArchivoPdf } from "@/lib/pdf/descargar"
import { armarDocumentoPlanCorte } from "@/lib/pdf/plan-corte-modelo"
import type { LaminaVidrio, OptimizacionPerfil } from "@/lib/types"

interface DescargarPlanCorteProps {
    proyecto: string
    laminas: LaminaVidrio[]
    perfiles: Record<string, OptimizacionPerfil>
}

export function DescargarPlanCorte({ proyecto, laminas, perfiles }: DescargarPlanCorteProps) {
    const { descargar, generando, error } = useDescargaPdf()

    const handleDescargar = () => {
        const documento = armarDocumentoPlanCorte({ proyecto, laminas, perfiles, hoy: new Date() })
        descargar(
            async () => (await import("@/components/pdf/PlanCortePdf")).crearPlanCortePdf(documento),
            nombreArchivoPdf("Plan_de_corte", proyecto),
        )
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <Button variant="outline" size="sm" onClick={handleDescargar} disabled={generando || laminas.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                {generando ? "Generando PDF…" : "Descargar plan de corte"}
            </Button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
