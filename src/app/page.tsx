"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { obtenerProyectos, crearProyecto } from "@/lib/storage"
import { Plus, FolderOpen, Ruler, DollarSign, LayoutGrid } from "lucide-react"
import type { Proyecto } from "@/lib/types"

export default function Home() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([])
    const [newProjectName, setNewProjectName] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)

    useEffect(() => {
        setProyectos(obtenerProyectos())
    }, [])

    const handleCreateProject = () => {
        if (!newProjectName.trim()) return

        const nuevo = crearProyecto(newProjectName.trim())
        setProyectos([nuevo, ...proyectos])
        setNewProjectName("")
        setShowCreateForm(false)
    }

    const totalVentanas = proyectos.reduce((sum, p) => sum + p.ventanas.length, 0)

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8">
                {/* Header de Página */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Gestiona tus proyectos de ventanería
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proyecto
                    </Button>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Proyectos
                            </CardTitle>
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{proyectos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Ventanas
                            </CardTitle>
                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalVentanas}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Dimensiones Promedio
                            </CardTitle>
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalVentanas > 0
                                    ? Math.round(totalVentanas / proyectos.length)
                                    : 0}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                    por proyecto
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Estado
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant="default">Activo</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Formulario de Crear (Dialog style) */}
                {showCreateForm && (
                    <Card className="mb-8 animate-in fade-in duration-200">
                        <CardHeader>
                            <CardTitle>Crear Nuevo Proyecto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Nombre del proyecto"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCreateProject()
                                        if (e.key === "Escape") setShowCreateForm(false)
                                    }}
                                    className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                                    autoFocus
                                />
                                <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                                    Crear
                                </Button>
                                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {proyectos.length === 0 && !showCreateForm && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <FolderOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No hay proyectos creados</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Crea tu primer proyecto para comenzar a calcular ventanas y generar cotizaciones profesionales
                        </p>
                        <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Proyecto
                        </Button>
                    </div>
                )}

                {/* Lista de Proyectos */}
                {proyectos.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Proyectos Recientes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proyectos.map((proyecto) => (
                                <Link key={proyecto.id} href={`/calculators?id=${proyecto.id}`}>
                                    <Card className="h-full transition-all hover:shadow-md hover:border-primary cursor-pointer">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg truncate">
                                                    {proyecto.nombre}
                                                </CardTitle>
                                                <Badge variant="secondary" className="ml-2">
                                                    {proyecto.ventanas.length} ventanas
                                                </Badge>
                                            </div>
                                            {proyecto.cliente && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {proyecto.cliente}
                                                </p>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {new Date(proyecto.fechaCreacion).toLocaleDateString("es-CO")}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
