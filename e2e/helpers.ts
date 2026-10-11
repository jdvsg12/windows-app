import { expect, type Page } from "@playwright/test"

export async function crearProyecto(page: Page, nombre: string): Promise<void> {
    await page.goto("/")
    await page.getByRole("button", { name: "Nuevo Proyecto" }).click()
    await page.getByPlaceholder("Ej: Casa López").fill(nombre)
    await page.getByRole("button", { name: "Crear", exact: true }).click()
    // The dashboard lists the new project instead of opening it.
    await page.getByRole("link", { name: new RegExp(`^${nombre}`) }).click()
    await expect(page).toHaveURL(/\/calculators\?id=/)
    await expect(page.getByRole("heading", { name: nombre })).toBeVisible()
}

// The autosave debounces 600 ms; wait until the indicator confirms the write.
export async function esperarGuardado(page: Page): Promise<void> {
    await expect(page.getByText("Guardado").first()).toBeVisible()
}
