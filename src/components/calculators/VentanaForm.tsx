"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/common/NativeSelect"
import { VentanaFormSchema, type VentanaFormValues } from "@/lib/schemas"
import { opcionesSistema, opcionesTipo, sistemaParaVentanaNueva, type Ventana } from "@/lib/types"

interface VentanaFormProps {
    editingVentana: Ventana | null
    onSubmit: (values: VentanaFormValues) => void
    onCancelEdit: () => void
}

const EMPTY_VALUES: VentanaFormValues = {
    nombre: "",
    ancho: "",
    alto: "",
    tipoVentana: "2hojas",
    sistema: "8025",
}

const toFormValues = (ventana: Ventana): VentanaFormValues => ({
    nombre: ventana.nombre,
    ancho: ventana.ancho.toString(),
    alto: ventana.alto.toString(),
    tipoVentana: ventana.tipoVentana,
    sistema: ventana.sistema ?? EMPTY_VALUES.sistema,
})

export function VentanaForm({ editingVentana, onSubmit, onCancelEdit }: VentanaFormProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const form = useForm<VentanaFormValues>({
        resolver: zodResolver(VentanaFormSchema),
        defaultValues: EMPTY_VALUES,
    })
    const { reset, setFocus, getValues } = form

    // Editing starts from a card that may be far below the form: bring the form into view and focus it.
    useEffect(() => {
        if (!editingVentana) return
        reset(toFormValues(editingVentana))
        cardRef.current?.scrollIntoView({ block: "center" })
        setFocus("nombre")
    }, [editingVentana, reset, setFocus])

    const handleValidSubmit = (values: VentanaFormValues) => {
        onSubmit(values)
        // Keep the chosen system: users usually enter several windows of the same system in a row.
        reset({ ...EMPTY_VALUES, sistema: sistemaParaVentanaNueva(getValues("sistema")) })
        setFocus("nombre")
    }

    const handleCancel = () => {
        reset({ ...EMPTY_VALUES, sistema: sistemaParaVentanaNueva(getValues("sistema")) })
        onCancelEdit()
    }

    return (
        <Card ref={cardRef}>
            <CardHeader>
                <CardTitle>{editingVentana ? `Editando: ${editingVentana.nombre}` : "Agregar Ventana"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleValidSubmit)} noValidate className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ventana 1" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ancho"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ancho (mm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" inputMode="decimal" placeholder="1100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="alto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alto (mm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" inputMode="decimal" placeholder="1400" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tipoVentana"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <FormControl>
                                            <NativeSelect {...field}>
                                                {opcionesTipo(editingVentana?.tipoVentana).map(({ value, label, disabled }) => (
                                                    <option key={value} value={value} disabled={disabled}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sistema"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sistema</FormLabel>
                                        <FormControl>
                                            <NativeSelect {...field}>
                                                {opcionesSistema(editingVentana?.sistema).map(({ value, label, disabled }) => (
                                                    <option key={value} value={value} disabled={disabled}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            {editingVentana && (
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar edición
                                </Button>
                            )}
                            <Button type="submit">
                                {editingVentana ? (
                                    <Save className="h-4 w-4 mr-2" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                {editingVentana ? "Guardar cambios" : "Agregar ventana"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
