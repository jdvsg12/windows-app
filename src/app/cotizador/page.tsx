"use client"

import type React from "react"
import { useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download } from "lucide-react"
import { useProyecto } from "@/hooks/useProyecto"
import { useCotizador } from "@/hooks/useCotizador"
import { useContenidoCotizacion } from "@/hooks/useContenidoCotizacion"
import { useDescargaCotizacion } from "@/hooks/useDescargaCotizacion"
import { processLogoFile } from "@/lib/logo"
import { textoAFecha } from "@/lib/contenido-cotizacion"
import { ConfiguracionTab } from "@/components/cotizador/ConfiguracionTab"
import { ContenidoTab } from "@/components/cotizador/ContenidoTab"
import { PreciosTab } from "@/components/cotizador/PreciosTab"
import { VistaPreviaTab } from "@/components/cotizador/VistaPreviaTab"
import { Loading } from "@/components/cotizador/Loading"

function CotizadorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const proyectoId = searchParams.get("id")

    const { proyecto, update } = useProyecto(proyectoId)
    const { config, precios, costosCalculados, errorCosteo, updateConfig, updatePrecios } = useCotizador(proyecto)
    const { form: contenidoForm, valores: contenido, status: contenidoStatus } = useContenidoCotizacion(proyecto, update)
    const fechaFormateada = contenido.fecha ? format(textoAFecha(contenido.fecha), "PPP", { locale: es }) : ""

    const [logoError, setLogoError] = useState<string | null>(null)

    const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return

        const result = await processLogoFile(file)
        if ("error" in result) {
            setLogoError(result.error)
            return
        }
        setLogoError(null)
        updateConfig({ logo: result.dataUrl })
    }, [updateConfig])

    const { descargar: descargarPdf, generando: generandoPdf, error: errorPdf } = useDescargaCotizacion()

    const handleGenerarPDF = () => {
        if (!proyecto || !config) return
        descargarPdf({ proyecto, empresa: config, costos: costosCalculados, contenido })
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
                        <h1 className="text-title font-bold tracking-tight">Cotizador</h1>
                        <p className="text-sm text-muted-foreground">Proyecto: {proyecto.nombre}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Button onClick={handleGenerarPDF} disabled={generandoPdf}>
                        <Download className="h-4 w-4 mr-2" />
                        {generandoPdf ? "Generando PDF…" : "Descargar PDF"}
                    </Button>
                    {errorPdf && <p role="alert" className="text-sm text-destructive">{errorPdf}</p>}
                </div>
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
                        onSave={updateConfig}
                        onLogoUpload={handleLogoUpload}
                        logoError={logoError}
                    />
                </TabsContent>

                <TabsContent value="contenido">
                    <ContenidoTab form={contenidoForm} status={contenidoStatus} />
                </TabsContent>

                <TabsContent value="precios">
                    <PreciosTab
                        precios={precios}
                        costosCalculados={costosCalculados}
                        errorCosteo={errorCosteo}
                        onUpdatePrecios={updatePrecios}
                    />
                </TabsContent>

                <TabsContent value="vista-previa">
                    <VistaPreviaTab
                        config={config}
                        logo={config.logo || ""}
                        proyecto={{ ...proyecto, cliente: contenido.cliente }}
                        fecha={fechaFormateada}
                        descripcion={contenido.descripcion}
                        mostrarMedidas={contenido.mostrarMedidas}
                        mostrarValores={contenido.mostrarValores}
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
