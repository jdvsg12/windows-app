"use client"

import { useEffect, useRef } from "react"
import { useForm, type Control, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/common/SelectField"
import { calcularDespiecePuerta } from "@/lib/calculo/motor-puerta-alumina"
import { PuertaFormSchema, type PuertaFormValues } from "@/lib/schemas"
import { CALIBRES_VIDRIO, COLORES_ALUMINIO, COLORES_VIDRIO, type CalibreVidrio, type ParametrosPuertaAlumina, type Puerta } from "@/lib/types"

interface PuertaFormProps {
    editingPuerta: Puerta | null
    parametros: ParametrosPuertaAlumina
    onSubmit: (datos: Omit<Puerta, "id">) => void
    onCancelEdit: () => void
}

const EMPTY_VALUES: PuertaFormValues = {
    nombre: "",
    ancho: "",
    alto: "",
    colorAluminio: "natural",
    calibreVidrio: "4",
    colorVidrio: "incoloro",
    sandblasting: false,
}

const toFormValues = (puerta: Puerta): PuertaFormValues => ({
    nombre: puerta.nombre,
    ancho: String(puerta.ancho),
    alto: String(puerta.alto),
    colorAluminio: puerta.colorAluminio,
    calibreVidrio: String(puerta.calibreVidrio) as PuertaFormValues["calibreVidrio"],
    colorVidrio: puerta.colorVidrio,
    sandblasting: puerta.sandblasting,
})

const puertaDesdeFormulario = ({ ancho, alto, calibreVidrio, nombre, ...resto }: PuertaFormValues): Omit<Puerta, "id"> => ({
    ...resto,
    nombre: nombre.trim(),
    producto: "alumina_europeo",
    ancho: Number.parseFloat(ancho),
    alto: Number.parseFloat(alto),
    calibreVidrio: Number(calibreVidrio) as CalibreVidrio,
})

// El despiece de lo escrito, o el motivo por el que no se puede fabricar (null si aún falta una medida).
function revisarMedidas(ancho: string, alto: string, parametros: ParametrosPuertaAlumina) {
    const vano = { ancho: Number.parseFloat(ancho), alto: Number.parseFloat(alto) }
    if (!(vano.ancho > 0 && vano.alto > 0)) return null
    try {
        return { despiece: calcularDespiecePuerta(vano, parametros), error: null }
    } catch (error) {
        return { despiece: null, error: error instanceof Error ? error.message : String(error) }
    }
}

interface CampoTextoProps {
    control: Control<PuertaFormValues>
    name: Extract<FieldPath<PuertaFormValues>, "nombre" | "ancho" | "alto">
    label: string
    placeholder: string
}

function CampoTexto({ control, name, label, placeholder }: CampoTextoProps) {
    const numerico = name !== "nombre"
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input type={numerico ? "number" : "text"} inputMode={numerico ? "decimal" : undefined} autoComplete="off" placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export function PuertaForm({ editingPuerta, parametros, onSubmit, onCancelEdit }: PuertaFormProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const form = useForm<PuertaFormValues>({ resolver: zodResolver(PuertaFormSchema), defaultValues: EMPTY_VALUES })
    const { reset, setFocus, setError, watch } = form
    const revision = revisarMedidas(watch("ancho"), watch("alto"), parametros)

    useEffect(() => {
        if (!editingPuerta) return
        reset(toFormValues(editingPuerta))
        cardRef.current?.scrollIntoView({ block: "center" })
        setFocus("nombre")
    }, [editingPuerta, reset, setFocus])

    const handleValidSubmit = (values: PuertaFormValues) => {
        const resultado = revisarMedidas(values.ancho, values.alto, parametros)
        if (resultado?.error) {
            setError("root", { message: resultado.error })
            return
        }
        onSubmit(puertaDesdeFormulario(values))
        // Se conservan color y vidrio: lo usual es agregar varias puertas iguales seguidas.
        reset({ ...values, nombre: "", ancho: "", alto: "" })
        setFocus("nombre")
    }

    const handleCancel = () => {
        reset(EMPTY_VALUES)
        onCancelEdit()
    }

    return (
        <Card ref={cardRef}>
            <CardHeader>
                <CardTitle>{editingPuerta ? `Editando: ${editingPuerta.nombre}` : "Agregar puerta"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleValidSubmit)} noValidate className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                            <CampoTexto control={form.control} name="nombre" label="Nombre" placeholder="Puerta baño" />
                            <CampoTexto control={form.control} name="ancho" label="Ancho del vano (mm)" placeholder="654" />
                            <CampoTexto control={form.control} name="alto" label="Alto del vano (mm)" placeholder="1984" />
                        </div>
                        <p aria-live="polite" className={revision?.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
                            {revision?.despiece
                                ? `Hoja ${revision.despiece.hoja.ancho} × ${revision.despiece.hoja.alto} mm · vidrio ${revision.despiece.vidrio.ancho} × ${revision.despiece.vidrio.alto} mm`
                                : (revision?.error ?? "Escribe las medidas del vano: la hoja y el vidrio se calculan solos.")}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                            <SelectField control={form.control} name="colorAluminio" label="Color de aluminio" opciones={COLORES_ALUMINIO} />
                            <SelectField control={form.control} name="calibreVidrio" label="Calibre de vidrio" opciones={CALIBRES_VIDRIO} />
                            <SelectField control={form.control} name="colorVidrio" label="Color de vidrio" opciones={COLORES_VIDRIO} />
                            <FormField
                                control={form.control}
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
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            {editingPuerta && (
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar edición
                                </Button>
                            )}
                            <Button type="submit">
                                {editingPuerta ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                {editingPuerta ? "Guardar cambios" : "Agregar puerta"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
