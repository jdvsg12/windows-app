// Shared across every reference engine (today only 8025). Depends on nothing but the
// window's own dimensions, so it never needs a `sistema`-specific discount table.
import type { Ventana } from "@/lib/types"

// Barra comercial de perfil de aluminio.
export const LONGITUD_BARRA = 6 // metros

export function calcularAreaTotalM2(ventanas: readonly Ventana[]): number {
    return ventanas.reduce((sum, v) => sum + (v.ancho * v.alto) / 1_000_000, 0)
}
