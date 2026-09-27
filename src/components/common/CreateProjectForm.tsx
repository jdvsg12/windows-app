"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { crearProyecto } from "@/lib/storage"
import { CreateProjectSchema, type CreateProjectInput } from "@/lib/schemas"
import type { Proyecto } from "@/lib/types"

interface CreateProjectFormProps {
    onCreated: (proyecto: Proyecto) => void
    onCancel?: () => void
    submitLabel?: string
}

export function CreateProjectForm({ onCreated, onCancel, submitLabel = "Crear" }: CreateProjectFormProps) {
    const form = useForm<CreateProjectInput>({
        resolver: zodResolver(CreateProjectSchema),
        defaultValues: { nombre: "" },
    })

    const handleSubmit = ({ nombre }: CreateProjectInput) => {
        onCreated(crearProyecto(nombre))
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") onCancel?.()
                }}
                noValidate
                className="space-y-4"
            >
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del proyecto</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Casa López" autoFocus autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        {submitLabel}
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
