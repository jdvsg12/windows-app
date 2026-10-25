import type { AlineacionTexto, BloqueTexto, ItemLista, TramoTexto } from "../types"

// Interpreta el HTML del editor de la cotización (contentEditable + execCommand) sin DOM, para
// poder probarlo en Node. Entiende lo que produce el editor —negrita, cursiva, listas, alineación,
// párrafos en <div>, saltos <br> y "\n", imágenes pegadas— y lo más común de un texto pegado (<p>,
// <strong>, <em>, <span style>). Cualquier otra etiqueta se descarta y su texto se conserva.

interface Marco {
    etiqueta: string
    negrita: boolean
    cursiva: boolean
    alineacion: AlineacionTexto
}

const BLOQUES = new Set(["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "section", "article", "header", "footer", "table", "tr"])
const VACIAS = new Set(["br", "hr", "img", "input", "meta", "link", "wbr", "col", "area", "source"])
const IGNORADAS = new Set(["style", "script", "head", "title", "template"])

// Solo imágenes embebidas en PNG o JPEG: las dos que el PDF puede dibujar, y sin red (una URL
// externa no carga sin conexión ni en el PDF).
const IMAGEN_EMBEBIDA = /^data:image\/(?:png|jpe?g);base64,[a-z0-9+/=\s]+$/i

const ENTIDADES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }

const TOKEN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|[^<]+|</g

function decodificar(texto: string): string {
    return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entidad, codigo: string) => {
        if (codigo[0] === "#") {
            const numero = codigo[1].toLowerCase() === "x" ? Number.parseInt(codigo.slice(2), 16) : Number(codigo.slice(1))
            return Number.isFinite(numero) && numero > 0 ? String.fromCodePoint(numero) : ""
        }
        return ENTIDADES[codigo.toLowerCase()] ?? entidad
    })
}

function estiloDe(atributos: string, propiedad: string): string | undefined {
    const style = /style\s*=\s*("([^"]*)"|'([^']*)')/i.exec(atributos)
    const declaraciones = style?.[2] ?? style?.[3] ?? ""
    return new RegExp(`(?:^|;)\\s*${propiedad}\\s*:\\s*([^;]+)`, "i").exec(declaraciones)?.[1].trim().toLowerCase()
}

