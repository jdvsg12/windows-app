import { useEffect, useState } from "react"

export function useSaveFeedback(durationMs = 2000) {
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!saved) return
        const timeoutId = setTimeout(() => setSaved(false), durationMs)
        return () => clearTimeout(timeoutId)
    }, [saved, durationMs])

    const markSaved = () => setSaved(true)

    return { saved, markSaved }
}
