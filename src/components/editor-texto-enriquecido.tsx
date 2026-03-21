"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, AlignCenter, AlignLeft, AlignRight } from "lucide-react"

interface EditorTextoEnriquecidoProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function EditorTextoEnriquecido({ value, onChange, placeholder }: EditorTextoEnriquecidoProps) {
    const editorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    const ejecutarComando = (comando: string, valor?: string) => {
        document.execCommand(comando, false, valor)
        editorRef.current?.focus()
        handleInput()
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="flex gap-1 p-2 border-b bg-muted/50">
                <Button type="button" variant="ghost" size="sm" onClick={() => ejecutarComando("bold")} title="Negrita">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => ejecutarComando("italic")} title="Cursiva">
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => ejecutarComando("insertUnorderedList")}
                    title="Lista con viñetas"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => ejecutarComando("insertOrderedList")}
                    title="Lista numerada"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => ejecutarComando("justifyLeft")}
                    title="Alinear a la izquierda"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => ejecutarComando("justifyCenter")}
                    title="Centrar"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => ejecutarComando("justifyRight")}
                    title="Alinear a la derecha"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="min-h-[200px] p-4 focus:outline-none"
                data-placeholder={placeholder}
                style={{
                    whiteSpace: "pre-wrap",
                }}
            />
            <style dangerouslySetInnerHTML={{
              __html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `
            }} />
        </div>
    )
}
