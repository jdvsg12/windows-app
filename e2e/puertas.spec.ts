import { expect, test, type Page } from "@playwright/test"

import { crearProyecto } from "./helpers"

// El radio está oculto visualmente dentro de su tarjeta: se elige tocando la tarjeta, como el usuario.
async function elegirProducto(page: Page, nombre: "Puerta abatible Alumina" | "Ventana corrediza") {
    await page.getByText(nombre, { exact: true }).click()
    await expect(page.getByRole("radio", { name: new RegExp(nombre) })).toBeChecked()
}

async function agregarPuerta(page: Page, nombre: string, ancho: string, alto: string) {
    await page.getByLabel("Nombre").fill(nombre)
    await page.getByLabel("Ancho del vano (mm)").fill(ancho)
    await page.getByLabel("Alto del vano (mm)").fill(alto)
}

test("puerta Alumina: se elige en el selector, valida el vano y sale en Materiales y Optimización", async ({ page }) => {
    await crearProyecto(page, "Obra puertas")

    await elegirProducto(page, "Puerta abatible Alumina")
    await expect(page.getByText("Agregar puerta", { exact: true }).first()).toBeVisible()

    // Un vano angosto deja el pisavidrio y el vidrio en negativo: no se agrega.
    await agregarPuerta(page, "Closet", "240", "1984")
    await expect(page.getByText(/da medidas no positivas: Pisavidrio horizontal superior \(-16 mm\)/)).toBeVisible()
    await page.getByRole("button", { name: "Agregar puerta" }).click()
    await expect(page.getByText("No hay productos agregados")).toBeVisible()

    await agregarPuerta(page, "Entrada", "654", "1984")
    await expect(page.getByText("Hoja 596 × 1944 mm · vidrio 406 × 1754 mm")).toBeVisible()
    await page.getByRole("button", { name: "Agregar puerta" }).click()
    await expect(page.getByRole("heading", { name: "P1 Entrada" })).toBeVisible()
    await expect(page.getByText("1 puerta", { exact: true })).toBeVisible()

    // Sigue cargando al recargar: la puerta vive en el proyecto.
    await page.reload()
    await expect(page.getByRole("heading", { name: "P1 Entrada" })).toBeVisible()

    // Materiales es la lista de compra: barras por referencia y herrajes con su foto.
    await page.getByRole("tab", { name: "Materiales" }).click()
    await expect(page.getByText("Lo que hay que comprar")).toBeVisible()
    const marco = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "U-57 · Marco" }) })
    await expect(marco).toContainText("1barra")
    await expect(marco.getByRole("img", { name: "Sección del perfil U-57" })).toBeVisible()
    const bisagra = page.getByRole("listitem").filter({ hasText: "Bisagra Omega" })
    await expect(bisagra).toContainText("P1")
    await expect(bisagra).toContainText("4unidades")
    await expect(page.getByRole("img", { name: "Escuadra de ensamble" })).toBeVisible()
    await expect(page.getByRole("row", { name: /P1 Entrada - Puerta Incoloro 4 mm 406 mm × 1\.754 mm/ })).toBeVisible()

    // Optimización: las barras y, debajo, cada pieza con sus cortes.
    await page.getByRole("tab", { name: "Optimización" }).click()
    await expect(page.getByText("Corte de perfiles de puertas")).toBeVisible()
    await expect(page.getByText(/1 barra; consumo 4\.622 mm, sobrante 1\.366 mm/)).toBeVisible()
    await expect(page.getByText(/1 barra; consumo 5\.080 mm, sobrante 904 mm/)).toBeVisible()
    await expect(page.getByText(/1 barra; consumo 4\.252 mm, sobrante 1\.732 mm/)).toBeVisible()
    await expect(page.getByRole("listitem").filter({ hasText: "Marco vertical izquierdo" })).toContainText("1.984 mm, cortes 45° / 90°")
    await expect(page.getByRole("listitem").filter({ hasText: "Hoja horizontal superior" })).toContainText("596 mm, cortes 45° / 45°")
    await expect(page.getByRole("listitem").filter({ hasText: "Pisavidrio vertical derecho" })).toContainText("1.728 mm, cortes 90° / 90°")
})

test("puerta Alumina: editar desde su tarjeta y cambiar descuentos en Admin", async ({ page }) => {
    await crearProyecto(page, "Obra edición")
    const url = page.url()
    await elegirProducto(page, "Puerta abatible Alumina")
    await agregarPuerta(page, "Baño", "654", "1984")
    await page.getByRole("button", { name: "Agregar puerta" }).click()

    // Volver a ventana y editar la puerta: el selector pasa solo a puerta y queda bloqueado.
    await elegirProducto(page, "Ventana corrediza")
    await page.getByRole("button", { name: "Editar puerta Baño" }).click()
    await expect(page.getByText("Editando: Baño", { exact: true })).toBeVisible()
    await expect(page.getByRole("radio", { name: /Ventana corrediza/ })).toBeDisabled()
    await page.getByLabel("Ancho del vano (mm)").fill("700")
    await page.getByRole("button", { name: "Guardar cambios" }).click()
    await expect(page.getByText("Vano 700 × 1984 mm")).toBeVisible()

    await page.goto("/admin")
    await page.getByPlaceholder("Contraseña").fill("admin123")
    await page.locator("button[type=submit]").click()
    await page.getByRole("tab", { name: "Puerta Alumina" }).click()
    await page.locator("#puerta-descuentoPisavidrioVertical").fill("210")
    await page.getByRole("button", { name: "Guardar Cambios" }).click()
    await expect(page.getByRole("button", { name: "Guardado!" })).toBeVisible()

    await page.goto(url)
    await page.getByRole("tab", { name: "Optimización" }).click()
    await expect(page.getByRole("listitem").filter({ hasText: "Pisavidrio vertical izquierdo" })).toContainText("1.734 mm, cortes 90° / 90°")
})
