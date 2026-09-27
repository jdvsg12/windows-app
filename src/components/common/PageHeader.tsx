import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
    onBack?: () => void
    backHref?: string
    backLabel: string
}

function BackButton({ onBack, backHref, backLabel }: BackButtonProps) {
    if (backHref) {
        return (
            <Button asChild variant="ghost" size="icon">
                <Link href={backHref} aria-label={backLabel}>
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
        )
    }
    if (onBack) {
        return (
            <Button variant="ghost" size="icon" aria-label={backLabel} onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
        )
    }
    return null
}

interface PageHeaderProps {
    title: string
    description?: ReactNode
    onBack?: () => void
    backHref?: string
    backLabel?: string
    actions?: ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    onBack,
    backHref,
    backLabel = "Volver",
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", className)}>
            <div className="flex items-center gap-4">
                <BackButton onBack={onBack} backHref={backHref} backLabel={backLabel} />
                <div>
                    <h1 className="text-title font-bold tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}
