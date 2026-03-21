// lib/pdf-generator.ts - Generador de PDF sin dependencias de oklch
import type { Proyecto, ConfiguracionEmpresa, CostosCalculados } from "./types"

export interface PDFOptions {
    mostrarMedidas: boolean
    mostrarValores: boolean
    descripcion: string
    fecha: string
}

export async function generarPDF(
    proyecto: Proyecto,
    config: ConfiguracionEmpresa,
    costos: CostosCalculados | null,
    options: PDFOptions
) {
    try {
        const html2canvas = (await import("html2canvas")).default
        const jsPDF = (await import("jspdf")).default

        const htmlContent = generarHTMLParaPDF(proyecto, config, costos, options)

        // Crear elemento temporal fuera de vista
        const tempDiv = document.createElement("div")
        tempDiv.style.cssText = `
      position: absolute;
      left: -99999px;
      top: 0;
      width: 210mm;
      background: white;
    `
        tempDiv.innerHTML = htmlContent
        document.body.appendChild(tempDiv)

        // Generar canvas
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            foreignObjectRendering: false,
            allowTaint: true,
        })

        document.body.removeChild(tempDiv)

        // Crear PDF
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 10

        const imgData = canvas.toDataURL("image/png")
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
        pdf.save(`Cotizacion_${proyecto.nombre}.pdf`)

        return true
    } catch (error) {
        console.error("Error generando PDF:", error)
        return false
    }
}

