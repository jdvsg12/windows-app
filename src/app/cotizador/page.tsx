"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
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
    const { config, precios, costosCalculados, updateConfig, updatePrecios, updateCliente } = useCotizador(proyecto)

    const [fecha, setFecha] = useState<Date>(new Date())
    const [clienteLocal, setClienteLocal] = useState(proyecto?.cliente || "")
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

    const handleClienteChange = (cliente: string) => {
        setClienteLocal(cliente)
        updateCliente(cliente)
    }

    const handleGenerarPDF = async () => {
        if (!proyecto || !config) return
        const fechaFormateada = format(fecha, "PPP", { locale: es })
        await generarPDF(proyecto, config, costosCalculados, {
            mostrarMedidas,
            mostrarValores,
            descripcion,
            fecha: fechaFormateada,
        })
    }

    if (!proyecto || !config || !precios) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" aria-label="Volver a la calculadora" onClick={() => router.push(`/calculators?id=${proyectoId}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cotizador</h1>
                        <p className="text-sm text-muted-foreground">Proyecto: {proyecto.nombre}</p>
                    </div>
                </div>
                <Button onClick={handleGenerarPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                </Button>
            </div>

            <Tabs defaultValue="configuracion" className="space-y-4">
                <TabsList className="grid h-auto w-full grid-cols-2 sm:inline-flex sm:w-fit">
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
                        cliente={clienteLocal}
                        descripcion={descripcion}
                        mostrarMedidas={mostrarMedidas}
                        mostrarValores={mostrarValores}
                        onFechaChange={setFecha}
                        onClienteChange={handleClienteChange}
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
                        fecha={format(fecha, "PPP", { locale: es })}
                        descripcion={descripcion}
                        mostrarMedidas={mostrarMedidas}
                        mostrarValores={mostrarValores}
                        costosCalculados={costosCalculados}
                    />
                </TabsContent>
            </Tabs>
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
