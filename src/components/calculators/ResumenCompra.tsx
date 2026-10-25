"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ResumenCompraProps {
    barras: number
    accesorios: number
    laminas: number
    texto: string
}

interface CifraProps {
    valor: number
    etiqueta: string
}

function Cifra({ valor, etiqueta }: CifraProps) {
    return (
        <div>
            <div className="text-4xl font-bold leading-none tabular-nums">{valor}</div>
            <div className="mt-1.5 text-sm text-primary-foreground/80">{etiqueta}</div>
        </div>
    )
}

// Totales de lo que hay que comprar y la lista en texto para mandar al proveedor.
export function ResumenCompra({ barras, accesorios, laminas, texto }: ResumenCompraProps) {
    const [copiada, setCopiada] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!copiada) return
        const id = setTimeout(() => setCopiada(false), 2500)
        return () => clearTimeout(id)
    }, [copiada])

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(texto)
            setError(false)
            setCopiada(true)
        } catch {
            setError(true)
        }
    }

    return (
        <section aria-labelledby="resumen-compra" className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-primary px-6 py-6 text-primary-foreground sm:px-7">
            <div className="min-w-[200px]">
                <h2 id="resumen-compra" className="text-xl font-semibold">
                    Lo que hay que comprar
                </h2>
                <p className="mt-1 text-sm text-primary-foreground/80">Se actualiza cada vez que agregas o cambias una ventana o puerta.</p>
            </div>
            <div className="flex flex-wrap gap-10">
                <Cifra valor={barras} etiqueta="barras de 6 m" />
                <Cifra valor={accesorios} etiqueta="tipos de accesorio" />
                <Cifra valor={laminas} etiqueta={laminas === 1 ? "lámina de vidrio" : "láminas de vidrio"} />
            </div>
            <div className="flex flex-col items-start gap-1">
                <Button
                    type="button"
                    variant="outline"
                    onClick={copiar}
                    className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                    {copiada ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copiada ? "Lista copiada" : "Copiar lista para el proveedor"}
                </Button>
                <span aria-live="polite" className="text-xs text-primary-foreground/80">
                    {error ? "No se pudo copiar: el navegador no dio permiso." : ""}
                </span>
            </div>
        </section>
    )
}
