import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { contrastRatio, hslToHex } from "../color"
import { HSL_TOKENS, PAPER, hexToken, type TokenName } from "../tokens"

const SRC = fileURLToPath(new URL("../../../", import.meta.url))
const GLOBALS_CSS = readFileSync(join(SRC, "app/globals.css"), "utf-8")

const tokensDeclarados = (css: string): Record<string, string> => {
    const raiz = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? ""
    return Object.fromEntries(
        [...raiz.matchAll(/--([a-z0-9-]+):\s*(\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%);/g)].map((m) => [m[1], m[2]])
    )
}

const contraste = (a: TokenName, b: TokenName) => contrastRatio(hexToken(a), hexToken(b))

describe("color utils", () => {
    it("convierte HSL a hex", () => {
        expect(hslToHex("212 64% 30%")).toBe("#1C497D")
        expect(hslToHex("0 0% 20%")).toBe("#333333")
        expect(hslToHex("0 0% 94%")).toBe("#F0F0F0")
        expect(hslToHex("0 0% 100%")).toBe("#FFFFFF")
    })

    it("calcula el contraste WCAG", () => {
        expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1)
        expect(contraste("primary", "primary-foreground")).toBeCloseTo(9.11, 1)
    })

    it("rechaza tripletes inválidos", () => {
        expect(() => hslToHex("azul")).toThrow()
    })
})

