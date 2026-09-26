"use client"

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"

interface DeleteProjectDialogProps {
    projectName: string
    onConfirm: () => void
}

export function DeleteProjectDialog({ projectName, onConfirm }: DeleteProjectDialogProps) {
    return (
        <ConfirmDeleteDialog
            title="Eliminar Proyecto"
            description={`¿Estás seguro de que deseas eliminar el proyecto “${projectName}”? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar Proyecto"
            triggerLabel={`Eliminar proyecto ${projectName}`}
            onConfirm={onConfirm}
        />
    )
}
