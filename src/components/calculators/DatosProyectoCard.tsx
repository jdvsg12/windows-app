"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { SaveIndicator } from "@/components/common/SaveIndicator"
import { useAutosave } from "@/hooks/useAutosave"
import type { Proyecto } from "@/lib/types"

// Un input numérico vacío da NaN: invalid_type_error lo vuelve un mensaje en vez de un dato a guardar.
const DatosProyectoSchema = z.object({
    duracionMeses: z.number({ invalid_type_error: "Ingresa los meses" }).positive("Debe ser mayor que 0"),
    transporte: z.number({ invalid_type_error: "Ingresa un monto (0 si no hay)" }).min(0, "No puede ser negativo"),
})
export type DatosProyectoValues = z.infer<typeof DatosProyectoSchema>

interface DatosProyectoCardProps {
    proyecto: Proyecto
    onActualizar: (datos: DatosProyectoValues) => void
}

export function DatosProyectoCard({ proyecto, onActualizar }: DatosProyectoCardProps) {
    const datosForm = useForm<DatosProyectoValues>({
        resolver: zodResolver(DatosProyectoSchema),
        mode: "onChange",
        values: { duracionMeses: proyecto.duracionMeses, transporte: proyecto.transporte },
    })
    // Solo se guarda un formulario válido: un campo a medio escribir nunca llega al proyecto.
    const datosStatus = useAutosave({
        value: datosForm.watch(),
        onSave: onActualizar,
        enabled: datosForm.formState.isValid,
    })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Datos del Proyecto</CardTitle>
                <SaveIndicator status={datosStatus} />
            </CardHeader>
            <CardContent>
                <Form {...datosForm}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={datosForm.control}
                            name="duracionMeses"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duración estimada (meses)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            {...field}
                                            value={Number.isNaN(field.value) ? "" : field.value}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={datosForm.control}
                            name="transporte"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transporte ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="1000"
                                            min="0"
                                            {...field}
                                            value={Number.isNaN(field.value) ? "" : field.value}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            </CardContent>
        </Card>
    )
}
