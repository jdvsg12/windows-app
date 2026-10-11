import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const SIZES = {
    default: { wrapper: "py-16", icon: "h-10 w-10", title: "text-lg font-semibold" },
    compact: { wrapper: "py-12", icon: "h-8 w-8", title: "font-semibold" },
} as const

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: ReactNode
    size?: keyof typeof SIZES
}

export function EmptyState({ icon: Icon, title, description, action, size = "default" }: EmptyStateProps) {
    const styles = SIZES[size]

    return (
        <div className={cn("flex flex-col items-center justify-center text-center", styles.wrapper)}>
            <div className="rounded-full bg-muted p-4 mb-4">
                <Icon className={cn(styles.icon, "text-muted-foreground")} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
