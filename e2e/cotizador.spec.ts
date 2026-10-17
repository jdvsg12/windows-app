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

    test("Precios por tipo: la cerradura de la ventana se cobra al precio de su tipo y se guarda", async ({ page }) => {
        await page.getByRole("tab", { name: "Precios" }).click()
        // La ventana se creó con la cerradura por defecto (impacto): 1 cerradura.
        const materiales = page.getByText("Materiales (Perfiles + Accesorios + Vidrio + Empaque):").locator("xpath=following-sibling::span[1]")
        const aNumero = (texto: string) => Number(texto.replace(/[^0-9]/g, ""))
        const textoAntes = await materiales.innerText()
        const antes = aNumero(textoAntes)

        const general = aNumero(await page.getByLabel("Cerradura (general)").inputValue())
        await expect(page.getByRole("group", { name: "Cerradura por tipo" })).toBeVisible()
        await page.getByLabel("Impacto").fill(String(general + 10000))
        await expect(materiales).not.toHaveText(textoAntes)
        expect(aNumero(await materiales.innerText()) - antes).toBe(10000)

        await page.reload()
        await page.getByRole("tab", { name: "Precios" }).click()
        await expect(page.getByLabel("Impacto")).toHaveValue(String(general + 10000))
    })

    test("Precios muestra lo que depende de cada ventana: color de aluminio, vidrio por tipo y sandblasting", async ({ page }) => {
        await page.getByRole("tab", { name: "Precios" }).click()
        await expect(page.getByText("Precios según lo elegido en cada ventana")).toBeVisible()
        await expect(page.getByLabel("Negro (%)")).toBeVisible()
        await expect(page.getByLabel("Sandblasting (por m²)")).toBeVisible()
        await expect(page.getByLabel("Precio lámina Bronce 5 mm")).toBeVisible()
        await expect(page.getByRole("group", { name: "Rodachina por tipo" })).toBeVisible()
    })
})
