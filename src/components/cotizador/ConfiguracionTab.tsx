"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SaveIndicator } from "@/components/common/SaveIndicator"
import { useAutosave } from "@/hooks/useAutosave"
import { ConfiguracionEmpresaSchema } from "@/lib/schemas"
import { useCargaImagen } from "@/hooks/useCargaImagen"
import type { ConfiguracionEmpresa } from "@/lib/types"
import { CampoImagen } from "@/components/common/CampoImagen"

interface ConfiguracionTabProps {
    config: ConfiguracionEmpresa
    onSave: (config: Partial<ConfiguracionEmpresa>) => boolean | void
}

interface CamposConfig {
    id: keyof ConfiguracionEmpresa
    label: string
}

const CAMPOS: readonly CamposConfig[] = [
    { id: "nombre", label: "Nombre Empresa" },
    { id: "nit", label: "NIT" },
    { id: "direccion", label: "Dirección" },
    { id: "ciudad", label: "Ciudad" },
    { id: "telefonos", label: "Teléfonos" },
    { id: "email", label: "Email" },
    { id: "representante", label: "Representante Legal" },
    { id: "cedula", label: "Cédula Representante" },
]

export function ConfiguracionTab({ config, onSave }: ConfiguracionTabProps) {
    const form = useForm<ConfiguracionEmpresa>({
        resolver: zodResolver(ConfiguracionEmpresaSchema),
        values: config,
    })

    // Las imágenes entran al formulario y las guarda el mismo autoguardado: guardarlas aparte
    // pisaba lo que se acababa de escribir en otro campo y aún no se había guardado.
    const ponerImagen = (campo: "logo" | "firma", valor: string | undefined) =>
        form.setValue(campo, valor, { shouldDirty: true })
    const logo = useCargaImagen("El logo", (dataUrl) => ponerImagen("logo", dataUrl))
    const firma = useCargaImagen("La firma", (dataUrl) => ponerImagen("firma", dataUrl))
    const valores = form.watch()
    const status = useAutosave({ value: valores, onSave })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Datos de la Empresa</CardTitle>
                <SaveIndicator status={status} />
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CampoImagen
                            id="config-logo"
                            etiqueta="Logo"
                            imagen={valores.logo}
                            descripcion={`${valores.nombre} - logo`}
                            ayuda="Máx. 512 KB, se reduce a 400x400 px"
                            error={logo.error}
                            onArchivo={logo.handleArchivo}
                        />
                        <CampoImagen
                            id="config-firma"
                            etiqueta="Firma"
                            imagen={valores.firma}
                            descripcion={`Firma de ${valores.representante}`}
                            ayuda="Opcional. Una foto o escaneo de la firma sobre fondo blanco; va sobre la línea de firma."
                            error={firma.error}
                            onArchivo={firma.handleArchivo}
                            onQuitar={() => ponerImagen("firma", undefined)}
                        />
                        {CAMPOS.map(({ id, label }) => (
                            <FormField
                                key={id}
                                control={form.control}
                                name={id}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{label}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    <FormField
                        control={form.control}
                        name="datosBancarios"
                        render={({ field }) => (
                            <FormItem className="mt-4">
                                <FormLabel>Datos Bancarios</FormLabel>
                                <FormControl>
                                    <Textarea className="min-h-[100px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            </CardContent>
        </Card>
    )
}
