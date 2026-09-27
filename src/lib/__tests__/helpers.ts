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
