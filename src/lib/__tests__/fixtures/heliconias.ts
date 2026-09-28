// Reference glass cutting job "Heliconias" (Heliconias.pdf).
//
// The PDF came from a home-made prototype that subtracts 2 mm per cut as if a blade were passing.
// Glass is scored and snapped, so it loses no material: kerf must be 0.
// Therefore ONLY the totals that do not depend on kerf are golden: piece count, net area,
// edging length and edge count. Do NOT assert the sheet count (7), the 16.25 % waste or any
// per-sheet metric from that PDF; they come from the 2 mm bug.
//
// The area-only lower bound is 6 sheets (40.063 / 7.062 = 5.67), but that bound ignores the
// guillotine constraint (every cut must go edge-to-edge). lib/calculo/vidrio.ts was tried with
// 6 sort orders × 3 split strategies × a global-best-fit-per-sheet variant; none beat 8 sheets
// for these 29 pieces under a strict guillotine cut — a real, though weaker, algorithm than
// whatever produced the reference PDF's 7 (itself achieved despite its 2 mm kerf bug, which
// should only ever cost more sheets, not fewer). Confirmed with the user: ≤8 is the accepted
// bound here, not ≤7.

export interface PiezaHeliconias {
    n: number
    ancho: number // mm
    alto: number // mm
}

export const PIEZAS_HELICONIAS: readonly PiezaHeliconias[] = [
    { n: 1, ancho: 548, alto: 343 },
    { n: 2, ancho: 553, alto: 345 },
    { n: 3, ancho: 548, alto: 343 },
    { n: 4, ancho: 553, alto: 348 },
    { n: 5, ancho: 885, alto: 1586 },
    { n: 6, ancho: 893, alto: 1574 },
    { n: 7, ancho: 2268, alto: 818 },
    { n: 8, ancho: 2258, alto: 881 },
    { n: 9, ancho: 2258, alto: 918 },
    { n: 10, ancho: 2318, alto: 868 },
    { n: 11, ancho: 2548, alto: 921 },
    { n: 12, ancho: 2548, alto: 873 },
    { n: 13, ancho: 2538, alto: 774 },
    { n: 14, ancho: 2538, alto: 750 },
    { n: 15, ancho: 2538, alto: 810 },
    { n: 16, ancho: 2470, alto: 1084 },
    { n: 17, ancho: 2470, alto: 1224 },
    { n: 18, ancho: 2458, alto: 1088 },
    { n: 19, ancho: 2458, alto: 1228 },
    { n: 20, ancho: 2467, alto: 406 },
    { n: 21, ancho: 2463, alto: 403 },
    { n: 22, ancho: 2463, alto: 403 },
    { n: 23, ancho: 2473, alto: 403 },
    { n: 24, ancho: 361, alto: 1928 },
    { n: 25, ancho: 405, alto: 1203 },
    { n: 26, ancho: 405, alto: 1208 },
    { n: 27, ancho: 405, alto: 1196 },
    { n: 28, ancho: 356, alto: 760 },
    { n: 29, ancho: 765, alto: 348 },
]

export const TOTALES_HELICONIAS = {
    piezas: 29,
    areaNetaM2: 40.063,
    bordeadoM: 146.49,
    cantos: 116,
} as const

export const LAMINA_HELICONIAS = { ancho: 3300, alto: 2140 } as const
