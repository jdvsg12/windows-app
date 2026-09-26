"use client"

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"

interface DeleteWindowDialogProps {
    windowName: string
    onConfirm: () => void
}

export function DeleteWindowDialog({ windowName, onConfirm }: DeleteWindowDialogProps) {
    return (
        <ConfirmDeleteDialog
            title="Eliminar Ventana"
            description={`¿Estás seguro de que deseas eliminar la ventana “${windowName}”? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar Ventana"
            triggerLabel={`Eliminar ventana ${windowName}`}
            triggerSize="sm"
            onConfirm={onConfirm}
        />
    )
}
