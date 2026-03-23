"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Pencil, Trash2, FileSpreadsheet, Ruler, Package, Grid3X3, X, DollarSign } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as XLSX from "xlsx"
import { obtenerProyectoPorId, actualizarProyecto, crearProyecto, eliminarProyecto } from "@/lib/storage"
import {
    optimizarCortes,
    calcularAccesorios,
    calcularVidrios,
    optimizarLaminasVidrio,
} from "@/lib/calculos"
import type { Proyecto, Ventana, TipoVentana, SistemaVentana } from "@/lib/types"

export default function CalculadorPageWrapper() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <CalculadorPage />
        </Suspense>
    )
}

function CalculadorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const proyectoId = searchParams.get("id")

    const [proyecto, setProyecto] = useState<Proyecto | null>(null)
    const [ventanas, setVentanas] = useState<Ventana[]>([])

    const [nombre, setNombre] = useState("")
    const [ancho, setAncho] = useState("")
    const [alto, setAlto] = useState("")
    const [tipoVentana, setTipoVentana] = useState<TipoVentana>("2hojas")
    const [sistema, setSistema] = useState<SistemaVentana>("5020")
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)

    useEffect(() => {
        if (!proyectoId) return
        const proj = obtenerProyectoPorId(proyectoId)
        if (proj) {
            setProyecto(proj)
            setVentanas(proj.ventanas)
        }
    }, [proyectoId])

    const optimizacion = useMemo(() => ventanas.length > 0 ? optimizarCortes(ventanas) : {}, [ventanas])
    const accesorios = useMemo(() => ventanas.length > 0 ? calcularAccesorios(ventanas) : null, [ventanas])
    const vidrios = useMemo(() => ventanas.length > 0 ? calcularVidrios(ventanas) : [], [ventanas])
    const laminasVidrio = useMemo(() => ventanas.length > 0 ? optimizarLaminasVidrio(ventanas) : [], [ventanas])

    const crearNuevoProyecto = () => {
        if (!nombre.trim()) return
        const nuevo = crearProyecto(nombre.trim())
        setProyecto(nuevo)
        setVentanas([])
        setNombre("")
    }

    if (!proyecto) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container max-w-md mx-auto py-16">
                    <Card>
                        <CardHeader>
                            <CardTitle>Crear Nuevo Proyecto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre del Proyecto</Label>
                                <Input
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Casa López"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") crearNuevoProyecto()
                                    }}
                                />
                            </div>
                            <Button onClick={crearNuevoProyecto} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear y Continuar
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                                Volver al Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const agregarVentana = () => {
        if (!ancho || !alto || !nombre) return
        const nuevaVentana: Ventana = {
            id: editandoId || crypto.randomUUID(),
            nombre,
            ancho: Number.parseFloat(ancho),
            alto: Number.parseFloat(alto),
            tipoVentana,
            sistema,
        }

        let nuevasVentanas: Ventana[]
        if (editandoId) {
            nuevasVentanas = ventanas.map((v) => (v.id === editandoId ? nuevaVentana : v))
            setEditandoId(null)
        } else {
            nuevasVentanas = [...ventanas, nuevaVentana]
        }

        setVentanas(nuevasVentanas)
        const proyectoActualizado = { ...proyecto, ventanas: nuevasVentanas }
        actualizarProyecto(proyectoActualizado)
        setProyecto(proyectoActualizado)
        setNombre("")
        setAncho("")
        setAlto("")
        setTipoVentana("2hojas")
    }

    const editarVentana = (ventana: Ventana) => {
        setNombre(ventana.nombre)
        setAncho(ventana.ancho.toString())
        setAlto(ventana.alto.toString())
        setTipoVentana(ventana.tipoVentana)
        setSistema(ventana.sistema || "5020")
        setEditandoId(ventana.id)
    }

    const eliminarVentana = (id: string) => {
        if (!confirm("¿Eliminar esta ventana?")) return
        const nuevasVentanas = ventanas.filter((v) => v.id !== id)
        setVentanas(nuevasVentanas)
        const proyectoActualizado = { ...proyecto, ventanas: nuevasVentanas }
        actualizarProyecto(proyectoActualizado)
        setProyecto(proyectoActualizado)
        if (editandoId === id) {
            setNombre("")
            setAncho("")
            setAlto("")
            setTipoVentana("2hojas")
            setEditandoId(null)
        }
    }

    const exportarExcel = () => {
        if (!ventanas.length) return
        const wb = XLSX.utils.book_new()
        const ws1 = XLSX.utils.json_to_sheet(ventanas.map((v) => ({
            Nombre: v.nombre, "Ancho (mm)": v.ancho, "Alto (mm)": v.alto,
            Tipo: v.tipoVentana === "2hojas" ? "2 Hojas" : "3 Hojas",
        })))
        XLSX.utils.book_append_sheet(wb, ws1, "Ventanas")
        const optimizacion = optimizarCortes(ventanas)
        const ws2 = XLSX.utils.json_to_sheet(Object.entries(optimizacion).map(([tipo, opt]) => ({
            Perfil: tipo, "Barras de 6m": opt.barras.length, "Metros Usados": opt.metrosUsados.toFixed(3),
        })))
        XLSX.utils.book_append_sheet(wb, ws2, "Resumen Perfiles")
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
        const blob = new Blob([wbout], { type: "application/octet-stream" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${proyecto.nombre}_calculo.xlsx`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{proyecto.nombre}</h1>
                            <p className="text-sm text-muted-foreground">
                                {proyecto.cliente ? `Cliente: ${proyecto.cliente}` : "Sin cliente"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="text-sm">
                            {ventanas.length} ventanas
                        </Badge>
                        {ventanas.length > 0 && (
                            <Button variant="outline" onClick={exportarExcel}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        )}
                        {ventanas.length > 0 && (
                            <Button onClick={() => router.push(`/cotizador?id=${proyectoId}`)}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Cotizar
                            </Button>
                        )}
                        <DialogPrimitive.Root open={mostrarConfirmacionEliminar} onOpenChange={setMostrarConfirmacionEliminar}>
                            <DialogPrimitive.Trigger asChild>
                                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogPrimitive.Trigger>
                            <DialogPrimitive.Portal>
                                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                                        <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
                                            Eliminar Proyecto
                                        </DialogPrimitive.Title>
                                        <DialogPrimitive.Description className="text-sm text-muted-foreground">
                                            ¿Estás seguro de que deseas eliminar el proyecto &ldquo;{proyecto.nombre}&rdquo;? Esta acción no se puede deshacer.
                                        </DialogPrimitive.Description>
                                    </div>
                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                                        <DialogPrimitive.Close asChild>
                                            <Button variant="outline">Cancelar</Button>
                                        </DialogPrimitive.Close>
                                        <Button 
                                            variant="destructive" 
                                            onClick={() => {
                                                eliminarProyecto(proyecto.id)
                                                setMostrarConfirmacionEliminar(false)
                                                router.push("/")
                                            }}
                                        >
                                            Eliminar Proyecto
                                        </Button>
                                    </div>
                                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Close</span>
                                    </DialogPrimitive.Close>
                                </DialogPrimitive.Content>
                            </DialogPrimitive.Portal>
                        </DialogPrimitive.Root>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="ventanas" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="ventanas" className="gap-2">
                            <Grid3X3 className="h-4 w-4" />
                            Ventanas
                        </TabsTrigger>
                        <TabsTrigger value="materiales" className="gap-2">
                            <Package className="h-4 w-4" />
                            Materiales
                        </TabsTrigger>
                        <TabsTrigger value="cortes" className="gap-2">
                            <Ruler className="h-4 w-4" />
                            Optimización
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Ventanas */}
                    <TabsContent value="ventanas" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{editandoId ? "Editar Ventana" : "Agregar Ventana"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre</Label>
                                        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ventana 1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ancho">Ancho (mm)</Label>
                                        <Input id="ancho" type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="1100" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="alto">Alto (mm)</Label>
                                        <Input id="alto" type="number" value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="1400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tipo">Tipo</Label>
                                        <select
                                            id="tipo"
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={tipoVentana}
                                            onChange={(e) => setTipoVentana(e.target.value as TipoVentana)}
                                        >
                                            <option value="2hojas">2 Hojas</option>
                                            <option value="3hojas">3 Hojas</option>
                                            <option value="4hojas">4 Hojas</option>
                                            <option value="5hojas">5 Hojas</option>
                                            <option value="6hojas">6 Hojas</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sistema">Sistema</Label>
                                        <select
                                            id="sistema"
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={sistema}
                                            onChange={(e) => setSistema(e.target.value as SistemaVentana)}
                                        >
                                            <option value="5020">5020</option>
                                            <option value="744">744</option>
                                            <option value="8025">8025</option>
                                            <option value="7038">7038</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={agregarVentana} className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {editandoId ? "Actualizar" : "Agregar"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {ventanas.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold">No hay ventanas agregadas</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Usa el formulario de arriba para agregar ventanas
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ventanas.map((ventana) => (
                                    <Card key={ventana.id} className={editandoId === ventana.id ? "border-primary" : ""}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">{ventana.nombre}</h3>
                                                <Badge variant="secondary">{ventana.tipoVentana.replace("hojas", "H")}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {ventana.ancho} × {ventana.alto} mm
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Sistema: {ventana.sistema || "5020"}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => editarVentana(ventana)} className="flex-1">
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => eliminarVentana(ventana.id)} className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab: Materiales */}
                    <TabsContent value="materiales" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Rodachinas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{accesorios?.rodachinas || 0}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Guías</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{(accesorios?.guiasSuperior || 0) + (accesorios?.guiasInferior || 0)}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Cerraduras</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{accesorios?.cerraduras || 0}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Empaque</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{accesorios?.empaqueTotal.toFixed(1) || 0} m</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vidrios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {vidrios.map((v, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div>
                                                <p className="font-medium">{v.ventana} - {v.tipo}</p>
                                                <p className="text-sm text-muted-foreground">{v.ancho.toFixed(0)} × {v.alto.toFixed(0)} mm</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{v.area.toFixed(3)} m²</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Optimización */}
                    <TabsContent value="cortes" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Barras 6m</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">
                                        {Object.values(optimizacion).reduce((sum, opt) => sum + opt.barras.length, 0)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Metros Totales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">
                                        {Object.values(optimizacion).reduce((sum, opt) => sum + opt.metrosUsados, 0).toFixed(2)} m
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Láminas Vidrio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{laminasVidrio.length}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Corte de Perfiles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(optimizacion).map(([tipo, opt]) => (
                                    <div key={tipo} className="border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">{tipo}</h3>
                                            <span className="text-sm text-muted-foreground">{opt.barras.length} barras</span>
                                        </div>
                                        <div className="space-y-1">
                                            {opt.barras.map((barra, i) => (
                                                <div key={i} className="flex gap-1">
                                                    {barra.map((medida, j) => (
                                                        <div key={j} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs" style={{ width: `${(medida / 6) * 100}%` }}>
                                                            {medida.toFixed(3)}m
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {laminasVidrio.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Láminas de Vidrio (2500 × 3600 mm)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {laminasVidrio.map((lamina) => (
                                            <div key={lamina.numero} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-semibold">Lámina {lamina.numero}</h3>
                                                    <div className="text-sm text-muted-foreground">
                                                        {lamina.vidrios.length} vidrios • {lamina.areaUsada.toFixed(2)} m² usados
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {lamina.vidrios.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                                            <span>{item.vidrio.ventana} - {item.vidrio.tipo}</span>
                                                            <span className="text-muted-foreground">
                                                                {item.vidrio.ancho.toFixed(0)}×{item.vidrio.alto.toFixed(0)} mm
                                                                {item.rotado && <span className="text-destructive ml-2">↻</span>}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
