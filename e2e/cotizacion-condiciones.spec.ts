import { expect, test, type Page } from "@playwright/test"

import { crearProyecto, esperarGuardado } from "./helpers"

// PNG de 2×1 px: basta para probar la carga de la firma.
const FIRMA_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR42mNkYPhfz8DAwMAAAAeAAoGNdGwAAAAASUVORK5CYII=",
    "base64",
)

async function abrirCotizador(page: Page) {
    await crearProyecto(page, "Obra condiciones")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await page.getByRole("button", { name: "Cotizar" }).click()
    await expect(page.getByRole("heading", { name: "Cotizador" })).toBeVisible()
}

test("la cotización lleva ciudad y fecha, dirección de la obra, total en la tabla, entrega, validez y firma", async ({ page }) => {
    await abrirCotizador(page)

    await page.getByLabel("Ciudad").fill("Girardot")
    await page.getByLabel("Firma").setInputFiles({ name: "firma.png", mimeType: "image/png", buffer: FIRMA_PNG })
    await expect(page.getByRole("img", { name: /^Firma de/ })).toBeVisible()
    await esperarGuardado(page)

    await page.getByRole("tab", { name: "Contenido" }).click()
    // Valores por defecto de toda cotización nueva.
    await expect(page.getByLabel("Tiempo de entrega")).toHaveValue("25 días hábiles")
    await expect(page.getByLabel("Validez de la cotización")).toHaveValue("15 días hábiles")
    await page.getByLabel("Dirección de la obra").fill("Casa 106, Condominio El Peñón")
    await page.getByLabel("Tiempo de entrega").fill("20 días hábiles")
    await esperarGuardado(page)

    await page.getByRole("tab", { name: "Vista Previa" }).click()
    const vista = page.getByRole("tabpanel")
    await expect(vista.getByText(/^Girardot, \d+ de \w+ de \d{4}$/)).toBeVisible()
    await expect(vista.getByText("Casa 106, Condominio El Peñón")).toBeVisible()
    await expect(vista.locator("tfoot tr")).toContainText(/TOTAL\s*\$[\d.]+/)
    await expect(vista.getByText("20 días hábiles")).toBeVisible()
    await expect(vista.getByText("15 días hábiles")).toBeVisible()
    await expect(vista.getByRole("img", { name: /^Firma de/ })).toBeVisible()

    // Todo se guarda en el proyecto y vuelve al recargar.
    await page.reload()
    await page.getByRole("tab", { name: "Contenido" }).click()
    await expect(page.getByLabel("Dirección de la obra")).toHaveValue("Casa 106, Condominio El Peñón")
    await expect(page.getByLabel("Tiempo de entrega")).toHaveValue("20 días hábiles")

    const descarga = page.waitForEvent("download")
    await page.getByRole("button", { name: "Descargar PDF" }).click()
    expect((await descarga).suggestedFilename()).toBe("Cotizacion_Obra_condiciones.pdf")

    // La firma es opcional: se puede quitar.
    await page.getByRole("tab", { name: "Configuración" }).click()
    await page.getByRole("button", { name: "Quitar firma" }).click()
    await expect(page.getByRole("img", { name: /^Firma de/ })).toHaveCount(0)
    await page.getByRole("tab", { name: "Vista Previa" }).click()
    await expect(page.getByRole("tabpanel").getByRole("img", { name: /^Firma de/ })).toHaveCount(0)
})
