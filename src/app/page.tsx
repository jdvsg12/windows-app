"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/common/PageHeader"
import { StatCard } from "@/components/common/StatCard"
import { EmptyState } from "@/components/common/EmptyState"
import { CreateProjectForm } from "@/components/common/CreateProjectForm"
import { obtenerProyectos } from "@/lib/storage"
import { calcularAreaTotalM2 } from "@/lib/calculos"
import { formatCount, formatDate } from "@/lib/format"
import { Plus, FolderOpen, Ruler, Layers, LayoutGrid } from "lucide-react"
import type { Proyecto } from "@/lib/types"

export default function Home() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([])
    const [showCreateForm, setShowCreateForm] = useState(false)

    useEffect(() => {
        setProyectos(obtenerProyectos())
    }, [])

    const handleProjectCreated = (nuevo: Proyecto) => {
        setProyectos((prev) => [nuevo, ...prev])
        setShowCreateForm(false)
    }

    const totalVentanas = proyectos.reduce((sum, p) => sum + p.ventanas.length, 0)
    const areaTotal = calcularAreaTotalM2(proyectos.flatMap((p) => p.ventanas))
    const ventanasPorProyecto = proyectos.length > 0 ? totalVentanas / proyectos.length : 0

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Gestiona tus proyectos de ventanería"
                className="mb-8"
                actions={
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proyecto
                    </Button>
                }
            />

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Proyectos" value={proyectos.length} icon={FolderOpen} />
                <StatCard label="Total Ventanas" value={totalVentanas} icon={LayoutGrid} />
                <StatCard label="Área Total" value={formatCount(areaTotal)} unit="m²" icon={Ruler} />
                <StatCard
                    label="Promedio por Proyecto"
                    value={formatCount(ventanasPorProyecto)}
                    unit="ventanas"
                    icon={Layers}
                />
            </div>

            {/* Formulario de Crear */}
            {showCreateForm && (
                <Card className="mb-8 animate-in fade-in duration-200">
                    <CardHeader>
                        <CardTitle>Crear Nuevo Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateProjectForm
                            onCreated={handleProjectCreated}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {proyectos.length === 0 && !showCreateForm && (
                <EmptyState
                    icon={FolderOpen}
                    title="No hay proyectos creados"
                    description="Crea tu primer proyecto para comenzar a calcular ventanas y generar cotizaciones profesionales"
                    action={
                        <Button onClick={() => setShowCreateForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Proyecto
                        </Button>
                    }
                />
            )}

            {/* Lista de Proyectos */}
            {proyectos.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Proyectos Recientes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proyectos.map((proyecto) => (
                            <Link
                                key={proyecto.id}
                                href={`/calculators?id=${proyecto.id}`}
                                className="rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
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
                                                {formatDate(proyecto.fechaCreacion)}
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
    )
}
