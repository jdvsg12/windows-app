import { readFile } from "node:fs/promises"

import { expect, test, type Download, type Page } from "@playwright/test"

import { crearProyecto } from "./helpers"

interface VentanaDePrueba {
    nombre: string
    ancho: string
    alto: string
    tipo: string
    aluminio: string
    cerradura: string
    rodachina: string
    calibre: string
    vidrio: string
    sandblasting: boolean
    // Como la muestran la tarjeta, la vista previa y el PDF (especificacionesVentana).
    especificaciones: string
}

const VENTANAS: readonly VentanaDePrueba[] = [
    {
        nombre: "Sala",
        ancho: "1500",
        alto: "1200",
        tipo: "2 Hojas",
        aluminio: "Negro",
        cerradura: "Manija",
        rodachina: "Metálica",
        calibre: "5 mm",
        vidrio: "Bronce",
        sandblasting: true,
        especificaciones: "Aluminio Negro · Cerradura Manija · Rodachina Metálica · Vidrio 5 mm · Bronce · Sandblasting",
    },
    {
        nombre: "Cocina",
        ancho: "1000",
        alto: "1000",
        tipo: "3 Hojas",
        aluminio: "Blanco",
        cerradura: "Impacto",
        rodachina: "Plástica",
        calibre: "4 mm",
        vidrio: "Incoloro",
        sandblasting: false,
        especificaciones: "Aluminio Blanco · Cerradura Impacto · Rodachina Plástica · Vidrio 4 mm · Incoloro",
    },
    {
        nombre: "Alcoba",
        ancho: "1800",
        alto: "1300",
        tipo: "4 Hojas",
        aluminio: "Natural (anodizado mate)",
        cerradura: "Dummy",
        rodachina: "Pabose",
        calibre: "6 mm",
        vidrio: "Gris (humo)",
        sandblasting: false,
        especificaciones: "Aluminio Natural (anodizado mate) · Cerradura Dummy · Rodachina Pabose · Vidrio 6 mm · Gris (humo)",
    },
]

async function agregarVentana(page: Page, ventana: VentanaDePrueba) {
    await page.getByLabel("Nombre").fill(ventana.nombre)
    await page.getByLabel("Ancho (mm)").fill(ventana.ancho)
    await page.getByLabel("Alto (mm)").fill(ventana.alto)
    await page.getByLabel("Tipo").selectOption({ label: ventana.tipo })
    await page.getByLabel("Color de aluminio").selectOption({ label: ventana.aluminio })
    await page.getByLabel("Cerradura").selectOption({ label: ventana.cerradura })
    await page.getByLabel("Rodachina").selectOption({ label: ventana.rodachina })
    await page.getByLabel("Calibre de vidrio").selectOption({ label: ventana.calibre })
    await page.getByLabel("Color de vidrio").selectOption({ label: ventana.vidrio })
    await page.getByLabel("Acabado sandblasting").setChecked(ventana.sandblasting)
    await page.getByRole("button", { name: "Agregar ventana" }).click()
}

async function contenidoDe(descarga: Download): Promise<string> {
    return (await readFile((await descarga.path()) ?? "")).toString("latin1")
}

test("flujo completo: un proyecto con 3 ventanas llena cada pestaña, la cotización y los PDF", async ({ page }) => {
    await crearProyecto(page, "Obra completa")
    const urlProyecto = page.url()

    for (const ventana of VENTANAS) await agregarVentana(page, ventana)
    await expect(page.getByText("3 ventanas")).toBeVisible()

    // Ventanas: cada tarjeta con su número y todas sus especificaciones.
    for (const [indice, ventana] of VENTANAS.entries()) {
        await expect(page.getByRole("heading", { name: `V${indice + 1} ${ventana.nombre}` })).toBeVisible()
        await expect(page.getByText(ventana.especificaciones, { exact: true })).toBeVisible()
    }
    await expect(page.getByText("Sin especificaciones")).toHaveCount(0)

    // Materiales: una cerradura por ventana y los vidrios de las tres.
    await page.getByRole("tab", { name: "Materiales" }).click()
    await expect(page.getByText("Cerraduras")).toBeVisible()
    await expect(page.getByText("Vidrios", { exact: true })).toBeVisible()

    // Optimización: piezas de las tres ventanas, láminas por tipo de vidrio (3 tipos distintos).
    await page.getByRole("tab", { name: "Optimización" }).click()
    for (const codigo of ["V1-F1", "V1-M1", "V2-M1", "V3-M1"]) {
        await expect(page.getByText(codigo, { exact: true }).first()).toBeVisible()
    }
    for (const grupo of ["Bronce 5 mm", "Incoloro 4 mm", "Gris (humo) 6 mm"]) {
        await expect(page.getByText(grupo, { exact: false }).first()).toBeVisible()
    }
    const descargaCorte = page.waitForEvent("download")
    await page.getByRole("button", { name: "Descargar plan de corte" }).click()
    const planCorte = await contenidoDe(await descargaCorte)
    expect(planCorte.startsWith("%PDF-")).toBe(true)
    expect(planCorte.match(/\/Type \/Page\b/g)?.length).toBeGreaterThanOrEqual(3)

    // Cotizador: la URL lleva el id real del proyecto.
    await page.getByRole("button", { name: "Cotizar" }).click()
    await expect(page.getByRole("heading", { name: "Cotizador" })).toBeVisible()
    expect(new URL(page.url()).searchParams.get("id")).toBe(new URL(urlProyecto).searchParams.get("id"))

    await page.getByRole("tab", { name: "Contenido" }).click()
    await page.getByLabel("Cliente").fill("Ana López")
    await page.getByRole("textbox", { name: "Descripción / Introducción de la cotización" }).fill("Suministro e instalación")

    // Vista previa: cliente, descripción, las 3 ventanas con sus especificaciones, valores y total.
    await page.getByRole("tab", { name: "Vista Previa" }).click()
    const vista = page.getByRole("tabpanel")
    await expect(vista.getByText("Ana López")).toBeVisible()
    await expect(vista.getByText("Suministro e instalación")).toBeVisible()
    const filas = vista.locator("tbody tr")
    await expect(filas).toHaveCount(3)
    for (const [indice, ventana] of VENTANAS.entries()) {
        const fila = filas.nth(indice)
        await expect(fila).toContainText(ventana.nombre)
        await expect(fila).toContainText(ventana.especificaciones)
        await expect(fila).toContainText(ventana.ancho)
        await expect(fila).toContainText("$")
    }
    await expect(vista.getByText("Total de ventanas: 3")).toBeVisible()
    await expect(vista.locator("tfoot tr")).toContainText(/TOTAL\s*\$[\d.]+/)

    const descargaCotizacion = page.waitForEvent("download")
    await page.getByRole("button", { name: "Descargar PDF" }).click()
    expect((await contenidoDe(await descargaCotizacion)).startsWith("%PDF-")).toBe(true)

    // Desde un proyecto abierto, el enlace "Calculadora" (sin id) no puede dejar abierto el anterior:
    // la página lo mostraba y "Cotizar" iba a /cotizador?id=null.
    await page.getByRole("button", { name: "Volver a la calculadora" }).click()
    await expect(page.getByRole("heading", { name: "Obra completa" })).toBeVisible()
    await page.getByRole("link", { name: "Calculadora" }).click()
    await expect(page).toHaveURL(/\/calculators$/)
    await expect(page.getByText("Crear Nuevo Proyecto")).toBeVisible()
    await expect(page.getByRole("button", { name: "Cotizar" })).toHaveCount(0)
})
