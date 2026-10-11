// Reference glass cutting job "Heliconias" (Heliconias.pdf).
//
// The PDF came from a home-made prototype that subtracts 2 mm per cut as if a blade were passing.
// Glass is scored and snapped, so it loses no material: kerf must be 0.
// Therefore ONLY the totals that do not depend on kerf are golden: piece count, net area,
// edging length and edge count. Do NOT assert the sheet count (7), the 16.25 % waste or any
// per-sheet metric from that PDF; they come from the 2 mm bug.
//
// Sheet count (3300 x 2140, kerf 0, strict guillotine):
// - 7 is a hard lower bound for ANY layout, not only guillotine: 17 pieces are longer than the
//   2140 side, so they can only lie along the 3300 side, and being wider than 1650 no two of
//   them fit side by side — they stack. Their short sides add up to 13,852 mm, and
//   13,852 / 2140 = 6.47 → at least 7 sheets. (The area-only bound of 6 is not reachable.)
// - 7 is achievable: PLAN_7_LAMINAS_HELICONIAS below is a valid guillotine plan, found once
//   offline by an exhaustive search (long pieces grouped into columns, a per-sheet choice of a
//   bottom band, the rest packed piece by piece). That search took ~84 s, too slow to run on
//   every recalculation in the app; capped at an interactive budget it did not reach 7.
// - lib/calculo/vidrio.ts (piece by piece, guillotine) gives 8. Confirmed with the user: ≤8 is
//   the accepted bound for the optimizer; the reference plan documents the 1-sheet gap.

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

// Reference guillotine plan in 7 sheets (see the comment at the top). Coordinates in mm from the
// sheet corner; ancho/alto as placed (a piece may be rotated).
export interface PiezaColocada {
    n: number
    x: number
    y: number
    ancho: number
    alto: number
}

export const PLAN_7_LAMINAS_HELICONIAS: readonly (readonly PiezaColocada[])[] = [
    [
        { n: 4, x: 2909, y: 1525, ancho: 348, alto: 553 },
        { n: 12, x: 0, y: 1228, ancho: 2548, alto: 873 },
        { n: 19, x: 0, y: 0, ancho: 2458, alto: 1228 },
        { n: 24, x: 2548, y: 0, ancho: 361, alto: 1928 },
        { n: 28, x: 2909, y: 0, ancho: 356, alto: 760 },
        { n: 29, x: 2909, y: 760, ancho: 348, alto: 765 },
    ],
    [
        { n: 1, x: 2943, y: 0, ancho: 343, alto: 548 },
        { n: 2, x: 2538, y: 1208, ancho: 345, alto: 553 },
        { n: 3, x: 2943, y: 548, ancho: 343, alto: 548 },
        { n: 15, x: 0, y: 1224, ancho: 2538, alto: 810 },
        { n: 17, x: 0, y: 0, ancho: 2470, alto: 1224 },
        { n: 26, x: 2538, y: 0, ancho: 405, alto: 1208 },
    ],
    [
        { n: 11, x: 0, y: 1088, ancho: 2548, alto: 921 },
        { n: 18, x: 0, y: 0, ancho: 2458, alto: 1088 },
        { n: 25, x: 2548, y: 0, ancho: 405, alto: 1203 },
    ],
    [
        { n: 13, x: 0, y: 1084, ancho: 2538, alto: 774 },
        { n: 16, x: 0, y: 0, ancho: 2470, alto: 1084 },
        { n: 27, x: 2538, y: 0, ancho: 405, alto: 1196 },
    ],
    [
        { n: 6, x: 2258, y: 0, ancho: 893, alto: 1574 },
        { n: 8, x: 0, y: 918, ancho: 2258, alto: 881 },
        { n: 9, x: 0, y: 0, ancho: 2258, alto: 918 },
    ],
    [
        { n: 5, x: 2318, y: 406, ancho: 885, alto: 1586 },
        { n: 7, x: 0, y: 1274, ancho: 2268, alto: 818 },
        { n: 10, x: 0, y: 406, ancho: 2318, alto: 868 },
        { n: 20, x: 0, y: 0, ancho: 2467, alto: 406 },
    ],
    [
        { n: 14, x: 0, y: 0, ancho: 2538, alto: 750 },
        { n: 21, x: 0, y: 1153, ancho: 2463, alto: 403 },
        { n: 22, x: 0, y: 1556, ancho: 2463, alto: 403 },
        { n: 23, x: 0, y: 750, ancho: 2473, alto: 403 },
    ],
]
