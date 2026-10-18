import { readFile } from "node:fs/promises"

import { expect, test } from "@playwright/test"
import { read, utils } from "xlsx"

import { crearProyecto } from "./helpers"

test("Exportar: el Excel trae las ventanas con sus especificaciones y el resumen de perfiles", async ({ page }) => {
    await crearProyecto(page, "Obra excel")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByLabel("Color de aluminio").selectOption({ label: "Negro" })
    await page.getByLabel("Acabado sandblasting").setChecked(true)
    await page.getByRole("button", { name: "Agregar ventana" }).click()

    const descarga = page.waitForEvent("download")
    await page.getByRole("button", { name: "Exportar" }).click()
    const archivo = await descarga
    expect(archivo.suggestedFilename()).toBe("Obra excel_calculo.xlsx")

    const libro = read(await readFile((await archivo.path()) ?? ""))
    expect(libro.SheetNames).toEqual(["Ventanas", "Resumen Perfiles"])

    const [ventana] = utils.sheet_to_json<Record<string, unknown>>(libro.Sheets.Ventanas)
    expect(ventana).toMatchObject({
        Código: "V1",
        Nombre: "Sala",
        "Ancho (mm)": 1500,
        "Alto (mm)": 1200,
        "Color aluminio": "Negro",
        Sandblasting: "Sí",
    })

    const perfiles = utils.sheet_to_json<Record<string, unknown>>(libro.Sheets["Resumen Perfiles"])
    expect(perfiles.length).toBeGreaterThan(0)
    expect(Object.keys(perfiles[0])).toEqual(["Perfil", "Barras de 6m", "Metros Usados"])
})
