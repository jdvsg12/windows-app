"use client"

import { NumberInput } from "@/components/common/NumberInput"
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
            <NumberInput id={id} step={step} value={value} onValueChange={onChange} />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}
