"use client"

import { Fragment, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, AlignCenter, AlignLeft, AlignRight, ImagePlus, type LucideIcon } from "lucide-react"
import { MAX_IMAGENES_EDITOR, useImagenesEditor } from "@/hooks/useImagenesEditor"

interface EditorTextoEnriquecidoProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    id?: string
    ariaLabel?: string
}

interface BotonFormato {
    comando: string
    titulo: string
    Icono: LucideIcon
    separadorAntes?: boolean
}

const BOTONES: readonly BotonFormato[] = [
    { comando: "bold", titulo: "Negrita", Icono: Bold },
    { comando: "italic", titulo: "Cursiva", Icono: Italic },
    { comando: "insertUnorderedList", titulo: "Lista con viñetas", Icono: List },
    { comando: "insertOrderedList", titulo: "Lista numerada", Icono: ListOrdered },
    { comando: "justifyLeft", titulo: "Alinear a la izquierda", Icono: AlignLeft, separadorAntes: true },
    { comando: "justifyCenter", titulo: "Centrar", Icono: AlignCenter },
    { comando: "justifyRight", titulo: "Alinear a la derecha", Icono: AlignRight },
]

export function EditorTextoEnriquecido({ value, onChange, placeholder, id, ariaLabel }: EditorTextoEnriquecidoProps) {
    const editorRef = useRef<HTMLDivElement>(null)
    const archivoRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    const emitirCambio = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    const imagenes = useImagenesEditor(editorRef, emitirCambio)

    const handleInput = () => {
        imagenes.quitarImagenesNoValidas()
        emitirCambio()
    }

    const ejecutarComando = (comando: string, valor?: string) => {
        document.execCommand(comando, false, valor)
        editorRef.current?.focus()
        handleInput()
    }

    return (
        <div>
            <div className="border rounded-lg overflow-hidden">
                <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                    {BOTONES.map(({ comando, titulo, Icono, separadorAntes }) => (
                        <Fragment key={comando}>
                            {separadorAntes && <div className="w-px h-6 bg-border mx-1" />}
                            <Button type="button" variant="ghost" size="sm" onClick={() => ejecutarComando(comando)} title={titulo} aria-label={titulo}>
                                <Icono className="h-4 w-4" />
                            </Button>
                        </Fragment>
                    ))}
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => archivoRef.current?.click()}
                        title="Insertar imagen"
                        aria-label="Insertar imagen"
                    >
                        <ImagePlus className="h-4 w-4" />
                    </Button>
                    <input
                        ref={archivoRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        aria-label="Archivo de imagen para la descripción"
                        onChange={imagenes.handleArchivo}
                    />
                </div>
                <div
                    ref={editorRef}
                    id={id}
                    contentEditable
                    role="textbox"
                    aria-multiline="true"
                    aria-label={ariaLabel || placeholder || "Editor de texto enriquecido"}
                    onInput={handleInput}
                    onBlur={imagenes.guardarSeleccion}
                    onPaste={imagenes.handlePegar}
                    onDrop={imagenes.handleSoltar}
                    className="min-h-[200px] p-4 focus:outline-none [&_img]:inline-block [&_img]:h-auto [&_img]:max-h-[200px] [&_img]:max-w-full [&_img]:w-auto"
                    data-placeholder={placeholder}
                    style={{
                        whiteSpace: "pre-wrap",
                    }}
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
        }
      `
                }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                Pega, arrastra o inserta imágenes de referencia (hasta {MAX_IMAGENES_EDITOR}); salen en la vista previa y en el PDF.
            </p>
            {imagenes.error && <p role="alert" className="text-sm text-destructive mt-1">{imagenes.error}</p>}
        </div>
    )
}
