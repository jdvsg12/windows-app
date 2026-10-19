"use client"

import { useCallback, useMemo } from "react"

import type { DocumentoCotizacion, Proyecto } from "@/lib/types"
import { marcarGuardada, quitarGuardada, registrarVersion } from "@/lib/versiones-cotizacion"

// Las versiones viven en el proyecto: se borran con él y pasarán a IndexedDB junto con él.
export function useVersionesCotizacion(proyecto: Proyecto | null, update: (cambios: Partial<Proyecto>) => void) {
    const versiones = useMemo(() => proyecto?.versionesCotizacion ?? [], [proyecto])

    const registrar = useCallback(
        (documento: DocumentoCotizacion) =>
            update({ versionesCotizacion: registrarVersion(versiones, documento, crypto.randomUUID(), new Date().toISOString()) }),
        [versiones, update],
    )
    const guardar = useCallback((id: string) => update({ versionesCotizacion: marcarGuardada(versiones, id) }), [versiones, update])
    const soltar = useCallback(() => update({ versionesCotizacion: quitarGuardada(versiones) }), [versiones, update])

    return { versiones, registrar, guardar, soltar }
}
