"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NumberFieldProps {
    id: string
    label: string
    value: number
    onChange: (value: number) => void
    step?: string
    hint?: string
}

export function NumberField({ id, label, value, onChange, step, hint }: NumberFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type="number"
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}
