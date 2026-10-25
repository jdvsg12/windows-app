import { Card, CardContent } from "@/components/ui/card"

interface ErroresPuertasProps {
    errores: readonly string[]
}

// Una puerta que no se puede fabricar con los descuentos actuales: se dice cuál y qué pieza falla.
export function ErroresPuertas({ errores }: ErroresPuertasProps) {
    if (errores.length === 0) return null
    return (
        <Card className="border-destructive">
            <CardContent className="pt-6 space-y-1 text-sm text-destructive" role="alert">
                {errores.map((error) => (
                    <p key={error}>{error}</p>
                ))}
                <p>Corrige las medidas de la puerta o los descuentos en Admin → Puerta Alumina.</p>
            </CardContent>
        </Card>
    )
}
