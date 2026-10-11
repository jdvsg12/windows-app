// lib/pdf-generatos.ts - Generador de PDF sin dependencias de oklch
import { formatArea, formatCount, formatCurrency } from "./format"
import { getTipoVentanaLabel, type Proyecto, type ConfiguracionEmpresa, type CostosCalculadosCotizador } from "./types"
import { PAPER } from "./design/tokens"

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
            background-color: ${PAPER.fondo};
            padding: 20px;
            font-family: Geist, Arial, sans-serif;
            color: ${PAPER.tinta};
            font-size: 14px;
            line-height: 1.5;
        `
        tempDiv.innerHTML = htmlContent
        document.body.appendChild(tempDiv)

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: PAPER.fondo,
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
        <div style="background-color: ${PAPER.fondo}; color: ${PAPER.tinta}; padding: 32px; font-family: Geist, Arial, sans-serif; font-size: 14px; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid ${PAPER.tinta}; padding-bottom: 16px;">
                ${config.logo ? `<div style="width: 128px; height: 128px;"><img src="${config.logo}" alt="${config.nombre} - logo" style="width: 100%; height: 100%; object-fit: contain;" /></div>` : ""}
                <div style="text-align: right; font-size: 14px; line-height: 1.6; color: ${PAPER.tinta};">
                    <p style="font-weight: bold; margin-bottom: 4px; color: ${PAPER.tinta}; margin: 0 0 4px 0;">${config.nombre}</p>
                    <p style="margin: 2px 0; color: ${PAPER.tinta};">NIT: ${config.nit}</p>
                    <p style="margin: 2px 0; color: ${PAPER.tinta};">${config.direccion}</p>
                    <p style="margin: 2px 0; color: ${PAPER.tinta};">CEL: ${config.telefonos}</p>
                    <p style="margin: 2px 0; color: ${PAPER.tinta};">e-mail: ${config.email}</p>
                    <p style="margin: 2px 0; color: ${PAPER.tinta};">${config.ciudad}</p>
                </div>
            </div>
            <div style="margin-bottom: 24px; text-align: right; color: ${PAPER.tinta};">
                <p style="color: ${PAPER.tinta}; margin: 0;">${fecha}</p>
            </div>
            <div style="margin-bottom: 24px; color: ${PAPER.tinta};">
                <p style="margin: 4px 0; color: ${PAPER.tinta};">Señor(a):</p>
                <p style="font-weight: bold; margin: 4px 0; color: ${PAPER.tinta};">${proyecto.cliente}</p>
            </div>
            <h2 style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 24px; text-decoration: underline; color: ${PAPER.tinta}; margin-top: 0;">COTIZACIÓN</h2>
            ${descripcion ? `<div style="margin-bottom: 24px; line-height: 1.6; color: ${PAPER.tinta};">${descripcion}</div>` : ""}
            <div style="margin-bottom: 24px; color: ${PAPER.tinta};">
                <h3 style="font-weight: bold; margin-bottom: 16px; font-size: 16px; color: ${PAPER.tinta}; margin-top: 0;">Ventanas del Proyecto: ${proyecto.nombre}</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid ${PAPER.regla}; margin-bottom: 16px;">
                    <thead>
                        <tr style="background-color: ${PAPER.sombreado};">
                            <th style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: left; font-weight: bold; color: ${PAPER.tinta};">Nombre</th>
                            <th style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: left; font-weight: bold; color: ${PAPER.tinta};">Tipo</th>
                            ${mostrarMedidas ? `<th style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: left; font-weight: bold; color: ${PAPER.tinta};">Ancho (mm)</th><th style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: left; font-weight: bold; color: ${PAPER.tinta};">Alto (mm)</th><th style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: right; font-weight: bold; color: ${PAPER.tinta};">Área (m²)</th>` : ""}
                            ${mostrarValores && costos ? `<th style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: right; font-weight: bold; color: ${PAPER.tinta};">Valor</th>` : ""}
                        </tr>
                    </thead>
                    <tbody>
                        ${proyecto.ventanas.map((ventana) => {
                            const valorVentana = costos?.valoresPorVentana.find((v) => v.id === ventana.id)
                            return `<tr>
                                <td style="border: 1px solid ${PAPER.regla}; padding: 8px; color: ${PAPER.tinta};">${ventana.nombre}</td>
                                <td style="border: 1px solid ${PAPER.regla}; padding: 8px; color: ${PAPER.tinta};">${getTipoVentanaLabel(ventana.tipoVentana)}</td>
                                ${mostrarMedidas ? `<td style="border: 1px solid ${PAPER.regla}; padding: 8px; color: ${PAPER.tinta};">${ventana.ancho}</td><td style="border: 1px solid ${PAPER.regla}; padding: 8px; color: ${PAPER.tinta};">${ventana.alto}</td><td style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: right; color: ${PAPER.tinta};">${formatCount(valorVentana?.area, 2)}</td>` : ""}
                                ${mostrarValores && costos ? `<td style="border: 1px solid ${PAPER.regla}; padding: 8px; text-align: right; color: ${PAPER.tinta};">${formatCurrency(valorVentana?.valor)}</td>` : ""}
                            </tr>`
                        }).join("")}
                    </tbody>
                </table>
                <div style="margin-top: 16px; color: ${PAPER.tinta};">
                    <p style="font-weight: bold; color: ${PAPER.tinta}; margin: 0 0 4px 0;">Total de ventanas: ${proyecto.ventanas.length}</p>
                    ${mostrarMedidas && costos ? `<p style="margin-top: 4px; color: ${PAPER.tinta}; margin: 4px 0 0 0;">Área total: ${formatArea(costos.areaTotal)}</p>` : ""}
                    ${mostrarValores && costos ? `<p style="margin-top: 8px; font-size: 18px; font-weight: bold; color: ${PAPER.tinta}; margin: 8px 0 0 0;">VALOR TOTAL: ${formatCurrency(costos.total)}</p>` : ""}
                </div>
            </div>
            <div style="margin-bottom: 24px; color: ${PAPER.tinta};">
                <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px; color: ${PAPER.tinta}; margin-top: 0; margin: 0 0 8px 0;">FORMA DE PAGO:</h3>
                <p style="margin: 4px 0; color: ${PAPER.tinta};">Anticipo 60%</p>
                <p style="margin: 4px 0; color: ${PAPER.tinta};">Saldo: PAGOS PARCIALES SEGÚN AVANCE DE LA OBRA</p>
            </div>
            <div style="margin-bottom: 24px; color: ${PAPER.tinta};">
                <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px; color: ${PAPER.tinta}; margin-top: 0; margin: 0 0 8px 0;">DATOS BANCARIOS:</h3>
                <p style="font-size: 14px; white-space: pre-wrap; line-height: 1.6; color: ${PAPER.tinta}; margin: 0;">${config.datosBancarios}</p>
            </div>
            <div style="margin-top: 48px; border-top: 1px solid ${PAPER.tinta}; padding-top: 16px; color: ${PAPER.tinta};">
                <p style="margin: 4px 0; color: ${PAPER.tinta};">___________________________</p>
                <p style="font-weight: bold; margin: 4px 0; color: ${PAPER.tinta};">${config.representante}</p>
                <p style="margin: 4px 0; color: ${PAPER.tinta};">C.C. ${config.cedula}</p>
            </div>
        </div>
    `
}
