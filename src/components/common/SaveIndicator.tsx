import { AlertTriangle, Check, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AutosaveStatus } from "@/hooks/useAutosave"

interface SaveIndicatorProps {
    status: AutosaveStatus
    className?: string
}

const CONFIG: Partial<Record<AutosaveStatus, { label: string; icon: typeof Check }>> = {
    saving: { label: "Guardando…", icon: Loader2 },
    saved: { label: "Guardado", icon: Check },
    error: { label: "Error al guardar", icon: AlertTriangle },
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
    const item = CONFIG[status]
    if (!item) return null

    const Icon = item.icon

    return (
        <span
            role="status"
            aria-live="polite"
            className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                status === "error" ? "text-destructive" : "text-muted-foreground",
                className
            )}
        >
            <Icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin")} />
            {item.label}
        </span>
    )
}
