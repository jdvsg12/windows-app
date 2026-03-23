// lib/pdf-generatos.ts - Generador de PDF sin dependencias de oklch
import type { Proyecto, ConfiguracionEmpresa, CostosCalculadosCotizador } from "./types"

export interface PDFOptions {
    mostrarMedidas: boolean
    mostrarValores: boolean
    descripcion: string
    fecha: string
}

export async function generarPDF(
    proyecto: Proyecto,
    config: ConfiguracionEmpresa,
    costos: CostosCalculadosCotizador | null,
    options: PDFOptions
) {
    try {
        const html2canvas = (await import("html2canvas")).default
        const jsPDF = (await import("jspdf")).default

        const htmlContent = generarHTMLParaPDF(proyecto, config, costos, options)

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
        tempDiv.innerHTML = htmlContent
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
        return true
    } catch (error) {
        console.error("Error generando PDF:", error)
        return false
    }
}

function generarHTMLParaPDF(
    proyecto: Proyecto,
    config: ConfiguracionEmpresa,
    costos: CostosCalculadosCotizador | null,
    options: PDFOptions
): string {
    const { mostrarMedidas, mostrarValores, descripcion, fecha } = options

    return `
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
                            ${mostrarValores && costos ? `<th style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; font-weight: bold; color: rgb(0, 0, 0);">Valor</th>` : ""}
                        </tr>
                    </thead>
                    <tbody>
                        ${proyecto.ventanas.map((ventana) => {
                            const valorVentana = costos?.valoresPorVentana.find((v) => v.id === ventana.id)
                            return `<tr>
                                <td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.nombre}</td>
                                <td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.tipoVentana === "2hojas" ? "2 Hojas Normal" : ventana.tipoVentana}</td>
                                ${mostrarMedidas ? `<td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.ancho}</td><td style="border: 1px solid rgb(51, 51, 51); padding: 8px; color: rgb(0, 0, 0);">${ventana.alto}</td><td style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; color: rgb(0, 0, 0);">${valorVentana?.area.toFixed(2) || "0.00"}</td>` : ""}
                                ${mostrarValores && costos ? `<td style="border: 1px solid rgb(51, 51, 51); padding: 8px; text-align: right; color: rgb(0, 0, 0);">$${(valorVentana?.valor || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}</td>` : ""}
                            </tr>`
                        }).join("")}
                    </tbody>
                </table>
                <div style="margin-top: 16px; color: rgb(0, 0, 0);">
                    <p style="font-weight: bold; color: rgb(0, 0, 0); margin: 0 0 4px 0;">Total de ventanas: ${proyecto.ventanas.length}</p>
                    ${mostrarMedidas && costos ? `<p style="margin-top: 4px; color: rgb(0, 0, 0); margin: 4px 0 0 0;">Área total: ${costos.areaTotal.toFixed(2)} m²</p>` : ""}
                    ${mostrarValores && costos ? `<p style="margin-top: 8px; font-size: 18px; font-weight: bold; color: rgb(0, 0, 0); margin: 8px 0 0 0;">VALOR TOTAL: $${costos.total.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>` : ""}
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
}
