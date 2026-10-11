// Logo upload: validate it is an image, then downscale it to fit within
// MAX_DIMENSION so a typical phone photo doesn't bloat localStorage (which has no
// abstraction-layer size limit today and fails silently past its quota).
const MAX_DIMENSION = 400
const MAX_DATA_URL_BYTES = 512 * 1024

export type LogoResult = { dataUrl: string } | { error: string }

export async function processLogoFile(file: File): Promise<LogoResult> {
    if (!file.type.startsWith("image/")) {
        return { error: "El logo debe ser una imagen (PNG, JPG, SVG, etc.)" }
    }

    let originalDataUrl: string
    try {
        originalDataUrl = await readFileAsDataUrl(file)
    } catch {
        return { error: "No se pudo leer el archivo" }
    }

    let image: HTMLImageElement
    try {
        image = await loadImage(originalDataUrl)
    } catch {
        return { error: "El archivo no es una imagen válida" }
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) {
        return { error: "No se pudo procesar la imagen en este navegador" }
    }
    context.drawImage(image, 0, 0, width, height)

    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg"
    const dataUrl = canvas.toDataURL(mimeType, 0.9)

    if (dataUrl.length > MAX_DATA_URL_BYTES * 1.4) {
        return { error: "El logo sigue siendo muy pesado incluso reducido. Usa una imagen más simple." }
    }

    return { dataUrl }
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("invalid image"))
        image.src = src
    })
}