function atributo(atributos: string, nombre: string): string | undefined {
    const coincidencia = new RegExp(`(?:^|\\s)${nombre}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(atributos)
    return coincidencia?.[2] ?? coincidencia?.[3] ?? coincidencia?.[4]
}

function medida(atributos: string, nombre: string): number | undefined {
    const valor = Number(atributo(atributos, nombre))
    return Number.isFinite(valor) && valor > 0 ? valor : undefined
}

function marcoHijo(padre: Marco, etiqueta: string, atributos: string): Marco {
    const peso = estiloDe(atributos, "font-weight")
    const estilo = estiloDe(atributos, "font-style")
    const alineacion = estiloDe(atributos, "text-align") ?? /align\s*=\s*["']?(\w+)/i.exec(atributos)?.[1].toLowerCase()

    let negrita = padre.negrita || etiqueta === "b" || etiqueta === "strong" || /^h[1-6]$/.test(etiqueta)
    if (peso) negrita = peso === "bold" || peso === "bolder" || Number(peso) >= 600
    let cursiva = padre.cursiva || etiqueta === "i" || etiqueta === "em"
    if (estilo) cursiva = estilo === "italic" || estilo === "oblique"

    return {
        etiqueta,
        negrita,
        cursiva,
        alineacion: alineacion === "center" || alineacion === "right" || alineacion === "left" ? alineacion : padre.alineacion,
    }
}

function agregarTramo(tramos: TramoTexto[], texto: string, marco: Marco): void {
    const ultimo = tramos.at(-1)
    if (ultimo && ultimo.negrita === marco.negrita && ultimo.cursiva === marco.cursiva) {
        ultimo.texto += texto
        return
    }
    tramos.push({ texto, negrita: marco.negrita, cursiva: marco.cursiva })
}

// Quita los espacios y saltos de los bordes; descarta los tramos que quedan vacíos.
function recortar(tramos: TramoTexto[]): TramoTexto[] {
    const copia = tramos.map((tramo) => ({ ...tramo }))
    if (copia.length > 0) copia[0].texto = copia[0].texto.replace(/^\s+/, "")
    if (copia.length > 0) copia[copia.length - 1].texto = copia[copia.length - 1].texto.replace(/\s+$/, "")
    return copia.filter((tramo) => tramo.texto !== "")
}

export function parsearTextoEnriquecido(html: string): BloqueTexto[] {
    const bloques: BloqueTexto[] = []
    const marcos: Marco[] = [{ etiqueta: "", negrita: false, cursiva: false, alineacion: "left" }]
    let parrafo: { alineacion: AlineacionTexto; tramos: TramoTexto[] } | null = null
    let lista: Extract<BloqueTexto, { tipo: "lista" }> | null = null
    let nivelLista = -1
    let item: ItemLista | null = null
    let ignorando = 0
    // Una imagen dentro de una lista sale justo después de la lista: un bloque no cabe en un ítem.
    let imagenesEnLista: BloqueTexto[] = []

    const marco = () => marcos[marcos.length - 1]

    const cerrarParrafo = () => {
        if (parrafo) {
            const tramos = recortar(parrafo.tramos)
            if (tramos.length > 0) bloques.push({ tipo: "parrafo", alineacion: parrafo.alineacion, tramos })
        }
        parrafo = null
    }
    const cerrarItem = () => {
        if (item && lista) {
            const tramos = recortar(item.tramos)
            if (tramos.length > 0) lista.items.push({ tramos, nivel: item.nivel })
        }
        item = null
    }
    const saltoEnItem = (actual: ItemLista) => {
        const ultimo = actual.tramos.at(-1)
        if (ultimo && !ultimo.texto.endsWith("\n")) agregarTramo(actual.tramos, "\n", marco())
    }

    const agregarTexto = (texto: string) => {
        if (lista) {
            if (!item) {
                if (texto.trim() === "") return
                item = { tramos: [], nivel: Math.max(nivelLista, 0) }
            }
            agregarTramo(item.tramos, texto, marco())
            return
        }
        if (!parrafo) {
            if (texto.trim() === "") return
            parrafo = { alineacion: marco().alineacion, tramos: [] }
        }
        agregarTramo(parrafo.tramos, texto, marco())
    }

    const limiteDeBloque = () => {
        if (item) saltoEnItem(item)
        else if (!lista) cerrarParrafo()
    }

    for (const [token, cierre, nombre, atributos] of html.matchAll(TOKEN)) {
        if (token.startsWith("<!--")) continue
        const etiqueta = nombre?.toLowerCase()

        if (!etiqueta) {
            if (ignorando === 0) agregarTexto(decodificar(token))
            continue
        }
        if (IGNORADAS.has(etiqueta)) {
            ignorando = Math.max(0, ignorando + (cierre ? -1 : 1))
            continue
        }
        if (ignorando > 0) continue

        if (etiqueta === "br") {
            if (item) agregarTramo(item.tramos, "\n", marco())
            else if (parrafo) cerrarParrafo()
            else if (!lista) bloques.push({ tipo: "parrafo", alineacion: marco().alineacion, tramos: [] })
            continue
        }
        if (etiqueta === "img") {
            const src = atributo(atributos, "src")?.trim()
            if (cierre || !src || !IMAGEN_EMBEBIDA.test(src)) continue
            const imagen: BloqueTexto = {
                tipo: "imagen",
                alineacion: marco().alineacion,
                src,
                ancho: medida(atributos, "width"),
                alto: medida(atributos, "height"),
            }
            if (lista) {
                imagenesEnLista.push(imagen)
            } else {
                cerrarParrafo()
                bloques.push(imagen)
            }
            continue
        }
        if (etiqueta === "hr") {
            limiteDeBloque()
            continue
        }

        if (!cierre) {
            if (etiqueta === "ul" || etiqueta === "ol") {
                cerrarItem()
                if (!lista) {
                    cerrarParrafo()
                    lista = { tipo: "lista", ordenada: etiqueta === "ol", items: [] }
                    bloques.push(lista)
                }
                nivelLista++
            } else if (etiqueta === "li") {
                cerrarItem()
                if (lista) item = { tramos: [], nivel: Math.max(nivelLista, 0) }
            } else if (BLOQUES.has(etiqueta)) {
                limiteDeBloque()
            }
            if (!VACIAS.has(etiqueta) && !atributos.trim().endsWith("/")) marcos.push(marcoHijo(marco(), etiqueta, atributos))
            continue
        }

        const indice = marcos.findLastIndex((abierto, posicion) => posicion > 0 && abierto.etiqueta === etiqueta)
        if (indice > 0) marcos.length = indice

        if (etiqueta === "li") {
            cerrarItem()
        } else if ((etiqueta === "ul" || etiqueta === "ol") && lista) {
            cerrarItem()
            nivelLista--
            if (nivelLista < 0) {
                lista = null
                bloques.push(...imagenesEnLista)
                imagenesEnLista = []
            }
        } else if (BLOQUES.has(etiqueta)) {
            limiteDeBloque()
        }
    }

    cerrarItem()
    cerrarParrafo()
    bloques.push(...imagenesEnLista)

    const conContenido = (bloque: BloqueTexto) =>
        bloque.tipo === "imagen" || (bloque.tipo === "parrafo" ? bloque.tramos.length > 0 : bloque.items.length > 0)
    const inicio = bloques.findIndex(conContenido)
    const fin = bloques.findLastIndex(conContenido)
    return inicio === -1 ? [] : bloques.slice(inicio, fin + 1).filter((bloque) => bloque.tipo !== "lista" || bloque.items.length > 0)
}
