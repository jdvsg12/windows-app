import { expect, test, type Page } from "@playwright/test"

import { crearProyecto, esperarGuardado } from "./helpers"

// PNG de 2×1 px: basta para probar la carga de una foto.
const FOTO_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR42mNkYPhfz8DAwMAAAAeAAoGNdGwAAAAASUVORK5CYII=",
    "base64",
)

// La contraseña de admin está fija en el código (src/app/admin/page.tsx) hasta F4.
async function entrarAdmin(page: Page) {
    await page.goto("/admin")
    await page.getByPlaceholder("Contraseña").fill("admin123")
    await page.locator("button[type=submit]").click()
    await expect(page.getByRole("heading", { name: "Panel de Administración" })).toBeVisible()
}

test("fotos de producto: la cotización muestra la foto de la cerradura que usan sus ventanas", async ({ page }) => {
    await entrarAdmin(page)
    await page.getByRole("tab", { name: "Fotos de producto" }).click()
    await page.getByLabel("Cerradura Impacto").setInputFiles({ name: "impacto.png", mimeType: "image/png", buffer: FOTO_PNG })
    await page.getByLabel("Leyenda en la cotización").fill("Cerradura impacto sencilla")
    await esperarGuardado(page)

    // Una ventana nueva lleva cerradura de impacto y rodachina plástica (sin foto en el catálogo).
    await crearProyecto(page, "Obra fotos")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await page.getByRole("button", { name: "Cotizar" }).click()

    await page.getByRole("tab", { name: "Vista Previa" }).click()
    const vista = page.getByRole("tabpanel")
    await expect(vista.getByText("Criterios técnicos y especificaciones")).toBeVisible()
    await expect(vista.getByRole("img", { name: "Cerradura impacto sencilla" })).toBeVisible()
    await expect(vista.getByRole("figure")).toHaveCount(1)

    const descarga = page.waitForEvent("download")
    await page.getByRole("button", { name: "Descargar PDF" }).click()
    expect((await descarga).suggestedFilename()).toBe("Cotizacion_Obra_fotos.pdf")
})
