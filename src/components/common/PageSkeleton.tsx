import { Skeleton } from "@/components/ui/skeleton"

// Generic loading placeholder shaped like a page header + tabs + card, used while a
// project loads from storage or a route's search params resolve.
export function PageSkeleton() {
    return (
        <div className="space-y-6" role="status" aria-label="Cargando">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}
