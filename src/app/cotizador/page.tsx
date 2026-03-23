"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download } from "lucide-react"
import { useProyecto } from "@/hooks/useProyecto"
import { useCotizador } from "@/hooks/useCotizador"
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

    const generarPDF = async () => {
        if (!proyecto || !config || !costosCalculados) return

        try {
            const html2canvas = (await import("html2canvas")).default
            const jsPDF = (await import("jspdf")).default

            const tempDiv = document.createElement("div")
            tempDiv.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 210mm;
                background-color: #ffffff;
                padding: 20px;
                font-family: Arial, sans-serif;
                color: #000000;
                font-size: 14px;
                line-height: 1.5;
            `

            tempDiv.innerHTML = `
                <div style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); padding: 32px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid rgb(0, 0, 0); padding-bottom: 16px;">
                        ${config.logo ? `<div style="width: 128px; height: 128px;"><img src="${config.logo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" /></div>` : ""}
                        <div style="text-align: right; font-size: 14px; line-height: 1.6; color: rgb(0, 0, 0);">
                            <p style="font-weight: bold; margin-bottom: 4px; color: rgb(0, 0, 0); margin: 0 0 4px 0;">${config.nombre}</p>
                            <p style="margin: 2px 0; color: rgb(0, 0, 0);">NIT: ${config.nit}</p>
                            <p style="margin: 2px 0; color: rgb(0, 0, 0);">${config.direccion}</p>
                            <p style="margin: 2px 0; color: rgb(0, 0, 0);">CEL: ${config.telefonos}</p>
                            <p style="margin: 2px 0; color: rgb(0, 0, 0);">e-mail: ${config.email}</p>
                            <p style="margin: 2px 0; color: rgb(0, 0, 0);">${config.ciudad}</p>
                        </div>
                    </div>
                    <div style="margin-bottom: 24px; text-align: right; color: rgb(0, 0, 0);">
                        <p style="color: rgb(0, 0, 0); margin: 0;">${fecha}</p>
                    </div>
                    <div style="margin-bottom: 24px; color: rgb(0, 0, 0);">
                        <p style="margin: 4px 0; color: rgb(0, 0, 0);">Señor(a):</p>
                        <p style="font-weight: bold; margin: 4px 0; color: rgb(0, 0, 0);">${proyecto.cliente}</p>
                    </div>
                    <h2 style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 24px; text-decoration: underline; color: rgb(0, 0, 0); margin-top: 0;">COTIZACIÓN</h2>
                    ${descripcion ? `<div style="margin-bottom: 24px; line-height: 1.6; color: rgb(0, 0, 0);">${descripcion}</div>` : ""}
                    <div style="margin-bottom: 24px; color: rgb(0, 0, 0);">
                        <h3 style="font-weight: bold; margin-bottom: 16px; font-size: 16px; color: rgb(0, 0, 0); margin-top: 0;">Ventanas del Proyecto: ${proyecto.nombre}</h3>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid rgb(51, 51, 51); margin-bottom: 16px;">
                            <thead>
                                <tr style="background-color: rgb(240, 240, 240);">
                                    <th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: left; font-weight: bold; color: rgb(0, 0, 0);">Nombre</th>
                                    <th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: left; font-weight: bold; color: rgb(0, 0, 0);">Tipo</th>
                                    ${mostrarMedidas ? `<th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: left; font-weight: bold; color: rgb(0, 0, 0);">Ancho (mm)</th><th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: left; font-weight: bold; color: rgb(0, 0, 0);">Alto (mm)</th><th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; font-weight: bold; color: rgb(0, 0, 0);">Área (m²)</th>` : ""}
                                    ${mostrarValores ? `<th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; font-weight: bold; color: rgb(0, 0, 0);">Valor</th>` : ""}
                                </tr>
                            </thead>
                            <tbody>
                                ${proyecto.ventanas.map((ventana) => {
                                    const valorVentana = costosCalculados.valoresPorVentana.find((v) => v.id === ventana.id)
                                    return `<tr>
                                        <td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.nombre}</td>
                                        <td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.tipoVentana === "2hojas" ? "2 Hojas Normal" : ventana.tipoVentana}</td>
                                        ${mostrarMedidas ? `<td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.ancho}</td><td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.alto}</td><td style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; color: rgb(0, 0, 0);">${valorVentana?.area?.toFixed(2) || "0.00"}</td>` : ""}
                                        ${mostrarValores ? `<td style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; color: rgb(0, 0, 0);">$${(valorVentana?.valor || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}</td>` : ""}
                                    </tr>`
                                }).join("")}
                            </tbody>
                        </table>
                        <div style="margin-top: 16px; color: rgb(0, 0, 0);">
                            <p style="font-weight: bold; color: rgb(0, 0, 0); margin: 0 0 4px 0;">Total de ventanas: ${proyecto.ventanas.length}</p>
                            ${mostrarMedidas ? `<p style="margin-top: 4px; color: rgb(0, 0, 0); margin: 4px 0 0 0;">Área total: ${costosCalculados.areaTotal.toFixed(2)} m²</p>` : ""}
                            ${mostrarValores ? `<p style="margin-top: 8px; font-size: 18px; font-weight: bold; color: rgb(0, 0, 0); margin: 8px 0 0 0;">VALOR TOTAL: $${costosCalculados.total.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>` : ""}
                        </div>
                    </div>
                    <div style="margin-bottom: 24px; color: rgb(0, 0, 0);">
                        <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px; color: rgb(0, 0, 0); margin-top: 0; margin: 0 0 8px 0;">FORMA DE PAGO:</h3>
                        <p style="margin: 4px 0; color: rgb(0, 0, 0);">Anticipo 60%</p>
                        <p style="margin: 4px 0; color: rgb(0, 0, 0);">Saldo: PAGOS PARCIALES SEGÚN AVANCE DE LA OBRA</p>
                    </div>
                    <div style="margin-bottom: 24px; color: rgb(0, 0, 0);">
                        <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px; color: rgb(0, 0, 0); margin-top: 0; margin: 0 0 8px 0;">DATOS BANCARIOS:</h3>
                        <p style="font-size: 14px; white-space: pre-wrap; line-height: 1.6; color: rgb(0, 0, 0); margin: 0;">${config.datosBancarios}</p>
                    </div>
                    <div style="margin-top: 48px; border-top: 1px solid rgb(0, 0, 0); padding-top: 16px; color: rgb(0, 0, 0);">
                        <p style="margin: 4px 0; color: rgb(0, 0, 0);">___________________________</p>
                        <p style="font-weight: bold; margin: 4px 0; color: rgb(0, 0, 0);">${config.representante}</p>
                        <p style="margin: 4px 0; color: rgb(0, 0, 0);">C.C. ${config.cedula}</p>
                    </div>
                </div>
            `

            document.body.appendChild(tempDiv)

            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                foreignObjectRendering: false,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    const styles = clonedDoc.querySelectorAll("style, link[rel='stylesheet']")
                    styles.forEach((style) => style.remove())
                },
            })

            document.body.removeChild(tempDiv)

            const imgData = canvas.toDataURL("image/jpeg", 0.95)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
            heightLeft -= pdfHeight

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
            }

            pdf.save(`Cotizacion_${proyecto.nombre.replace(/\s+/g, "_")}.pdf`)
        } catch (error) {
            console.error("Error generando PDF:", error)
            alert("Error al generar el PDF. Por favor intente nuevamente.")
        }
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
                    <Button onClick={generarPDF}>
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
