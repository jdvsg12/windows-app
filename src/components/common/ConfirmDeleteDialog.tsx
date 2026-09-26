"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ConfirmDeleteDialogProps {
    title: string
    description: string
    confirmLabel: string
    triggerLabel: string
    triggerSize?: "sm" | "icon"
    onConfirm: () => void
}

export function ConfirmDeleteDialog({
    title,
    description,
    confirmLabel,
    triggerLabel,
    triggerSize = "icon",
    onConfirm,
}: ConfirmDeleteDialogProps) {
    const [open, setOpen] = useState(false)

    const handleConfirm = () => {
        onConfirm()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size={triggerSize}
                    className="text-destructive hover:text-destructive"
                    aria-label={triggerLabel}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
