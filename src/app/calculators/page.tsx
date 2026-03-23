"use client"

import { Suspense, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, FileSpreadsheet, Ruler, Package, Grid3X3, DollarSign } from "lucide-react"
import * as XLSX from "xlsx"
import { crearProyecto } from "@/lib/storage"
import { optimizarCortes } from "@/lib/calculos"
import { useVentanas } from "@/hooks/useVentanas"
import { VentanasTab, MaterialesTab, OptimizacionTab, DeleteProjectDialog } from "@/components/calculators"

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

    const {
        proyecto,
        ventanas,
        optimizacion,
        accesorios,
        vidrios,
        laminasVidrio,
        agregarVentana,
        eliminarVentana,
        eliminarProyectoActual,
    } = useVentanas(proyectoId)

    const [nombreNuevo, setNombreNuevo] = useState("")

    const crearNuevoProyecto = useCallback(() => {
        if (!nombreNuevo.trim()) return
        crearProyecto(nombreNuevo.trim())
        setNombreNuevo("")
    }, [nombreNuevo])

    const exportarExcel = useCallback(() => {
        if (!ventanas.length || !proyecto) return
        const wb = XLSX.utils.book_new()
        const ws1 = XLSX.utils.json_to_sheet(ventanas.map((v) => ({
            Nombre: v.nombre, "Ancho (mm)": v.ancho, "Alto (mm)": v.alto,
            Tipo: v.tipoVentana === "2hojas" ? "2 Hojas" : v.tipoVentana,
        })))
        XLSX.utils.book_append_sheet(wb, ws1, "Ventanas")
        const opt = optimizarCortes(ventanas)
        const ws2 = XLSX.utils.json_to_sheet(Object.entries(opt).map(([tipo, o]) => ({
            Perfil: tipo, "Barras de 6m": o.barras.length, "Metros Usados": o.metrosUsados.toFixed(3),
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
    }, [ventanas, proyecto])

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
                                    value={nombreNuevo}
                                    onChange={(e) => setNombreNuevo(e.target.value)}
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
                        <DeleteProjectDialog
                            projectName={proyecto.nombre}
                            onConfirm={eliminarProyectoActual}
                        />
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

                    <TabsContent value="ventanas">
                        <VentanasTab
                            ventanas={ventanas}
                            onAgregar={agregarVentana}
                            onEliminar={eliminarVentana}
                        />
                    </TabsContent>

                    <TabsContent value="materiales">
                        <MaterialesTab
                            accesorios={accesorios}
                            vidrios={vidrios}
                        />
                    </TabsContent>

                    <TabsContent value="cortes">
                        <OptimizacionTab
                            optimizacion={optimizacion}
                            laminasVidrio={laminasVidrio}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
