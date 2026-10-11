import { expect, type Page } from "@playwright/test"

export async function crearProyecto(page: Page, nombre: string): Promise<void> {
    await page.goto("/")
    await page.getByRole("button", { name: "Nuevo Proyecto" }).click()
    await page.getByPlaceholder("Ej: Casa López").fill(nombre)
    await page.getByRole("button", { name: "Crear", exact: true }).click()
    // The dashboard lists the new project instead of opening it. Follow its href rather than
    // clicking, so the create form's collapse animation can't move the link under the cursor.
    const enlace = page.getByRole("link", { name: new RegExp(`^${nombre}`) })
    await page.goto((await enlace.getAttribute("href")) ?? "/")
    await expect(page).toHaveURL(/\/calculators\?id=/)
    await expect(page.getByRole("heading", { name: nombre })).toBeVisible()
}

// The autosave debounces 600 ms; wait until the indicator confirms the write.
export async function esperarGuardado(page: Page): Promise<void> {
    await expect(page.getByText("Guardado").first()).toBeVisible()
}