function generarHTMLParaPDF(
    proyecto: Proyecto,
    config: ConfiguracionEmpresa,
    costos: CostosCalculados | null,
    options: PDFOptions
): string {
    const { mostrarMedidas, mostrarValores, descripcion, fecha } = options

    // Estilos inline con colores RGB puros
    const estilos = {
        contenedor: "background: rgb(255,255,255); padding: 32px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: rgb(0,0,0);",
        header: "display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid rgb(0,0,0); padding-bottom: 16px;",
        logo: "width: 128px; height: 128px;",
        logoImg: "width: 100%; height: 100%; object-fit: contain;",
        infoEmpresa: "text-align: right; font-size: 14px; line-height: 1.6;",
        parrafo: "margin: 2px 0; color: rgb(0,0,0);",
        titulo: "font-size: 24px; font-weight: bold; text-align: center; margin: 24px 0; text-decoration: underline; color: rgb(0,0,0);",
        tabla: "width: 100%; border-collapse: collapse; border: 1px solid rgb(51,51,51); margin: 16px 0;",
        thTd: "border: 1px solid rgb(51,51,51); padding: 8px; color: rgb(0,0,0);",
        thHeader: "border: 1px solid rgb(51,51,51); padding: 8px; text-align: left; font-weight: bold; background: rgb(240,240,240); color: rgb(0,0,0);",
        seccion: "margin: 24px 0;",
        firma: "margin-top: 48px; border-top: 1px solid rgb(0,0,0); padding-top: 16px;",
    }

    return `
    <div style="${estilos.contenedor}">
      <div style="${estilos.header}">
        ${config.logo ? `
          <div style="${estilos.logo}">
            <img src="${config.logo}" alt="Logo" style="${estilos.logoImg}" />
          </div>
        ` : ""}
        <div style="${estilos.infoEmpresa}">
          <p style="font-weight: bold; ${estilos.parrafo}">${config.nombre}</p>
          <p style="${estilos.parrafo}">NIT: ${config.nit}</p>
          <p style="${estilos.parrafo}">${config.direccion}</p>
          <p style="${estilos.parrafo}">CEL: ${config.telefonos}</p>
          <p style="${estilos.parrafo}">e-mail: ${config.email}</p>
          <p style="${estilos.parrafo}">${config.ciudad}</p>
        </div>
      </div>

      <div style="margin-bottom: 24px; text-align: right;">
        <p style="${estilos.parrafo}">${fecha}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <p style="${estilos.parrafo}">Señor(a):</p>
        <p style="font-weight: bold; ${estilos.parrafo}">${proyecto.cliente}</p>
      </div>

      <h2 style="${estilos.titulo}">COTIZACIÓN</h2>

      ${descripcion ? `<div style="margin-bottom: 24px;">${descripcion}</div>` : ""}

      <div style="${estilos.seccion}">
        <h3 style="font-weight: bold; margin-bottom: 16px; color: rgb(0,0,0);">
          Ventanas del Proyecto: ${proyecto.nombre}
        </h3>
        <table style="${estilos.tabla}">
          <thead>
            <tr>
              <th style="${estilos.thHeader}">Nombre</th>
              <th style="${estilos.thHeader}">Tipo</th>
              ${mostrarMedidas ? `
                <th style="${estilos.thHeader}">Ancho (mm)</th>
                <th style="${estilos.thHeader}">Alto (mm)</th>
                <th style="${estilos.thHeader}; text-align: right;">Área (m²)</th>
              ` : ""}
              ${mostrarValores && costos ? `
                <th style="${estilos.thHeader}; text-align: right;">Valor</th>
              ` : ""}
            </tr>
          </thead>
          <tbody>
            ${proyecto.ventanas.map(ventana => {
        const valorVentana = costos?.valoresPorVentana.find(v => v.id === ventana.id)
        return `
                <tr>
                  <td style="${estilos.thTd}">${ventana.nombre}</td>
                  <td style="${estilos.thTd}">
                    ${ventana.tipoVentana === "2hojas" ? "2 Hojas Normal" : "3 Hojas (1 Fija + 2 Correderas)"}
                  </td>
                  ${mostrarMedidas ? `
                    <td style="${estilos.thTd}">${ventana.ancho}</td>
                    <td style="${estilos.thTd}">${ventana.alto}</td>
                    <td style="${estilos.thTd}; text-align: right;">
                      ${valorVentana?.area.toFixed(2) || ""}
                    </td>
                  ` : ""}
                  ${mostrarValores && costos ? `
                    <td style="${estilos.thTd}; text-align: right;">
                      $${valorVentana?.valor.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                    </td>
                  ` : ""}
                </tr>
              `
    }).join("")}
          </tbody>
        </table>
        <div style="margin-top: 16px;">
          <p style="font-weight: bold; ${estilos.parrafo}">
            Total de ventanas: ${proyecto.ventanas.length}
          </p>
          ${mostrarMedidas && costos ? `
            <p style="${estilos.parrafo}">
              Área total: ${costos.areaTotal.toFixed(2)} m²
            </p>
          ` : ""}
          ${mostrarValores && costos ? `
            <p style="margin-top: 8px; font-size: 18px; font-weight: bold; ${estilos.parrafo}">
              VALOR TOTAL: $${costos.total.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
            </p>
          ` : ""}
        </div>
      </div>

      <div style="${estilos.seccion}">
        <h3 style="font-weight: bold; margin-bottom: 8px; color: rgb(0,0,0);">FORMA DE PAGO:</h3>
        <p style="${estilos.parrafo}">Anticipo 60%</p>
        <p style="${estilos.parrafo}">Saldo: PAGOS PARCIALES SEGÚN AVANCE DE LA OBRA</p>
      </div>

      <div style="${estilos.seccion}">
        <h3 style="font-weight: bold; margin-bottom: 8px; color: rgb(0,0,0);">DATOS BANCARIOS:</h3>
        <p style="white-space: pre-wrap; ${estilos.parrafo}">${config.datosBancarios}</p>
      </div>

      <div style="${estilos.firma}">
        <p style="${estilos.parrafo}">___________________________</p>
        <p style="font-weight: bold; ${estilos.parrafo}">${config.representante}</p>
        <p style="${estilos.parrafo}">C.C. ${config.cedula}</p>
      </div>
    </div>
  `
}