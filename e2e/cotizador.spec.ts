import { expect, test, type Page } from "@playwright/test"

import { crearProyecto, esperarGuardado } from "./helpers"

async function abrirCotizadorConUnaVentana(page: Page) {
    await crearProyecto(page, "Obra cotizada")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await page.getByRole("button", { name: "Cotizar" }).click()
    await expect(page.getByRole("heading", { name: "Cotizador" })).toBeVisible()
}

test.describe("Cotizador", () => {
    test.beforeEach(async ({ page }) => {
        await abrirCotizadorConUnaVentana(page)
    })

    test("Contenido: cliente, descripción y opciones se guardan y vuelven al recargar", async ({ page }) => {
        await page.getByRole("tab", { name: "Contenido" }).click()
        await page.getByLabel("Cliente").fill("Ana López")
        await page.getByRole("textbox", { name: "Descripción / Introducción de la cotización" }).fill("Suministro e instalación")
        await page.getByRole("switch", { name: "Mostrar valores" }).click()
        await esperarGuardado(page)

        await page.reload()
        await page.getByRole("tab", { name: "Contenido" }).click()
        await expect(page.getByLabel("Cliente")).toHaveValue("Ana López")
        await expect(page.getByRole("textbox", { name: "Descripción / Introducción de la cotización" })).toHaveText(
            "Suministro e instalación"
        )
        await expect(page.getByRole("switch", { name: "Mostrar valores" })).not.toBeChecked()
    })

    test("Precios: un campo de precio se puede borrar y volver a escribir", async ({ page }) => {
        await page.getByRole("tab", { name: "Precios" }).click()
        const manoDeObra = page.getByLabel("Mano de Obra ($/m²)")
        await manoDeObra.click()
        await manoDeObra.press("ControlOrMeta+a")
        await manoDeObra.press("Backspace")
        await manoDeObra.pressSequentially("45000")
        await expect(manoDeObra).toHaveValue("45000")

        await page.reload()
        await page.getByRole("tab", { name: "Precios" }).click()
        await expect(page.getByLabel("Mano de Obra ($/m²)")).toHaveValue("45000")
    })

    test("Costos adicionales: el valor se puede borrar y volver a escribir", async ({ page }) => {
        await page.getByRole("tab", { name: "Precios" }).click()
        await page.getByRole("button", { name: "Agregar Costo" }).click()
        const valor = page.getByLabel("Valor del costo adicional")
        await valor.click()
        await valor.press("ControlOrMeta+a")
        await valor.press("Backspace")
        await valor.pressSequentially("120000")
        await expect(valor).toHaveValue("120000")

        await page.reload()
        await page.getByRole("tab", { name: "Precios" }).click()
        await expect(page.getByLabel("Valor del costo adicional")).toHaveValue("120000")
    })

    test("Precios: si el campo queda vacío, al salir vuelve el último valor", async ({ page }) => {
        await page.getByRole("tab", { name: "Precios" }).click()
        const manoDeObra = page.getByLabel("Mano de Obra ($/m²)")
        const anterior = await manoDeObra.inputValue()
        await manoDeObra.fill("")
        await manoDeObra.blur()
        await expect(manoDeObra).toHaveValue(anterior)
    })
})
