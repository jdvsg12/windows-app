import { readFile } from "node:fs/promises"

import { expect, test } from "@playwright/test"

import { crearProyecto, esperarGuardado } from "./helpers"

// PNG de 2×1 px: basta para probar la carga desde el botón.
const FOTO_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR42mNkYPhfz8DAwMAAAAeAAoGNdGwAAAAASUVORK5CYII=",
    "base64",
)

test("descripción: las imágenes pegadas o insertadas salen en la vista previa y en el PDF", async ({ page }) => {
    await crearProyecto(page, "Obra con referencias")
    await page.getByLabel("Nombre").fill("Sala")
    await page.getByLabel("Ancho (mm)").fill("1500")
    await page.getByLabel("Alto (mm)").fill("1200")
    await page.getByRole("button", { name: "Agregar ventana" }).click()
    await page.getByRole("button", { name: "Cotizar" }).click()

    await page.getByRole("tab", { name: "Contenido" }).click()
    const editor = page.getByRole("textbox", { name: "Descripción / Introducción de la cotización" })
    await editor.fill("Ventana corrediza como la de la foto:")

    // Pegar una captura de 1200×600 (como un Ctrl+V desde el portapapeles): se reduce a 600 px en JPEG.
    await editor.evaluate(async (elemento) => {
        const lienzo = document.createElement("canvas")
        lienzo.width = 1200
        lienzo.height = 600
        const contexto = lienzo.getContext("2d")
        if (contexto) {
            contexto.fillStyle = "steelblue"
            contexto.fillRect(0, 0, 1200, 600)
        }
        const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/png"))
        const datos = new DataTransfer()
        datos.items.add(new File([blob ?? new Blob()], "captura.png", { type: "image/png" }))
        elemento.dispatchEvent(new ClipboardEvent("paste", { clipboardData: datos, bubbles: true, cancelable: true }))
    })
    const pegada = editor.locator("img").first()
    await expect(pegada).toHaveAttribute("width", "600")
    await expect(pegada).toHaveAttribute("height", "300")
    await expect(pegada).toHaveAttribute("src", /^data:image\/jpeg;base64,/)

    await page.getByLabel("Archivo de imagen para la descripción").setInputFiles({ name: "ref.png", mimeType: "image/png", buffer: FOTO_PNG })
    await expect(editor.locator("img")).toHaveCount(2)
    await esperarGuardado(page)

    // Una imagen de una página web (URL externa) no sirve sin red ni en el PDF: se quita con un aviso.
    await editor.evaluate((elemento) => {
        elemento.insertAdjacentHTML("beforeend", '<img src="https://ejemplo.com/ventana.png">')
        elemento.dispatchEvent(new InputEvent("input", { bubbles: true }))
    })
    await expect(page.getByText("Esa imagen no se pudo agregar así")).toBeVisible()
    await expect(editor.locator("img")).toHaveCount(2)

    await page.reload()
    await page.getByRole("tab", { name: "Contenido" }).click()
    await expect(editor.locator("img")).toHaveCount(2)

    await page.getByRole("tab", { name: "Vista Previa" }).click()
    const vista = page.getByRole("tabpanel")
    await expect(vista.getByText("Ventana corrediza como la de la foto:")).toBeVisible()
    await expect(vista.getByRole("img", { name: "Imagen de referencia" })).toHaveCount(2)

    const descarga = page.waitForEvent("download")
    await page.getByRole("button", { name: "Descargar PDF" }).click()
    const contenido = (await readFile((await (await descarga).path()) ?? "")).toString("latin1")
    expect(contenido.match(/\/Subtype\s*\/Image/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
})
