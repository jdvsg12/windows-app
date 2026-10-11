import { expect, test } from "@playwright/test"

import { crearProyecto } from "./helpers"

test.describe("Formulario de ventanas", () => {
    test.beforeEach(async ({ page }) => {
        await crearProyecto(page, "Obra ventanas")
    })

    test("agrega una ventana con nombre y medidas, y sigue ahí al recargar", async ({ page }) => {
        await page.getByLabel("Nombre").fill("Sala")
        await page.getByLabel("Ancho (mm)").fill("1500")
        await page.getByLabel("Alto (mm)").fill("1200")
        await page.getByRole("button", { name: "Agregar ventana" }).click()

        await expect(page.getByText("1500 × 1200 mm")).toBeVisible()
        await page.reload()
        await expect(page.getByText("1500 × 1200 mm")).toBeVisible()
        await expect(page.getByText("1 ventanas")).toBeVisible()
    })

    test("acepta medidas con decimales", async ({ page }) => {
        await page.getByLabel("Nombre").fill("Baño")
        await page.getByLabel("Ancho (mm)").fill("850.5")
        await page.getByLabel("Alto (mm)").fill("600")
        await page.getByRole("button", { name: "Agregar ventana" }).click()

        await expect(page.getByText("850.5 × 600 mm")).toBeVisible()
    })

    test("sin medidas muestra el error y no agrega la ventana", async ({ page }) => {
        await page.getByLabel("Nombre").fill("Cocina")
        await page.getByRole("button", { name: "Agregar ventana" }).click()

        await expect(page.getByText("Ingresa el ancho")).toBeVisible()
        await expect(page.getByText("Ingresa el alto")).toBeVisible()
        await expect(page.getByText("0 ventanas")).toBeVisible()
    })
})
