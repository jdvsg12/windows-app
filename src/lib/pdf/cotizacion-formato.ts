import { formatCount, formatCurrency } from "../format"

// La forma de pago del taller es fija (decisión del usuario): 60 % de anticipo y el saldo
// en pagos parciales según avance de la obra.
export const PORCENTAJE_ANTICIPO = 60

export interface ResumenPago {
    anticipo: number
    saldo: number
}

// El anticipo se redondea al peso y el saldo es lo que falta: siempre suman el total exacto.
export function resumenPago(total: number | null): ResumenPago | null {
    if (total === null) return null
    const anticipo = Math.round((total * PORCENTAJE_ANTICIPO) / 100)
    return { anticipo, saldo: total - anticipo }
}

// Para el cliente las medidas van en metros ("2,05 m"); el taller trabaja en milímetros.
export const metrosDesdeMm = (mm: number): string => `${formatCount(mm / 1000, 2)} m`

export const numeroItem = (indice: number): string => String(indice + 1).padStart(2, "0")

// Texto fijo de la forma de pago (decisión del usuario); con valores, lleva los montos.
export function textoFormaPago(pago: ResumenPago | null): string {
    const saldo = 100 - PORCENTAJE_ANTICIPO
    if (!pago) return `Anticipo del ${PORCENTAJE_ANTICIPO} %. Saldo: pagos parciales según avance de la obra.`
    return `Anticipo del ${PORCENTAJE_ANTICIPO} % (${formatCurrency(pago.anticipo)}). Saldo del ${saldo} % (${formatCurrency(pago.saldo)}): pagos parciales según avance de la obra.`
}
