import { useEffect, useRef, useState } from "react"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

interface UseAutosaveOptions<T> {
    value: T
    onSave: (value: T) => boolean | void
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

    useEffect(() => {
        if (!enabled || serialized === lastSerializedRef.current) return
        lastSerializedRef.current = serialized

        setStatus("saving")
        const timeoutId = setTimeout(() => {
            const result = onSaveRef.current(value)
            setStatus(result === false ? "error" : "saved")
        }, delayMs)

        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serialized, enabled, delayMs])

    return status
}
