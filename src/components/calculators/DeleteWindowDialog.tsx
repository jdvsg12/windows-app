"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface Props {
    windowName: string
    onConfirm: () => void
}

export function DeleteWindowDialog({ windowName, onConfirm }: Props) {
    const [open, setOpen] = useState(false)

    const handleConfirm = () => {
        onConfirm()
        setOpen(false)
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                        <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
                            Eliminar Ventana
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-sm text-muted-foreground">
                            ¿Estás seguro de que deseas eliminar la ventana &ldquo;{windowName}&rdquo;? Esta acción no se puede deshacer.
                        </DialogPrimitive.Description>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <DialogPrimitive.Close asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogPrimitive.Close>
                        <Button variant="destructive" onClick={handleConfirm}>
                            Eliminar Ventana
                        </Button>
                    </div>
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
