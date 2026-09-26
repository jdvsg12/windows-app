// "212 64% 30%" → [212, 64, 30]
export function parseHsl(triplet: string): [number, number, number] {
    const match = /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/.exec(triplet.trim())
    if (!match) throw new Error(`Invalid HSL triplet: "${triplet}"`)
    return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function hslToHex(triplet: string): string {
    const [hue, saturation, lightness] = parseHsl(triplet)
    const s = saturation / 100
    const l = lightness / 100
    const a = s * Math.min(l, 1 - l)
    const channel = (n: number) => {
        const k = (n + hue / 30) % 12
        return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    }
    return (
        "#" +
        [channel(0), channel(8), channel(4)]
            .map((value) => Math.round(value * 255).toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase()
    )
}

const relativeLuminance = (hex: string): number => {
    const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    const linear = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

// WCAG 2.x contrast ratio between two "#RRGGBB" colors.
export function contrastRatio(hexA: string, hexB: string): number {
    const [lighter, darker] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((x, y) => y - x)
    return (lighter + 0.05) / (darker + 0.05)
}
