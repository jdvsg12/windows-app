import { expect, test } from "@playwright/test"

import { crearProyecto, esperarGuardado } from "./helpers"

test.describe("Datos del proyecto (duración y transporte)", () => {
    test.beforeEach(async ({ page }) => {
        await crearProyecto(page, "Obra transporte")
    })

    test("el transporte se escribe, se guarda y sigue ahí al recargar", async ({ page }) => {
        const transporte = page.getByLabel("Transporte ($)")
        await transporte.fill("150000")
        await esperarGuardado(page)

        await page.reload()
        await expect(page.getByLabel("Transporte ($)")).toHaveValue("150000")
    })

    test("borrar el campo y escribir otro monto no rompe el guardado", async ({ page }) => {
        const transporte = page.getByLabel("Transporte ($)")
        await transporte.click()
        await transporte.press("ControlOrMeta+a")
        await transporte.press("Backspace")
        // Deja pasar el autoguardado con el campo vacío: así es como el usuario lo vive.
        await page.waitForTimeout(1000)
        await transporte.pressSequentially("80000")
        await esperarGuardado(page)

        await page.reload()
        await expect(page.getByLabel("Transporte ($)")).toHaveValue("80000")
    })

    test("un campo vacío no hace desaparecer el proyecto del dashboard", async ({ page }) => {
        const transporte = page.getByLabel("Transporte ($)")
        await transporte.fill("")
        await page.waitForTimeout(1000)

        await page.goto("/")
        await expect(page.getByText("Obra transporte")).toBeVisible()
    })

    test("la duración acepta decimales y se guarda", async ({ page }) => {
        const duracion = page.getByLabel("Duración estimada (meses)")
        await duracion.fill("2.5")
        await esperarGuardado(page)

        await page.reload()
        await expect(page.getByLabel("Duración estimada (meses)")).toHaveValue("2.5")
    })
})
