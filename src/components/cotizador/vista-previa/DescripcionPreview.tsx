import { cn } from "@/lib/utils"
import { parsearTextoEnriquecido } from "@/lib/pdf/texto-enriquecido"
import type { AlineacionTexto, BloqueTexto, TramoTexto } from "@/lib/types"

const ALINEACION: Record<AlineacionTexto, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
}

interface DescripcionPreviewProps {
    html: string
}

interface TramosPreviewProps {
    tramos: TramoTexto[]
}

interface BloquePreviewProps {
    bloque: BloqueTexto
}

function TramosPreview({ tramos }: TramosPreviewProps) {
    return tramos.map((tramo, indice) => (
        <span key={indice} className={cn(tramo.negrita && "font-bold", tramo.cursiva && "italic")}>
            {tramo.texto}
        </span>
    ))
}

function BloquePreview({ bloque }: BloquePreviewProps) {
    if (bloque.tipo === "parrafo") {
        return (
            <p className={cn("whitespace-pre-wrap", ALINEACION[bloque.alineacion])}>
                {bloque.tramos.length > 0 ? <TramosPreview tramos={bloque.tramos} /> : <br />}
            </p>
        )
    }
    const Lista = bloque.ordenada ? "ol" : "ul"
    return (
        <Lista className={cn("pl-6", bloque.ordenada ? "list-decimal" : "list-disc")}>
            {bloque.items.map((item, indice) => (
                <li key={indice} className="whitespace-pre-wrap" style={{ marginLeft: `${item.nivel * 1.5}rem` }}>
                    <TramosPreview tramos={item.tramos} />
                </li>
            ))}
        </Lista>
    )
}

// Lee el mismo HTML con el mismo intérprete que el PDF: lo que se ve aquí es lo que sale impreso.
export function DescripcionPreview({ html }: DescripcionPreviewProps) {
    const bloques = parsearTextoEnriquecido(html)
    if (bloques.length === 0) return null

    return (
        <div className="leading-relaxed">
            {bloques.map((bloque, indice) => (
                <BloquePreview key={indice} bloque={bloque} />
            ))}
        </div>
    )
}
