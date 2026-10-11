import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
    label: string
    value: string | number
    unit?: string
    icon: LucideIcon
}

export function StatCard({ label, value, unit, icon: Icon }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-metric font-bold tabular-nums">
                    {value}
                    {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
                </div>
            </CardContent>
        </Card>
    )
}
