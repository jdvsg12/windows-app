"use client"

import type React from "react"
import { useState } from "react"

import { Input } from "@/components/ui/input"

interface NumberInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> {
    value: number | undefined
    onValueChange: (value: number) => void
}

const comoTexto = (value: number | undefined): string =>
    value === undefined || Number.isNaN(value) ? "" : String(value)

// Numeric input that keeps what the user is typing. Mapping each keystroke straight to a
// number turned an emptied field into 0 (typing then gave "045000") or NaN; here an empty or
// partial entry is never sent, and leaving the field puts the last valid value back.
export function NumberInput({ value, onValueChange, onBlur, ...props }: NumberInputProps) {
    const [texto, setTexto] = useState(() => comoTexto(value))
    const [valorPrevio, setValorPrevio] = useState(value)

    // A new value from outside (reset, another tab) replaces the text, unless it is just
    // the number the user is already typing.
    if (value !== valorPrevio) {
        setValorPrevio(value)
        if (Number(texto) !== value) setTexto(comoTexto(value))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nuevo = e.target.value
        setTexto(nuevo)
        const numero = Number(nuevo)
        if (nuevo.trim() !== "" && Number.isFinite(numero)) onValueChange(numero)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (Number(texto) !== value || texto.trim() === "") setTexto(comoTexto(value))
        onBlur?.(e)
    }

    return <Input {...props} type="number" value={texto} onChange={handleChange} onBlur={handleBlur} />
}
