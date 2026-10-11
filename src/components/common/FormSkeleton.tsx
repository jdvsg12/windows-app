import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface FormSkeletonProps {
    fields?: number
}

// Loading placeholder for a card full of labeled inputs, used while a form reads its
// values from storage.
export function FormSkeleton({ fields = 8 }: FormSkeletonProps) {
    return (
        <Card role="status" aria-label="Cargando">
            <CardHeader>
                <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: fields }, (_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
