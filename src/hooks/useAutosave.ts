import { useEffect, useRef, useState } from "react"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

interface UseAutosaveOptions<T> {
    value: T
    // false (or a promise of false) = not saved: the indicator shows the error.
    onSave: (value: T) => boolean | void | Promise<boolean | void>
    delayMs?: number
    enabled?: boolean
}

// Debounced autosave for a form watched with react-hook-form's `form.watch()`.
// Compares by JSON content, not by object identity or call count: `watch()` can emit
// several times right after mount as each field registers (even with unchanged
// content), and once more right after our own save (the `values` prop resyncing) —
// a naive "skip the first call" guard lets one of those phantom emissions through as
// a real save. Tracking the last content we actually processed skips all of them.
export function useAutosave<T>({ value, onSave, delayMs = 600, enabled = true }: UseAutosaveOptions<T>): AutosaveStatus {
    const [status, setStatus] = useState<AutosaveStatus>("idle")
    const serialized = JSON.stringify(value)
    const lastSerializedRef = useRef(serialized)
    const onSaveRef = useRef(onSave)
    onSaveRef.current = onSave
    // Lo que espera el debounce. Si el formulario se desmonta antes (cambiar de pestaña), se
    // guarda en ese momento: cancelarlo perdía lo último que se escribió.
    const pendienteRef = useRef<{ value: T; serialized: string } | null>(null)
    // Only the latest save may set the status: an older one resolving late must not turn a
    // "saving" back into "saved".
    const ultimoGuardadoRef = useRef(0)

    useEffect(() => {
        if (!enabled || serialized === lastSerializedRef.current) {
            pendienteRef.current = null
            return
        }

        pendienteRef.current = { value, serialized }
        setStatus("saving")
        const timeoutId = setTimeout(() => {
            // Marked only once it is really saved: a save cancelled by a newer edit (or by the
            // form turning invalid) must not make the same content look already saved later.
            lastSerializedRef.current = serialized
            pendienteRef.current = null
            const guardado = ++ultimoGuardadoRef.current
            Promise.resolve(onSaveRef.current(value)).then(
                (result) => {
                    if (guardado === ultimoGuardadoRef.current) setStatus(result === false ? "error" : "saved")
                },
                () => {
                    if (guardado === ultimoGuardadoRef.current) setStatus("error")
                },
            )
        }, delayMs)

        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serialized, enabled, delayMs])

    useEffect(
        () => () => {
            const pendiente = pendienteRef.current
            if (!pendiente) return
            lastSerializedRef.current = pendiente.serialized
            pendienteRef.current = null
            void onSaveRef.current(pendiente.value)
        },
        [],
    )

    return status
}
