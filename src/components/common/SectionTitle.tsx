import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface SectionTitleProps {
    children: ReactNode
    className?: string
}

export function SectionTitle({ children, className }: SectionTitleProps) {
    return <h3 className={cn("font-semibold text-lg border-b pb-2", className)}>{children}</h3>
}
