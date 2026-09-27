import { cn } from "@/lib/utils"
import type { EstiloPieza } from "@/lib/design/piezas"

interface PiezaBadgeProps {
    estilo: EstiloPieza
    className?: string
}

// Decorative: the name it stands for is always rendered next to it.
export function PiezaBadge({ estilo, className }: PiezaBadgeProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-flex h-6 min-w-8 shrink-0 items-center justify-center rounded border px-1 font-mono text-caption font-semibold",
                estilo.clases,
                className
            )}
        >
            {estilo.codigo}
        </span>
    )
}
