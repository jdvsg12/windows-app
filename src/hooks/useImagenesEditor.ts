"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"

import { processLogoFile } from "@/lib/logo"

// Imágenes de referencia de la descripción de la cotización: se reducen a 600 px en JPEG porque
// viven dentro del proyecto y de cada versión del PDF guardada en el navegador.
const TAMANO_IMAGEN = 600
export const MAX_IMAGENES_EDITOR = 6
// Una imagen embebida que llega pegada como HTML (sin pasar por la reducción) y pesa más que esto
// llenaría el almacenamiento; el doble de lo que deja processLogoFile basta para cualquier reducida.
const MAX_SRC_PEGADO = 1024 * 1024
const IMAGEN_EMBEBIDA = /^data:image\/(?:png|jpe?g);base64,/i

const esImagen = (archivo: File) => archivo.type.startsWith("image/")

export function useImagenesEditor(editorRef: React.RefObject<HTMLDivElement | null>, onCambio: () => void) {
    const [error, setError] = useState<string | null>(null)
    const seleccion = useRef<Range | null>(null)

    // El botón "Insertar imagen" quita el foco del editor: se recuerda dónde estaba el cursor.
    const guardarSeleccion = useCallback(() => {
        const actual = window.getSelection()
        if (actual && actual.rangeCount > 0 && editorRef.current?.contains(actual.anchorNode)) {
            seleccion.current = actual.getRangeAt(0).cloneRange()
        }
    }, [editorRef])

    const restaurarSeleccion = useCallback((editor: HTMLDivElement) => {
        const rango = seleccion.current && editor.contains(seleccion.current.startContainer) ? seleccion.current : document.createRange()
        if (rango !== seleccion.current) {
            rango.selectNodeContents(editor)
            rango.collapse(false)
        }
        const actual = window.getSelection()
        actual?.removeAllRanges()
        actual?.addRange(rango)
    }, [])

    const insertar = useCallback(
        async (archivos: readonly File[]) => {
            const editor = editorRef.current
            if (!editor) return
            const libres = MAX_IMAGENES_EDITOR - editor.querySelectorAll("img").length
            const aceptadas = archivos.slice(0, Math.max(libres, 0))
            let mensaje = aceptadas.length < archivos.length ? `La descripción admite hasta ${MAX_IMAGENES_EDITOR} imágenes.` : null

            const etiquetas: string[] = []
            for (const archivo of aceptadas) {
                const resultado = await processLogoFile(archivo, "La imagen", TAMANO_IMAGEN, true)
                if ("error" in resultado) {
                    mensaje = resultado.error
                    continue
                }
                etiquetas.push(`<img src="${resultado.dataUrl}" width="${resultado.width}" height="${resultado.height}" alt="Imagen de referencia">`)
            }
            setError(mensaje)
            if (etiquetas.length === 0) return

            editor.focus()
            restaurarSeleccion(editor)
            document.execCommand("insertHTML", false, etiquetas.join(""))
            guardarSeleccion()
            onCambio()
        },
        [editorRef, guardarSeleccion, onCambio, restaurarSeleccion],
    )

    // Lo pegado como HTML (una página web, otro documento) trae imágenes que el PDF no puede usar:
    // externas (sin red no cargan) o embebidas sin reducir. Se quitan del editor con un aviso.
    const quitarImagenesNoValidas = useCallback(() => {
        const editor = editorRef.current
        if (!editor) return
        const invalidas = [...editor.querySelectorAll("img")].filter((imagen) => {
            const src = imagen.getAttribute("src") ?? ""
            return !IMAGEN_EMBEBIDA.test(src) || src.length > MAX_SRC_PEGADO
        })
        if (invalidas.length === 0) return
        invalidas.forEach((imagen) => imagen.remove())
        setError("Esa imagen no se pudo agregar así. Guárdala en el equipo y usa «Insertar imagen», o cópiala sola y pégala.")
    }, [editorRef])

    const handlePegar = useCallback(
        (evento: React.ClipboardEvent<HTMLDivElement>) => {
            const archivos = [...evento.clipboardData.files].filter(esImagen)
            if (archivos.length === 0) return
            evento.preventDefault()
            guardarSeleccion()
            void insertar(archivos)
        },
        [guardarSeleccion, insertar],
    )

    const handleSoltar = useCallback(
        (evento: React.DragEvent<HTMLDivElement>) => {
            const archivos = [...evento.dataTransfer.files].filter(esImagen)
            if (archivos.length === 0) return
            evento.preventDefault()
            seleccion.current = document.caretRangeFromPoint?.(evento.clientX, evento.clientY) ?? null
            void insertar(archivos)
        },
        [insertar],
    )

    const handleArchivo = useCallback(
        (evento: React.ChangeEvent<HTMLInputElement>) => {
            const archivos = [...(evento.target.files ?? [])].filter(esImagen)
            evento.target.value = ""
            if (archivos.length > 0) void insertar(archivos)
        },
        [insertar],
    )

    return { error, guardarSeleccion, quitarImagenesNoValidas, handlePegar, handleSoltar, handleArchivo }
}
