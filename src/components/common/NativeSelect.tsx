import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
    return (
        <select
            data-slot="native-select"
            className={cn(
                "border-input dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm",
                "[&>option]:bg-background [&>option]:text-foreground",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
}