describe("tokens · globals.css y tokens.ts", () => {
    const enCss = tokensDeclarados(GLOBALS_CSS)

    it("tokens.ts y :root de globals.css son idénticos", () => {
        expect(enCss).toEqual(HSL_TOKENS)
    })

    it("cada token está mapeado a un color de Tailwind y cada mapeo apunta a un token real", () => {
        const referenciados = [...GLOBALS_CSS.matchAll(/--color-[a-z0-9-]+:\s*hsl\(var\(--([a-z0-9-]+)\)\)/g)].map((m) => m[1])
        expect(new Set(referenciados)).toEqual(new Set(Object.keys(HSL_TOKENS)))
    })

    it("no hay tema oscuro en v1, pero la variante dark queda inerte", () => {
        expect(GLOBALS_CSS).not.toMatch(/^\.dark\s*\{/m)
        expect(GLOBALS_CSS).toContain("@custom-variant dark (&:is(.dark *))")
    })
})

describe("tokens · contraste WCAG", () => {
    const paresDeTexto: [TokenName, TokenName][] = [
        ["background", "foreground"],
        ["card", "card-foreground"],
        ["popover", "popover-foreground"],
        ["primary", "primary-foreground"],
        ["secondary", "secondary-foreground"],
        ["muted", "muted-foreground"],
        ["accent", "accent-foreground"],
        ["destructive", "destructive-foreground"],
        ["success", "success-foreground"],
        ["info", "info-foreground"],
        ["warning", "warning-foreground"],
        ["background", "muted-foreground"],
        ["card", "muted-foreground"],
    ]

    it.each(paresDeTexto)("texto %s / %s ≥ 4.5:1", (fondo, texto) => {
        expect(contraste(fondo, texto)).toBeGreaterThanOrEqual(4.5)
    })

    it.each(["card", "background"] as const)("borde de campos (--input) sobre %s ≥ 3:1 (WCAG 1.4.11)", (fondo) => {
        expect(contraste(fondo, "input")).toBeGreaterThanOrEqual(3)
    })

    it("el anillo de foco se distingue del fondo ≥ 3:1", () => {
        expect(contraste("background", "ring")).toBeGreaterThanOrEqual(3)
    })

    it("la tinta del papel impreso es casi negro sobre blanco", () => {
        expect(contraste("paper", "paper-ink")).toBeGreaterThanOrEqual(7)
        expect(PAPER).toEqual({ fondo: "#FFFFFF", tinta: "#000000", regla: "#333333", sombreado: "#F0F0F0" })
    })

    const familias = [
        "piece-cabezal",
        "piece-sillar",
        "piece-jamba-izq",
        "piece-jamba-der",
        "piece-enganche",
        "piece-traslape",
        "piece-horiz-sup",
        "piece-horiz-inf",
        "hoja-fija",
        "hoja-movil",
        "resto",
        "desperdicio",
    ] as const

    describe.each(familias)("%s", (familia) => {
        const bg = `${familia}-bg` as TokenName
        const borde = `${familia}-border` as TokenName
        const fg = `${familia}-fg` as TokenName

        it("texto sobre su fondo ≥ 7:1", () => {
            expect(contraste(bg, fg)).toBeGreaterThanOrEqual(7)
        })

        it("borde ≥ 3:1 contra blanco y contra su propio fondo", () => {
            expect(contraste("card", borde)).toBeGreaterThanOrEqual(3)
            expect(contraste(bg, borde)).toBeGreaterThanOrEqual(3)
        })
    })
})

describe("touch targets · globals.css", () => {
    const bloque = /@media \(pointer: coarse\)\s*\{([\s\S]*)\}\s*$/.exec(GLOBALS_CSS)?.[1] ?? ""

    it("existe la regla para punteros táctiles", () => {
        expect(bloque).not.toBe("")
    })

    const slots = ["button", "input", "textarea", "select-trigger", "native-select", "tabs-trigger"]

    it.each(slots)("apunta a [data-slot=%s] con min-height de 2.75rem (44 px)", (slot) => {
        const regla = new RegExp(`\\[data-slot="${slot}"\\][^{]*\\{[^}]*min-height:\\s*2\\.75rem`)
        expect(bloque).toMatch(regla)
    })

    it.each([
        ["components/ui/button.tsx", "button"],
        ["components/ui/input.tsx", "input"],
        ["components/ui/textarea.tsx", "textarea"],
        ["components/ui/select.tsx", "select-trigger"],
        ["components/ui/tabs.tsx", "tabs-trigger"],
        ["components/ui/switch.tsx", "switch"],
        ["components/common/NativeSelect.tsx", "native-select"],
    ])("%s sigue exponiendo data-slot=%s", (archivo, slot) => {
        expect(readFileSync(join(SRC, archivo), "utf-8")).toContain(`data-slot="${slot}"`)
    })
})

describe("tokens · sin colores hardcodeados en el código de la app", () => {
    const listarFuentes = (carpeta: string): string[] =>
        readdirSync(carpeta).flatMap((nombre) => {
            const ruta = join(carpeta, nombre)
            if (statSync(ruta).isDirectory()) return listarFuentes(ruta)
            return /\.(ts|tsx)$/.test(nombre) ? [ruta] : []
        })

    const excluidos = ["components/ui/", "lib/design/", "__tests__/"]
    const fuentes = listarFuentes(SRC).filter((ruta) => !excluidos.some((parte) => relative(SRC, ruta).includes(parte)))

    const clasePaleta =
        /\b(?:text|bg|border|ring|fill|stroke|from|to|via)-(?:red|green|blue|yellow|orange|amber|emerald|slate|gray|zinc|neutral|stone|sky|indigo|violet|purple|pink|rose|cyan|teal|lime|white|black)(?:-\d{2,3})?\b/
    const literalDeColor = /#[0-9a-fA-F]{6}\b|\brgba?\(/

    it("revisa una cantidad razonable de archivos", () => {
        expect(fuentes.length).toBeGreaterThan(30)
    })

    it.each(fuentes.map((ruta) => [relative(SRC, ruta), readFileSync(ruta, "utf-8")] as const))(
        "%s no usa clases de paleta ni hex/rgb",
        (_ruta, contenido) => {
            expect(contenido).not.toMatch(clasePaleta)
            expect(contenido).not.toMatch(literalDeColor)
        }
    )
})
