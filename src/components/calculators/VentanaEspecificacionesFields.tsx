"use client"

import type { Control, FieldPath } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { NativeSelect } from "@/components/common/NativeSelect"
import type { VentanaFormValues } from "@/lib/schemas"
import { CALIBRES_VIDRIO, CERRADURAS, COLORES_ALUMINIO, COLORES_VIDRIO, RODACHINAS } from "@/lib/types"

type CampoSelect = Extract<FieldPath<VentanaFormValues>, "colorAluminio" | "cerradura" | "rodachina" | "calibreVidrio" | "colorVidrio">

interface SelectFieldProps {
    control: Control<VentanaFormValues>
    name: CampoSelect
    label: string
    opciones: readonly { value: string | number; label: string }[]
}

function SelectField({ control, name, label, opciones }: SelectFieldProps) {
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

interface VentanaEspecificacionesFieldsProps {
    control: Control<VentanaFormValues>
}

export function VentanaEspecificacionesFields({ control }: VentanaEspecificacionesFieldsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
            <SelectField control={control} name="colorAluminio" label="Color de aluminio" opciones={COLORES_ALUMINIO} />
            <SelectField control={control} name="cerradura" label="Cerradura" opciones={CERRADURAS} />
            <SelectField control={control} name="rodachina" label="Rodachina" opciones={RODACHINAS} />
            <SelectField control={control} name="calibreVidrio" label="Calibre de vidrio" opciones={CALIBRES_VIDRIO} />
            <SelectField control={control} name="colorVidrio" label="Color de vidrio" opciones={COLORES_VIDRIO} />
            <FormField
                control={control}
                name="sandblasting"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 sm:pt-8">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                        </FormControl>
                        <FormLabel className="font-normal">Acabado sandblasting</FormLabel>
                    </FormItem>
                )}
            />
        </div>
    )
}
