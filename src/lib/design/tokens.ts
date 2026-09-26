import { hslToHex } from "./color"

// Single TypeScript mirror of the CSS tokens in app/globals.css (`:root`), as HSL triplets.
// The PDF cannot read CSS variables, so it derives its hex colors from here.
// A test (tokens.test.ts) keeps this table and globals.css identical.
export const HSL_TOKENS = {
    background: "210 25% 97%",
    foreground: "215 28% 12%",
    card: "0 0% 100%",
    "card-foreground": "215 28% 12%",
    popover: "0 0% 100%",
    "popover-foreground": "215 28% 12%",
    primary: "212 64% 30%",
    "primary-foreground": "0 0% 100%",
    secondary: "212 30% 93%",
    "secondary-foreground": "212 50% 20%",
    muted: "212 25% 94%",
    "muted-foreground": "215 16% 38%",
    accent: "212 40% 92%",
    "accent-foreground": "212 60% 24%",
    destructive: "0 72% 45%",
    "destructive-foreground": "0 0% 100%",
    success: "152 62% 26%",
    "success-foreground": "0 0% 100%",
    info: "199 85% 33%",
    "info-foreground": "0 0% 100%",
    warning: "38 92% 50%",
    "warning-foreground": "30 90% 12%",
    border: "214 20% 87%",
    input: "215 14% 55%",
    ring: "212 64% 40%",

    // Printed paper (quote preview and PDF): always light, never themed.
    paper: "0 0% 100%",
    "paper-ink": "0 0% 0%",
    "paper-rule": "0 0% 20%",
    "paper-shade": "0 0% 94%",

    // Profiles, one hue each. The monogram (piezas.ts) is the second, non-color indicator.
    "piece-cabezal-bg": "210 70% 93%",
    "piece-cabezal-border": "210 55% 38%",
    "piece-cabezal-fg": "210 65% 20%",
    "piece-sillar-bg": "265 70% 93%",
    "piece-sillar-border": "265 55% 38%",
    "piece-sillar-fg": "265 65% 20%",
    "piece-jamba-izq-bg": "150 70% 93%",
    "piece-jamba-izq-border": "150 55% 38%",
    "piece-jamba-izq-fg": "150 65% 20%",
    "piece-jamba-der-bg": "175 70% 93%",
    "piece-jamba-der-border": "175 55% 38%",
    "piece-jamba-der-fg": "175 65% 20%",
    "piece-enganche-bg": "28 70% 93%",
    "piece-enganche-border": "28 55% 38%",
    "piece-enganche-fg": "28 65% 20%",
    "piece-traslape-bg": "340 70% 93%",
    "piece-traslape-border": "340 55% 38%",
    "piece-traslape-fg": "340 65% 20%",
    "piece-horiz-sup-bg": "48 70% 93%",
    "piece-horiz-sup-border": "48 55% 38%",
    "piece-horiz-sup-fg": "48 65% 20%",
    "piece-horiz-inf-bg": "95 70% 93%",
    "piece-horiz-inf-border": "95 55% 38%",
    "piece-horiz-inf-fg": "95 65% 20%",

    // Glass: fixed and movable leaves, reusable offcuts (R) and scrap (S).
    "hoja-fija-bg": "214 16% 92%",
    "hoja-fija-border": "215 14% 42%",
    "hoja-fija-fg": "215 28% 16%",
    "hoja-movil-bg": "212 60% 92%",
    "hoja-movil-border": "212 64% 30%",
    "hoja-movil-fg": "212 60% 18%",
    "resto-bg": "152 45% 92%",
    "resto-border": "152 62% 26%",
    "resto-fg": "152 62% 18%",
    "desperdicio-bg": "215 10% 90%",
    "desperdicio-border": "215 10% 42%",
    "desperdicio-fg": "215 12% 22%",
} as const

export type TokenName = keyof typeof HSL_TOKENS

export const hexToken = (name: TokenName): string => hslToHex(HSL_TOKENS[name])

export const PAPER = {
    fondo: hexToken("paper"),
    tinta: hexToken("paper-ink"),
    regla: hexToken("paper-rule"),
    sombreado: hexToken("paper-shade"),
} as const
