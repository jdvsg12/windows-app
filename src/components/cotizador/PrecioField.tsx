"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

interface PrecioFieldProps {
    id: string
    label: string
    value: number | undefined
    onChange: (value: number) => void
    hint?: string
}

export function PrecioField({ id, label, value, onChange, hint }: PrecioFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    id={id}
                    type="number"
                    className="pl-8"
                    value={value ?? 0}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}
