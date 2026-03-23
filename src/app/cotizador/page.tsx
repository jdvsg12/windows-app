"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download } from "lucide-react"
import { useProyecto } from "@/hooks/useProyecto"
import { useCotizador } from "@/hooks/useCotizador"
import { generarPDF } from "@/lib/pdf-generatos"
import { ConfiguracionTab } from "@/components/cotizador/ConfiguracionTab"
import { ContenidoTab } from "@/components/cotizador/ContenidoTab"
import { PreciosTab } from "@/components/cotizador/PreciosTab"
import { VistaPreviaTab } from "@/components/cotizador/VistaPreviaTab"
import { Loading } from "@/components/cotizador/Loading"

function CotizadorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const proyectoId = searchParams.get("id")

    const { proyecto } = useProyecto(proyectoId)
    const { config, precios, costosCalculados, updateConfig, updatePrecios } = useCotizador(proyecto)

    const [fecha, setFecha] = useState(
        new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })
    )
    const [descripcion, setDescripcion] = useState("")
    const [mostrarMedidas, setMostrarMedidas] = useState(true)
    const [mostrarValores, setMostrarValores] = useState(true)

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const logoUrl = reader.result as string
                updateConfig({ logo: logoUrl })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleConfigChange = (field: string, value: string) => {
        updateConfig({ [field]: value })
    }

    const handleGenerarPDF = async () => {
        if (!proyecto || !config) return
        await generarPDF(proyecto, config, costosCalculados, {
            mostrarMedidas,
            mostrarValores,
            descripcion,
            fecha,
        })
    }

    if (!proyecto || !config || !precios) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/calculators?id=${proyectoId}`)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Cotizador</h1>
                            <p className="text-muted-foreground">Proyecto: {proyecto.nombre}</p>
                        </div>
                    </div>
                    <Button onClick={handleGenerarPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                    </Button>
                </div>

                <Tabs defaultValue="configuracion" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="configuracion">Configuración</TabsTrigger>
                        <TabsTrigger value="contenido">Contenido</TabsTrigger>
                        <TabsTrigger value="precios">Precios</TabsTrigger>
                        <TabsTrigger value="vista-previa">Vista Previa</TabsTrigger>
                    </TabsList>

                    <TabsContent value="configuracion">
                        <ConfiguracionTab
                            config={config}
                            logo={config.logo || ""}
                            onConfigChange={handleConfigChange}
                            onLogoUpload={handleLogoUpload}
                        />
                    </TabsContent>

                    <TabsContent value="contenido">
                        <ContenidoTab
                            fecha={fecha}
                            proyecto={proyecto}
                            descripcion={descripcion}
                            mostrarMedidas={mostrarMedidas}
                            mostrarValores={mostrarValores}
                            onFechaChange={setFecha}
                            onDescripcionChange={setDescripcion}
                            onMostrarMedidasChange={setMostrarMedidas}
                            onMostrarValoresChange={setMostrarValores}
                        />
                    </TabsContent>

                    <TabsContent value="precios">
                        <PreciosTab
                            precios={precios}
                            costosCalculados={costosCalculados}
                            onUpdatePrecios={updatePrecios}
                        />
                    </TabsContent>

                    <TabsContent value="vista-previa">
                        <VistaPreviaTab
                            config={config}
                            logo={config.logo || ""}
                            proyecto={proyecto}
                            fecha={fecha}
                            descripcion={descripcion}
                            mostrarMedidas={mostrarMedidas}
                            mostrarValores={mostrarValores}
                            costosCalculados={costosCalculados}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default function CotizadorPage() {
    return (
        <Suspense fallback={<Loading />}>
            <CotizadorContent />
        </Suspense>
    )
}
