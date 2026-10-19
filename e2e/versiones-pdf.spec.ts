import { expect, test, type Page } from "@playwright/test"

import { crearProyecto } from "./helpers"

async function abrirCotizador(page: Page) {
    await crearProyecto(page, "Obra versiones")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await page.getByRole("button", { name: "Cotizar" }).click()
    await expect(page.getByRole("heading", { name: "Cotizador" })).toBeVisible()
}

// Cada cliente distinto es un documento distinto: una versión nueva.
async function descargarConCliente(page: Page, cliente: string) {
    await page.getByRole("tab", { name: "Contenido" }).click()
    await page.getByLabel("Cliente").fill(cliente)
    const descarga = page.waitForEvent("download")
    await page.getByRole("button", { name: "Descargar PDF" }).click()
    await descarga
    await expect(page.getByRole("button", { name: "Descargar PDF" })).toBeEnabled()
}

test("versiones del PDF: quedan las 3 últimas, la guardada no rota y se pueden volver a descargar", async ({ page }) => {
    await abrirCotizador(page)
    await page.getByRole("tab", { name: "Vista Previa" }).click()
    await expect(page.getByText("Todavía no has descargado el PDF de esta cotización.")).toBeVisible()

    for (const cliente of ["Cliente 1", "Cliente 2", "Cliente 3", "Cliente 4"]) await descargarConCliente(page, cliente)
    await page.getByRole("tab", { name: "Vista Previa" }).click()
    const versiones = page.getByRole("listitem")
    await expect(versiones).toHaveCount(3)
    await expect(versiones.nth(0)).toContainText("Cliente 4")
    await expect(versiones.nth(2)).toContainText("Cliente 2")

    // Guardar la más vieja: sobrevive a 3 descargas más.
    await versiones.nth(2).getByRole("button", { name: /^Guardar la versión/ }).click()
    for (const cliente of ["Cliente 5", "Cliente 6", "Cliente 7"]) await descargarConCliente(page, cliente)
    await page.getByRole("tab", { name: "Vista Previa" }).click()
    await expect(versiones).toHaveCount(4)
    await expect(versiones.filter({ hasText: "Guardada" })).toContainText("Cliente 2")
    await expect(versiones.nth(0)).toContainText("Cliente 7")

    // Volver a descargar la guardada genera su PDF, y persiste al recargar.
    const descarga = page.waitForEvent("download")
    await versiones.filter({ hasText: "Cliente 2" }).getByRole("button", { name: /^Descargar la versión/ }).click()
    expect((await descarga).suggestedFilename()).toBe("Cotizacion_Obra_versiones.pdf")

    await page.reload()
    await page.getByRole("tab", { name: "Vista Previa" }).click()
    await expect(versiones).toHaveCount(4)
    await expect(versiones.filter({ hasText: "Guardada" })).toContainText("Cliente 2")
})
