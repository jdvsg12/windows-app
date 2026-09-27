"use client"

import { Suspense, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/common/PageHeader"
import { CreateProjectForm } from "@/components/common/CreateProjectForm"
import { FileSpreadsheet, Ruler, Package, Grid3X3, DollarSign } from "lucide-react"
import * as XLSX from "xlsx"
import { optimizarCortes } from "@/lib/calculos"
import { useVentanas } from "@/hooks/useVentanas"
import { VentanasTab, MaterialesTab, OptimizacionTab, DeleteProjectDialog } from "@/components/calculators"
import { getTipoVentanaLabel, type Proyecto, type TamanoLamina } from "@/lib/types"

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

    const [tamanoLamina, setTamanoLamina] = useState<TamanoLamina>("2500x3600")
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
    } = useVentanas(proyectoId, tamanoLamina)

    const handleProjectCreated = useCallback(
        (nuevo: Proyecto) => router.push(`/calculators?id=${nuevo.id}`),
        [router]
    )

    const exportarExcel = useCallback(() => {
        if (!ventanas.length || !proyecto) return
        const wb = XLSX.utils.book_new()
        const ws1 = XLSX.utils.json_to_sheet(ventanas.map((v) => ({
            Nombre: v.nombre, "Ancho (mm)": v.ancho, "Alto (mm)": v.alto,
            Tipo: getTipoVentanaLabel(v.tipoVentana),
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
            <div className="max-w-md mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Crear Nuevo Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CreateProjectForm onCreated={handleProjectCreated} submitLabel="Crear y Continuar" />
                        <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={proyecto.nombre}
                description={proyecto.cliente ? `Cliente: ${proyecto.cliente}` : "Sin cliente"}
                onBack={() => router.push("/")}
                backLabel="Volver al dashboard"
                actions={
                    <>
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
                        {/* ml-auto keeps it pinned to the right edge instead of stranded alone when the row wraps on mobile */}
                        <div className="ml-auto sm:ml-0">
                            <DeleteProjectDialog
                                projectName={proyecto.nombre}
                                onConfirm={eliminarProyectoActual}
                            />
                        </div>
                    </>
                }
            />

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
                        tamanoLamina={tamanoLamina}
                        onTamanoLaminaChange={setTamanoLamina}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
