export interface Rectangulo {
    x: number
    y: number
    ancho: number
    alto: number
}

// Snapshots round to 1e-6 so a pure refactor that reorders float operations does not break the baseline.
export function redondear<T>(valor: T, decimales = 6): T {
    if (typeof valor === "number") {
        const factor = 10 ** decimales
        return (Math.round(valor * factor) / factor) as T
    }
    if (Array.isArray(valor)) return valor.map((item) => redondear(item, decimales)) as T
    if (valor && typeof valor === "object") {
        return Object.fromEntries(
            Object.entries(valor).map(([clave, item]) => [clave, redondear(item, decimales)])
        ) as T
    }
    return valor
}

export const seSolapan = (a: Rectangulo, b: Rectangulo): boolean =>
    a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto

// A layout is guillotine when its region can be split by a straight edge-to-edge cut that
// crosses no piece, and each side is again guillotine — down to single pieces.
export function esGuillotina(piezas: readonly Rectangulo[], region: Rectangulo): boolean {
    if (piezas.length <= 1) return true
    const cortes = [
        ...piezas.map((p) => ({ eje: "x" as const, en: p.x + p.ancho })),
        ...piezas.map((p) => ({ eje: "y" as const, en: p.y + p.alto })),
    ]
    for (const { eje, en } of cortes) {
        const inicio = eje === "x" ? region.x : region.y
        const fin = eje === "x" ? region.x + region.ancho : region.y + region.alto
        if (en <= inicio || en >= fin) continue
        const antes = piezas.filter((p) => (eje === "x" ? p.x + p.ancho : p.y + p.alto) <= en)
        const despues = piezas.filter((p) => (eje === "x" ? p.x : p.y) >= en)
        if (antes.length === 0 || antes.length + despues.length !== piezas.length) continue
        const [regionAntes, regionDespues] =
            eje === "x"
                ? [
                      { ...region, ancho: en - region.x },
                      { ...region, x: en, ancho: region.x + region.ancho - en },
                  ]
                : [
                      { ...region, alto: en - region.y },
                      { ...region, y: en, alto: region.y + region.alto - en },
                  ]
        if (esGuillotina(antes, regionAntes) && esGuillotina(despues, regionDespues)) return true
    }
    return false
}
