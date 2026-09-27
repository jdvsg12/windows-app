"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SaveIndicator } from "@/components/common/SaveIndicator"
import { useAutosave } from "@/hooks/useAutosave"
import { ConfiguracionEmpresaSchema } from "@/lib/schemas"
import type { ConfiguracionEmpresa } from "@/lib/types"

interface ConfiguracionTabProps {
    config: ConfiguracionEmpresa
    logo: string
    onSave: (config: Partial<ConfiguracionEmpresa>) => boolean | void
    onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
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

export function ConfiguracionTab({ config, logo, onSave, onLogoUpload }: ConfiguracionTabProps) {
    const form = useForm<ConfiguracionEmpresa>({
        resolver: zodResolver(ConfiguracionEmpresaSchema),
        values: config,
    })

    const status = useAutosave({ value: form.watch(), onSave })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Datos de la Empresa</CardTitle>
                <SaveIndicator status={status} />
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <div className="flex items-center gap-4">
                                {logo && (
                                    <div className="w-20 h-20 border rounded-md overflow-hidden">
                                        <img src={logo || "/placeholder.svg"} alt={`${config.nombre} - logo`} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input type="file" accept="image/*" onChange={onLogoUpload} />
                                </div>
                            </div>
                        </div>
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
