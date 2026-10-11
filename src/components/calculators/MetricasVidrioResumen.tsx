import { formatArea, formatMeters, formatPercent } from "@/lib/format"
import type { MetricasVidrio } from "@/lib/calculo/vidrio"

interface MetricasVidrioResumenProps {
    metricas: MetricasVidrio
}

export function MetricasVidrioResumen({ metricas }: MetricasVidrioResumenProps) {
    const items = [
        { label: "Piezas", value: String(metricas.piezas) },
        { label: "Área neta", value: formatArea(metricas.areaNetaM2, 3) },
        { label: "Bordeado", value: formatMeters(metricas.bordeadoM, 3) },
        { label: "Cantos", value: String(metricas.cantos) },
        {
            label: "Merma",
            value: metricas.mermaPct === null ? "—" : formatPercent(metricas.mermaPct),
            hint: "sin la última lámina de cada tipo",
        },
    ]

    return (
        <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {items.map(({ label, value, hint }) => (
                <div key={label} className="rounded-md border px-3 py-2">
                    <dt className="text-caption text-muted-foreground">{label}</dt>
                    <dd className="font-semibold tabular-nums">{value}</dd>
                    {hint && <dd className="text-caption text-muted-foreground">{hint}</dd>}
                </div>
            ))}
        </dl>
    )
}
