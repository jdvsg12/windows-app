import { expect, test } from "@playwright/test"

import { crearProyecto } from "./helpers"

test("Optimización muestra las métricas del vidrio: piezas, área, bordeado, cantos y merma", async ({ page }) => {
    await crearProyecto(page, "Obra métricas")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await expect(page.getByText("1 ventanas")).toBeVisible()

    await page.getByRole("tab", { name: "Optimización" }).click()

    const metricas = page.locator("dl")
    for (const etiqueta of ["Piezas", "Área neta", "Bordeado", "Cantos", "Merma"]) {
        await expect(metricas.getByText(etiqueta, { exact: true })).toBeVisible()
    }
    // Una ventana cabe en una sola lámina: no hay láminas completas para medir merma.
    await expect(metricas.getByText("—")).toBeVisible()
    await expect(metricas.getByText("sin la última lámina de cada tipo")).toBeVisible()
})

test("las piezas de vidrio llevan su código V#-F#/M# y la ventana muestra su número", async ({ page }) => {
    await crearProyecto(page, "Obra códigos")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("2400")
    await page.getByLabel("Alto (mm)").fill("1500")
    await page.getByLabel("Tipo").selectOption({ label: "3 Hojas" })
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await expect(page.getByRole("heading", { name: "V1 Sala" })).toBeVisible()

    await page.getByRole("tab", { name: "Optimización" }).click()
    for (const codigo of ["V1-F1", "V1-M1", "V1-M2"]) {
        await expect(page.getByText(codigo, { exact: true }).first()).toBeVisible()
    }
})
