"use client"

import type { UseFormReturn } from "react-hook-form"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { EditorTextoEnriquecido } from "@/components/editor-texto-enriquecido"
import { SaveIndicator } from "@/components/common/SaveIndicator"
import type { AutosaveStatus } from "@/hooks/useAutosave"
import { fechaATexto, textoAFecha } from "@/lib/contenido-cotizacion"
import type { ContenidoCotizacionFormValues } from "@/lib/schemas"

interface ContenidoTabProps {
    form: UseFormReturn<ContenidoCotizacionFormValues>
    status: AutosaveStatus
}

export function ContenidoTab({ form, status }: ContenidoTabProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contenido de la Cotización</CardTitle>
                <SaveIndicator status={status} />
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fecha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha</FormLabel>
                                        <DatePicker
                                            value={textoAFecha(field.value)}
                                            onChange={(fecha) => field.onChange(fechaATexto(fecha))}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cliente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del cliente" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="cotizador-descripcion">Descripción / Introducción</FormLabel>
                                    <EditorTextoEnriquecido
                                        id="cotizador-descripcion"
                                        ariaLabel="Descripción / Introducción de la cotización"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
                            <FormField
                                control={form.control}
                                name="mostrarMedidas"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel>Mostrar medidas y área</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mostrarValores"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel>Mostrar valores</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </Form>
            </CardContent>
        </Card>
    )
}
