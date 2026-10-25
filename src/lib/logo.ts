// Logo and signature uploads: validate it is an image, then downscale it to fit within
// MAX_DIMENSION so a typical phone photo doesn't bloat localStorage (which has no
// abstraction-layer size limit today and fails silently past its quota). The result is
// always PNG or JPEG, the two formats the PDF can embed.
import { PAPER } from "./design/tokens"

const MAX_DIMENSION = 400
const MAX_DATA_URL_BYTES = 512 * 1024

export type LogoResult = { dataUrl: string; width: number; height: number } | { error: string }

// nombre goes into the error messages: "El logo", "La firma". Product photos use a smaller
// maxDimension: six of them live in localStorage next to the projects. forceJpeg is for photos
// pasted in the quote description: a PNG screenshot weighs several times its JPEG, and each one
// is stored in the project and in its PDF versions.
export async function processLogoFile(
    file: File,
    nombre = "El logo",
    maxDimension = MAX_DIMENSION,
    forceJpeg = false,
): Promise<LogoResult> {
    if (!file.type.startsWith("image/")) {
        return { error: `${nombre} debe ser una imagen (PNG, JPG, SVG, etc.)` }
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

    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) {
        return { error: "No se pudo procesar la imagen en este navegador" }
    }
    const mimeType = file.type === "image/png" && !forceJpeg ? "image/png" : "image/jpeg"
    if (mimeType === "image/jpeg") {
        // JPEG has no transparency: without a background, transparent pixels turn black.
        context.fillStyle = PAPER.fondo
        context.fillRect(0, 0, width, height)
    }
    context.drawImage(image, 0, 0, width, height)

    const dataUrl = canvas.toDataURL(mimeType, forceJpeg ? 0.8 : 0.9)

    if (dataUrl.length > MAX_DATA_URL_BYTES * 1.4) {
        return { error: `${nombre}: la imagen sigue siendo muy pesada incluso reducida. Usa una imagen más simple.` }
    }

    return { dataUrl, width, height }
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
