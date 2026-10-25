"use client"

import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { NativeSelect } from "./NativeSelect"

interface SelectFieldProps<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label: string
    opciones: readonly { value: string | number; label: string }[]
}

// Select nativo dentro de un formulario de react-hook-form; los valores numéricos van como texto.
export function SelectField<T extends FieldValues>({ control, name, label, opciones }: SelectFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <NativeSelect {...field}>
                            {opciones.map(({ value, label: optionLabel }) => (
                                <option key={value} value={String(value)}>
                                    {optionLabel}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
